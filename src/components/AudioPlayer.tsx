
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Plus, List, Trash2, Music, Video } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";

interface Song {
  url: string;
  title: string;
  type: 'youtube' | 'audio' | 'video';
  videoId?: string;
  thumbnail?: string;
}

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [newSongUrl, setNewSongUrl] = useState("");
  const [audio] = useState(new Audio());
  const [rotation, setRotation] = useState(0);
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

    return () => {
      audio.removeEventListener('ended', handleSongEnd);
      audio.pause();
      if (rotationIntervalRef.current) {
        window.clearInterval(rotationIntervalRef.current);
      }
    };
  }, []);

  // Function to handle what happens when a song ends
  const handleSongEnd = () => {
    const currentIndex = playlist.findIndex(song => 
      currentSong && song.url === currentSong.url);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      playSong(playlist[currentIndex + 1]);
    } else {
      setIsPlaying(false);
      stopRotationAnimation();
    }
  };

  const extractYoutubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const isYoutubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const isVideoUrl = (url: string): boolean => {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension === 'mp4' || extension === 'webm' || extension === 'mov';
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
      // The iframe will be updated through the effect of currentSong change
      // We need to wait for the iframe to load before we can send messages to it
      setTimeout(() => {
        if (iframeRef.current) {
          // @ts-ignore
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }
      }, 1000);
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

  return (
    <div className="min-h-screen bg-player-background flex flex-col items-center justify-center p-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="absolute top-8 right-8 text-player-text hover:text-white transition-colors"
          >
            <List className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-player-accent border-none text-player-text max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-player-text">Playlist</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] w-full rounded-md">
            {playlist.length === 0 ? (
              <p className="text-player-muted text-center py-4">No songs in playlist</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2">
                {playlist.map((song, index) => (
                  <div
                    key={index}
                    className="relative p-3 hover:bg-black/20 rounded cursor-pointer transition-colors group glass-morphism"
                    onClick={() => playSong(song)}
                  >
                    <div className="flex flex-col items-center">
                      {song.type === 'youtube' && song.thumbnail ? (
                        <div className="w-full h-24 mb-2 overflow-hidden rounded">
                          <img 
                            src={song.thumbnail} 
                            alt={song.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : song.type === 'video' ? (
                        <Video className="w-12 h-12 mb-2 text-player-text" />
                      ) : (
                        <Music className="w-12 h-12 mb-2 text-player-text" />
                      )}
                      <p className="text-sm truncate max-w-full">{song.title}</p>
                      <span className="text-xs text-player-muted mt-1 capitalize">{song.type}</span>
                    </div>
                    <button 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-1 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSong(index);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              value={newSongUrl}
              onChange={(e) => setNewSongUrl(e.target.value)}
              placeholder="Enter audio, video or YouTube URL..."
              className="bg-black/20 border-none text-player-text placeholder:text-player-muted"
            />
            <Button onClick={addSong} variant="secondary" className="bg-white/10 hover:bg-white/20">
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative">
        {currentSong?.type === 'youtube' && currentSong.videoId && (
          <div className="absolute top-0 left-0 w-full h-full opacity-0">
            <iframe
              ref={iframeRef}
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${currentSong.videoId}?enablejsapi=1&controls=0&autoplay=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video player"
            ></iframe>
          </div>
        )}
        <button
          onClick={handlePlayPause}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-white/5 
                     flex items-center justify-center text-player-text hover:scale-105 
                     transition-all duration-300 shadow-lg hover:shadow-xl"
          style={{ 
            transform: isPlaying ? `rotate(${rotation}deg)` : 'none',
            transition: 'transform 0.1s linear'
          }}
        >
          {isPlaying ? (
            <Pause className="w-12 h-12" />
          ) : (
            <Play className="w-12 h-12 ml-2" />
          )}
        </button>
        
        <Dialog>
          <DialogTrigger asChild>
            <button className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-10 h-10 
                              rounded-full bg-white/10 flex items-center justify-center 
                              text-player-text hover:bg-white/20 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-player-accent border-none text-player-text">
            <DialogHeader>
              <DialogTitle>Add Song</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                value={newSongUrl}
                onChange={(e) => setNewSongUrl(e.target.value)}
                placeholder="Enter audio, video or YouTube URL..."
                className="bg-black/20 border-none text-player-text placeholder:text-player-muted"
              />
              <Button onClick={addSong} variant="secondary" className="bg-white/10 hover:bg-white/20">
                Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {currentSong && (
        <p className="mt-8 text-player-text text-sm opacity-60">
          Now Playing: {currentSong.title}
        </p>
      )}
    </div>
  );
}
