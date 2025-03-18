
import { usePlayerState } from "./usePlayerState";
import { useRotationAnimation } from "./useRotationAnimation";
import { useYouTubePlayer } from "./useYouTubePlayer";
import { usePlaylistController } from "./usePlaylistController";
import { usePlaybackController } from "./usePlaybackController";
import { useCallback } from "react";
import { Song, getRandomSong } from "@/utils/audioUtils";
import { toast } from "sonner";

export function useAudioPlayer() {
  const playerState = usePlayerState();
  
  const { 
    isPlaying, setIsPlaying, 
    currentSong, setCurrentSong, 
    playlist, setPlaylist,
    newSongUrl, setNewSongUrl,
    audio, rotation, shuffleMode, loopMode,
    iframeRef, rotationIntervalRef
  } = playerState;

  const { startRotationAnimation, stopRotationAnimation } = useRotationAnimation(
    playerState.setRotation,
    rotationIntervalRef
  );

  // Define handleSongEnd first as a callback
  const handleSongEnd = useCallback(() => {
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
  }, [currentSong, playlist, shuffleMode, loopMode, setIsPlaying, stopRotationAnimation]);

  // Now we can use handleSongEnd as a parameter
  const { playYouTubeVideo, pauseYouTubeVideo, stopYouTubeVideo } = useYouTubePlayer(handleSongEnd);

  // Define playSong inside the hook
  const playSong = useCallback((song: Song) => {
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
  }, [audio, iframeRef, setCurrentSong, setIsPlaying, startRotationAnimation, stopYouTubeVideo]);

  // Use playbackController
  const { handlePlayPause } = usePlaybackController(
    audio,
    isPlaying,
    setIsPlaying,
    currentSong,
    setCurrentSong,
    playlist,
    iframeRef,
    shuffleMode,
    loopMode,
    startRotationAnimation,
    stopRotationAnimation,
    playYouTubeVideo,
    pauseYouTubeVideo,
    stopYouTubeVideo,
    playSong,
    handleSongEnd
  );

  // Use playlistController
  const { addSong, deleteSong } = usePlaylistController(
    playlist,
    setPlaylist,
    newSongUrl,
    setNewSongUrl,
    setCurrentSong,
    setIsPlaying,
    audio,
    stopYouTubeVideo,
    iframeRef,
    stopRotationAnimation
  );

  const toggleShuffleMode = useCallback(() => {
    playerState.setShuffleMode(prev => !prev);
  }, [playerState]);

  const toggleLoopMode = useCallback(() => {
    playerState.setLoopMode(prev => !prev);
  }, [playerState]);

  return {
    isPlaying,
    currentSong,
    playlist,
    newSongUrl,
    setNewSongUrl,
    rotation,
    shuffleMode,
    loopMode,
    iframeRef,
    handlePlayPause,
    addSong,
    playSong,
    deleteSong,
    toggleShuffleMode,
    toggleLoopMode
  };
}
