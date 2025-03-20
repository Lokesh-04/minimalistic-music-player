
import { useEffect, useRef } from "react";

export function useAudioEvents(
  audio: HTMLAudioElement,
  handleSongEnd: () => void
) {
  const handleSongEndRef = useRef<() => void>(() => {});

  // Store the current handleSongEnd in the ref to avoid closure issues
  useEffect(() => {
    handleSongEndRef.current = handleSongEnd;
  }, [handleSongEnd]);

  // Set up explicit event listener for audio ended event
  useEffect(() => {
    console.log("Setting up audio ended event listener");
    
    const handleAudioEnded = () => {
      console.log("Audio ended event fired");
      handleSongEndRef.current();
    };
    
    // Add the event listener - need to use a stable function reference
    audio.addEventListener('ended', handleAudioEnded);
    
    // Clean up on component unmount
    return () => {
      audio.removeEventListener('ended', handleAudioEnded);
    };
  }, [audio]); // Only re-run if audio object changes

  return null; // Don't need to return anything
}
