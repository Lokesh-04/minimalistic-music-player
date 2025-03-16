import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Song, extractYoutubeVideoId, isYoutubeUrl, isVideoUrl, getRandomSong } from "@/utils/audioUtils";
import PlaylistDialog from "./PlaylistDialog";
import AddSongDialog from "./AddSongDialog";
import PlayerButton from "./PlayerButton";
import PlayerControls from "./PlayerControls";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [newSongUrl, setNewSongUrl] = useState("");
  const [audio] = useState(new Audio());
  const [rotation, setRotation] = useState(0);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [loopMode, setLoopMode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rotationIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up event listeners for audio element
    audio.addEventListener('ended', handleSongEnd);

    // Set up message listener for YouTube iframe events
    window.addEventListener('message', handleYouTubeMessage);

    return () => {
      audio.removeEventListener('ended', handleSongEnd);
      window.removeEventListener('message', handleYouTubeMessage);
      audio.pause();
      if (rotationIntervalRef.current) {
        window.clearInterval(rotationIntervalRef.current);
      }
    };
  }, []);

  // Function to handle YouTube iframe player state changes
  const handleYouTubeMessage = (event: MessageEvent) => {
    try {
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        // YouTube iframe API sends event when video ends (state = 0)
        if (data.event === 'onStateChange' && data.info === 0) {
          handleSongEnd();
        }
      }
    } catch (e) {
      // Not a parseable message or not from YouTube, ignore
    }
  };

  // Function to handle what happens when a song ends
  const handleSongEnd = () => {
    if (shuffleMode) {
      const nextSong = getRandomSong(playlist, currentSong);
      if (nextSong) {
        playSong(nextSong);
        return;
      }
    } else {
      const currentIndex = playlist.findIndex(song => 
        currentSong && song.url === currentSong.url);
      
      if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
        // Play next song in playlist
        playSong(playlist[currentIndex + 1]);
        return;
      } else if (loopMode && playlist.length > 0) {
        // Loop back to the first song if loop mode is enabled
        playSong(playlist[0]);
        return;
      }
    }
    
    // If we reach here, stop playback
    setIsPlaying(false);
    stopRotationAnimation();
  };

  const handlePlayPause = () => {
    if (!currentSong && playlist.length > 0) {
      playSong(playlist[0]);
      return;
    }

    if (currentSong?.type === 'youtube') {
      if (iframeRef.current) {
        if (isPlaying) {
          // @ts-ignore
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          stopRotationAnimation();
        } else {
          // @ts-ignore
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          startRotationAnimation();
        }
      }
    } else {
      if (isPlaying) {
        audio.pause();
        stopRotationAnimation();
      } else {
        audio.play()
          .catch(err => {
            console.error("Error playing audio:", err);
            toast.error("Failed to play this audio file");
          });
        startRotationAnimation();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const startRotationAnimation = () => {
    if (rotationIntervalRef.current) {
      window.clearInterval(rotationIntervalRef.current);
    }
    
    rotationIntervalRef.current = window.setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
  };

  const stopRotationAnimation = () => {
    if (rotationIntervalRef.current) {
      window.clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    }
  };

  const addSong = () => {
    if (!newSongUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      new URL(newSongUrl);
      let newSong: Song;

      if (isYoutubeUrl(newSongUrl)) {
        const videoId = extractYoutubeVideoId(newSongUrl);
        if (!videoId) {
          toast.error("Invalid YouTube URL");
          return;
        }
        newSong = {
          url: newSongUrl,
          title: "YouTube Video",
          type: 'youtube',
          videoId: videoId,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        };
      } else if (isVideoUrl(newSongUrl)) {
        newSong = {
          url: newSongUrl,
          title: new URL(newSongUrl).pathname.split("/").pop() || "Untitled Video",
          type: 'video'
        };
      } else {
        newSong = {
          url: newSongUrl,
          title: new URL(newSongUrl).pathname.split("/").pop() || "Untitled Audio",
          type: 'audio'
        };
      }
      
      setPlaylist([...playlist, newSong]);
      setNewSongUrl("");
      toast.success("Song added to playlist");
    } catch (e) {
      toast.error("Please enter a valid URL");
    }
  };

  const playSong = (song: Song) => {
    // Stop current playback
    audio.pause();
    if (iframeRef.current) {
      // @ts-ignore
      iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
    }
    
    setCurrentSong(song);
    
    if (song.type === 'youtube') {
      // YouTube will auto-play when the iframe loads with autoplay=1
      startRotationAnimation();
    } else {
      audio.src = song.url;
      audio.play()
        .catch(err => {
          console.error("Error playing audio:", err);
          toast.error("Failed to play this file");
        });
      startRotationAnimation();
    }
    setIsPlaying(true);
  };

  const deleteSong = (index: number) => {
    const newPlaylist = [...playlist];
    const deletedSong = newPlaylist[index];
    
    // Check if the deleted song is currently playing
    if (currentSong && currentSong.url === deletedSong.url) {
      audio.pause();
      if (iframeRef.current) {
        // @ts-ignore
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
      }
      setCurrentSong(null);
      setIsPlaying(false);
      stopRotationAnimation();
    }
    
    newPlaylist.splice(index, 1);
    setPlaylist(newPlaylist);
    toast.success("Song removed from playlist");
  };

  const toggleShuffleMode = () => {
    setShuffleMode(prev => !prev);
    toast.success(shuffleMode ? "Shuffle mode disabled" : "Shuffle mode enabled");
  };

  const toggleLoopMode = () => {
    setLoopMode(prev => !prev);
    toast.success(loopMode ? "Loop mode disabled" : "Loop mode enabled");
  };

  return (
    <div className="min-h-screen bg-player-background flex flex-col items-center justify-center p-4 relative">
      <PlaylistDialog
        playlist={playlist}
        currentSong={currentSong}
        newSongUrl={newSongUrl}
        setNewSongUrl={setNewSongUrl}
        addSong={addSong}
        playSong={playSong}
        deleteSong={deleteSong}
      />

      <PlayerControls 
        shuffleMode={shuffleMode}
        loopMode={loopMode}
        onShuffleToggle={toggleShuffleMode}
        onLoopToggle={toggleLoopMode}
      />

      <div className="relative">
        {currentSong?.type === 'youtube' && currentSong.videoId && (
          <div className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none">
            <iframe
              ref={iframeRef}
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${currentSong.videoId}?enablejsapi=1&controls=0&autoplay=1&playsinline=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video player"
            ></iframe>
          </div>
        )}
        
        <PlayerButton
          isPlaying={isPlaying}
          rotation={rotation}
          onClick={handlePlayPause}
        />
        
        <AddSongDialog
          newSongUrl={newSongUrl}
          setNewSongUrl={setNewSongUrl}
          addSong={addSong}
        />
      </div>

      {currentSong && (
        <p className="mt-4 text-player-text text-sm opacity-60">
          Now Playing: {currentSong.title}
        </p>
      )}
    </div>
  );
}
