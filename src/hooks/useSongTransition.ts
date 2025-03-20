
import { useCallback } from "react";
import { Song, getRandomSong } from "@/utils/audioUtils";
import { toast } from "sonner";

export function useSongTransition(
  audio: HTMLAudioElement,
  playlist: Song[],
  currentSong: Song | null,
  setCurrentSong: React.Dispatch<React.SetStateAction<Song | null>>,
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  startRotationAnimation: () => void,
  stopRotationAnimation: () => void,
  shuffleMode: boolean,
  loopMode: boolean,
  iframeRef: React.MutableRefObject<HTMLIFrameElement | null>
) {
  // Play a song
  const playSong = useCallback((song: Song) => {
    console.log("Playing song:", song.title);
    
    // Stop current playback
    audio.pause();
    
    // We need to use the YouTube player functions differently
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
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
  }, [audio, iframeRef, setCurrentSong, setIsPlaying, startRotationAnimation]);

  // Handle song end logic
  const handleSongEnd = useCallback(() => {
    console.log("Song ended, finding next song");
    
    if (!currentSong || playlist.length === 0) {
      console.log("No current song or empty playlist");
      setIsPlaying(false);
      stopRotationAnimation();
      return;
    }

    const currentIndex = playlist.findIndex(song => 
      song.url === currentSong.url);
    
    console.log("Current index:", currentIndex, "Playlist length:", playlist.length);
    
    if (currentIndex === -1) {
      // If the current song isn't in the playlist anymore
      console.log("Current song not found in playlist");
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

    console.log("Next song:", nextSong);

    if (nextSong) {
      // Play the next song with a small delay to avoid issues
      console.log("Will play next song:", nextSong.title);
      setTimeout(() => {
        playSong(nextSong!);
      }, 500);
    } else {
      // If no next song (end of playlist and not looping)
      console.log("No next song to play");
      setIsPlaying(false);
      stopRotationAnimation();
    }
  }, [currentSong, playlist, shuffleMode, loopMode, setIsPlaying, stopRotationAnimation, playSong]);

  return {
    playSong,
    handleSongEnd
  };
}
