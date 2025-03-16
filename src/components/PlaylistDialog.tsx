
import { List } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import PlaylistItem from "./PlaylistItem";
import { Song } from "@/utils/audioUtils";
import { toast } from "sonner";

interface PlaylistDialogProps {
  playlist: Song[];
  currentSong: Song | null;
  newSongUrl: string;
  setNewSongUrl: (url: string) => void;
  addSong: () => void;
  playSong: (song: Song) => void;
  deleteSong: (index: number) => void;
}

export default function PlaylistDialog({
  playlist,
  currentSong,
  newSongUrl,
  setNewSongUrl,
  addSong,
  playSong,
  deleteSong
}: PlaylistDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="absolute top-8 right-8 text-player-text hover:text-white transition-colors"
        >
          <List className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-player-accent border-none text-player-text max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-player-text">Playlist</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md">
          {playlist.length === 0 ? (
            <p className="text-player-muted text-center py-4">No songs in playlist</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2">
              {playlist.map((song, index) => (
                <PlaylistItem
                  key={index}
                  song={song}
                  index={index}
                  currentSong={currentSong}
                  onPlay={playSong}
                  onDelete={deleteSong}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={newSongUrl}
            onChange={(e) => setNewSongUrl(e.target.value)}
            placeholder="Enter audio, video or YouTube URL..."
            className="bg-black/20 border-none text-player-text placeholder:text-player-muted"
          />
          <Button onClick={addSong} variant="secondary" className="bg-white/10 hover:bg-white/20">
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
