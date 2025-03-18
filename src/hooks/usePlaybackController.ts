
import { useEffect } from "react";
import { Song, getRandomSong } from "@/utils/audioUtils";
import { toast } from "sonner";

export function usePlaybackController(
  audio: HTMLAudioElement,
  isPlaying: boolean,
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  currentSong: Song | null,
  setCurrentSong: React.Dispatch<React.SetStateAction<Song | null>>,
  playlist: Song[],
  iframeRef: React.MutableRefObject<HTMLIFrameElement | null>,
  shuffleMode: boolean,
  loopMode: boolean,
  startRotationAnimation: () => void,
  stopRotationAnimation: () => void,
  playYouTubeVideo: (iframeRef: React.MutableRefObject<HTMLIFrameElement | null>) => void,
  pauseYouTubeVideo: (iframeRef: React.MutableRefObject<HTMLIFrameElement | null>) => void,
  stopYouTubeVideo: (iframeRef: React.MutableRefObject<HTMLIFrameElement | null>) => void
) {
  useEffect(() => {
    // Set up event listeners for audio element
    audio.addEventListener('ended', handleSongEnd);

    return () => {
      audio.removeEventListener('ended', handleSongEnd);
      audio.pause();
    };
  }, [audio, playlist, currentSong, shuffleMode, loopMode]);

  const handleSongEnd = () => {
    if (!currentSong || playlist.length === 0) {
      setIsPlaying(false);
      stopRotationAnimation();
      return;
    }

    const currentIndex = playlist.findIndex(song => 
      song.url === currentSong.url);
    
    if (currentIndex === -1) {
      // If the current song isn't in the playlist anymore
      setIsPlaying(false);
      stopRotationAnimation();
      return;
    }

    let nextSong: Song | null = null;

    if (shuffleMode) {
      // Get a random song that's different from the current one
      nextSong = getRandomSong(playlist, currentSong);
    } else {
      // Play next song in playlist
      if (currentIndex < playlist.length - 1) {
        nextSong = playlist[currentIndex + 1];
      } else if (loopMode && playlist.length > 0) {
        // Loop back to the first song if loop mode is enabled
        nextSong = playlist[0];
      }
    }

    if (nextSong) {
      // Play the next song
      playSong(nextSong);
    } else {
      // If no next song (end of playlist and not looping)
      setIsPlaying(false);
      stopRotationAnimation();
    }
  };

  const handlePlayPause = () => {
    if (!currentSong && playlist.length > 0) {
      playSong(playlist[0]);
      return;
    }

    if (currentSong?.type === 'youtube') {
      if (isPlaying) {
        pauseYouTubeVideo(iframeRef);
        stopRotationAnimation();
      } else {
        playYouTubeVideo(iframeRef);
        startRotationAnimation();
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

  const playSong = (song: Song) => {
    // Stop current playback
    audio.pause();
    stopYouTubeVideo(iframeRef);
    
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

  return {
    handlePlayPause,
    playSong,
    handleSongEnd
  };
}
