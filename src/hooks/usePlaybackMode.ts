
import { useCallback } from "react";

export function usePlaybackMode(
  setShuffleMode: React.Dispatch<React.SetStateAction<boolean>>,
  setLoopMode: React.Dispatch<React.SetStateAction<boolean>>
) {
  const toggleShuffleMode = useCallback(() => {
    setShuffleMode(prev => !prev);
  }, [setShuffleMode]);

  const toggleLoopMode = useCallback(() => {
    setLoopMode(prev => !prev);
  }, [setLoopMode]);

  return {
    toggleShuffleMode,
    toggleLoopMode
  };
}
