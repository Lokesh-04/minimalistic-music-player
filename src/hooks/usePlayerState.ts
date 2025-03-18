
import { useState, useRef } from "react";
import { Song } from "@/utils/audioUtils";

export function usePlayerState() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [newSongUrl, setNewSongUrl] = useState("");
  const [rotation, setRotation] = useState(0);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [loopMode, setLoopMode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rotationIntervalRef = useRef<number | null>(null);
  const [audio] = useState(new Audio());

  return {
    isPlaying,
    setIsPlaying,
    currentSong,
    setCurrentSong,
    playlist,
    setPlaylist,
    newSongUrl,
    setNewSongUrl,
    audio,
    rotation,
    setRotation,
    shuffleMode,
    setShuffleMode,
    loopMode,
    setLoopMode,
    iframeRef,
    rotationIntervalRef
  };
}
