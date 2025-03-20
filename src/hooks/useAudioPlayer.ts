
import { usePlayerState } from "./usePlayerState";
import { useRotationAnimation } from "./useRotationAnimation";
import { useYouTubePlayer } from "./useYouTubePlayer";
import { usePlaylistController } from "./usePlaylistController";
import { usePlaybackController } from "./usePlaybackController";
import { useSongTransition } from "./useSongTransition";
import { usePlaybackMode } from "./usePlaybackMode";
import { useAudioEvents } from "./useAudioEvents";
import { useCallback, useRef } from "react";

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

  const { playYouTubeVideo, pauseYouTubeVideo, stopYouTubeVideo } = useYouTubePlayer(() => {
    console.log("YouTube video ended callback triggered");
    handleSongEndRef.current();
  });

  // Use our song transition hook
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
  handleSongEndRef.current = handleSongEnd;

  // Use audio events hook to manage audio end event
  useAudioEvents(audio, () => handleSongEndRef.current());

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
