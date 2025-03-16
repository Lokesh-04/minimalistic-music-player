
import { Music, Trash2, Video } from "lucide-react";
import { Song } from "@/utils/audioUtils";

interface PlaylistItemProps {
  song: Song;
  index: number;
  currentSong: Song | null;
  onPlay: (song: Song) => void;
  onDelete: (index: number) => void;
}

export default function PlaylistItem({ song, index, currentSong, onPlay, onDelete }: PlaylistItemProps) {
  return (
    <div
      className="relative p-3 hover:bg-black/20 rounded cursor-pointer transition-colors group glass-morphism"
      onClick={() => onPlay(song)}
    >
      <div className="flex flex-col items-center">
        {song.type === 'youtube' && song.thumbnail ? (
          <div className="w-full h-24 mb-2 overflow-hidden rounded">
            <img 
              src={song.thumbnail} 
              alt={song.title} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : song.type === 'video' ? (
          <Video className="w-12 h-12 mb-2 text-player-text" />
        ) : (
          <Music className="w-12 h-12 mb-2 text-player-text" />
        )}
        <p className="text-sm truncate max-w-full">{song.title}</p>
        <span className="text-xs text-player-muted mt-1 capitalize">{song.type}</span>
      </div>
      <button 
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-1 rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
      >
        <Trash2 className="w-4 h-4 text-red-400" />
      </button>
    </div>
  );
}
