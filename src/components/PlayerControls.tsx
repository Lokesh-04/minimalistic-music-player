
import { Shuffle, RepeatOne } from "lucide-react";
import { Toggle } from "./ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

interface PlayerControlsProps {
  shuffleMode: boolean;
  loopMode: boolean;
  onShuffleToggle: () => void;
  onLoopToggle: () => void;
}

export default function PlayerControls({
  shuffleMode,
  loopMode,
  onShuffleToggle,
  onLoopToggle
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center mt-4 gap-2">
      <ToggleGroup type="multiple" className="bg-player-background/30 rounded-full p-1">
        <ToggleGroupItem 
          value="shuffle" 
          aria-label="Toggle shuffle"
          pressed={shuffleMode}
          onClick={onShuffleToggle}
          className="h-8 w-8 p-0 data-[state=on]:bg-white/20 text-player-text rounded-full"
        >
          <Shuffle className="h-4 w-4" />
        </ToggleGroupItem>
        
        <ToggleGroupItem 
          value="loop" 
          aria-label="Toggle loop"
          pressed={loopMode}
          onClick={onLoopToggle}
          className="h-8 w-8 p-0 data-[state=on]:bg-white/20 text-player-text rounded-full"
        >
          <RepeatOne className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
