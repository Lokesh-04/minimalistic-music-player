
import { MutableRefObject } from "react";

export function useRotationAnimation(
  setRotation: (value: React.SetStateAction<number>) => void,
  rotationIntervalRef: MutableRefObject<number | null>
) {
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

  return {
    startRotationAnimation,
    stopRotationAnimation
  };
}
