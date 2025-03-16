
import { Song } from '@/utils/audioUtils';

interface NowPlayingProps {
  currentSong: Song | null;
}

export default function NowPlaying({ currentSong }: NowPlayingProps) {
  if (!currentSong) return null;
  
  return (
    <p className="mt-4 text-player-text text-sm opacity-60">
      Now Playing: {currentSong.title}
    </p>
  );
}
