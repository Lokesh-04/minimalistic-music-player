
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AddSongDialogProps {
  newSongUrl: string;
  setNewSongUrl: (url: string) => void;
  addSong: () => void;
}

export default function AddSongDialog({ newSongUrl, setNewSongUrl, addSong }: AddSongDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-10 h-10 
                          rounded-full bg-white/10 flex items-center justify-center 
                          text-player-text hover:bg-white/20 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-player-accent border-none text-player-text">
        <DialogHeader>
          <DialogTitle>Add Song</DialogTitle>
        </DialogHeader>
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
