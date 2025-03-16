
import { Play, Pause } from "lucide-react";

interface PlayerButtonProps {
  isPlaying: boolean;
  rotation: number;
  onClick: () => void;
}

export default function PlayerButton({ isPlaying, rotation, onClick }: PlayerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-white/5 
                 flex items-center justify-center text-player-text hover:scale-105 
                 transition-all duration-300 shadow-lg hover:shadow-xl"
      style={{ 
        transform: isPlaying ? `rotate(${rotation}deg)` : 'none',
        transition: 'transform 0.1s linear'
      }}
    >
      {isPlaying ? (
        <Pause className="w-12 h-12" />
      ) : (
        <Play className="w-12 h-12 ml-2" />
      )}
    </button>
  );
}
