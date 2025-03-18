
import { useEffect } from "react";
import { Song } from "@/utils/audioUtils";
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
  stopYouTubeVideo: (iframeRef: React.MutableRefObject<HTMLIFrameElement | null>) => void,
  playSong: (song: Song) => void,
  handleSongEnd: () => void
) {
  useEffect(() => {
    // Set up event listeners for audio element
    audio.addEventListener('ended', handleSongEnd);

    return () => {
      audio.removeEventListener('ended', handleSongEnd);
      audio.pause();
    };
  }, [audio, handleSongEnd]);

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

  return {
    handlePlayPause
  };
}
