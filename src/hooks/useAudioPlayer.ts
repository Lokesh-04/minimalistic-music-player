
import { usePlayerState } from "./usePlayerState";
import { useRotationAnimation } from "./useRotationAnimation";
import { useYouTubePlayer } from "./useYouTubePlayer";
import { usePlaylistController } from "./usePlaylistController";
import { usePlaybackController } from "./usePlaybackController";
import { useSongTransition } from "./useSongTransition";
import { usePlaybackMode } from "./usePlaybackMode";
import { useCallback, useEffect, useRef } from "react";
import { Song } from "@/utils/audioUtils";

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

  // Create a ref to store the handleSongEnd function to avoid circular dependencies
  const handleSongEndRef = useRef<() => void>(() => {});

  // Use our new hooks
  const { playSong, handleSongEnd } = useSongTransition(
    audio,
    playlist,
    currentSong,
    setCurrentSong,
    setIsPlaying,
    startRotationAnimation,
    stopRotationAnimation,
    shuffleMode,
    loopMode,
    iframeRef
  );

  // Store the current handleSongEnd in the ref
  useEffect(() => {
    handleSongEndRef.current = handleSongEnd;
  }, [handleSongEnd]);

  const { playYouTubeVideo, pauseYouTubeVideo, stopYouTubeVideo } = useYouTubePlayer(() => {
    console.log("YouTube video ended callback triggered");
    handleSongEndRef.current();
  });

  // Set up explicit event listener for audio ended event
  useEffect(() => {
    console.log("Setting up audio ended event listener");
    
    // Remove any existing listeners to avoid duplicates
    audio.removeEventListener('ended', () => handleSongEndRef.current());
    
    const handleAudioEnded = () => {
      console.log("Audio ended event fired");
      handleSongEndRef.current();
    };
    
    // Add the event listener
    audio.addEventListener('ended', handleAudioEnded);
    
    // Clean up on component unmount
    return () => {
      audio.removeEventListener('ended', handleAudioEnded);
    };
  }, [audio]);

  // Use playbackController with the now fully defined functions
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
    () => handleSongEndRef.current()
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

  // Use playback mode toggles
  const { toggleShuffleMode, toggleLoopMode } = usePlaybackMode(
    playerState.setShuffleMode,
    playerState.setLoopMode
  );

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
