
import { useState } from "react";
import { Play, Pause, Plus, List } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";

interface Song {
  url: string;
  title: string;
}

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [newSongUrl, setNewSongUrl] = useState("");
  const [audio] = useState(new Audio());

  const handlePlayPause = () => {
    if (!currentSong && playlist.length > 0) {
      setCurrentSong(playlist[0]);
      audio.src = playlist[0].url;
      audio.play();
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const addSong = () => {
    if (!newSongUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      new URL(newSongUrl);
      const newSong = {
        url: newSongUrl,
        title: new URL(newSongUrl).pathname.split("/").pop() || "Untitled",
      };
      
      setPlaylist([...playlist, newSong]);
      setNewSongUrl("");
      toast.success("Song added to playlist");
    } catch (e) {
      toast.error("Please enter a valid URL");
    }
  };

  return (
    <div className="min-h-screen bg-player-background flex flex-col items-center justify-center p-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="absolute top-8 right-8 text-player-text hover:text-white transition-colors"
          >
            <List className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-player-accent border-none text-player-text">
          <DialogHeader>
            <DialogTitle className="text-player-text">Playlist</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] w-full rounded-md">
            {playlist.length === 0 ? (
              <p className="text-player-muted text-center py-4">No songs in playlist</p>
            ) : (
              <div className="space-y-2">
                {playlist.map((song, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-black/20 rounded cursor-pointer transition-colors"
                    onClick={() => {
                      setCurrentSong(song);
                      audio.src = song.url;
                      audio.play();
                      setIsPlaying(true);
                    }}
                  >
                    {song.title}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              value={newSongUrl}
              onChange={(e) => setNewSongUrl(e.target.value)}
              placeholder="Enter audio URL..."
              className="bg-black/20 border-none text-player-text placeholder:text-player-muted"
            />
            <Button onClick={addSong} variant="secondary" className="bg-white/10 hover:bg-white/20">
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative">
        <button
          onClick={handlePlayPause}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-white/5 
                     flex items-center justify-center text-player-text hover:scale-105 
                     transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {isPlaying ? (
            <Pause className="w-12 h-12" />
          ) : (
            <Play className="w-12 h-12 ml-2" />
          )}
        </button>
        
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
                placeholder="Enter audio URL..."
                className="bg-black/20 border-none text-player-text placeholder:text-player-muted"
              />
              <Button onClick={addSong} variant="secondary" className="bg-white/10 hover:bg-white/20">
                Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {currentSong && (
        <p className="mt-8 text-player-text text-sm opacity-60">
          Now Playing: {currentSong.title}
        </p>
      )}
    </div>
  );
}
