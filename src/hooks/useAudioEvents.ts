
import { useEffect, useRef } from "react";
import { Song } from "@/utils/audioUtils";

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

  return {
    handleSongEndRef
  };
}
