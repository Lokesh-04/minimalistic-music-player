
import { useState } from "react";
import { toast } from "sonner";
import { Song, isYoutubeUrl, extractYoutubeVideoId, isVideoUrl } from "@/utils/audioUtils";

export function usePlaylistController(
  playlist: Song[],
  setPlaylist: React.Dispatch<React.SetStateAction<Song[]>>,
  newSongUrl: string,
  setNewSongUrl: React.Dispatch<React.SetStateAction<string>>,
  setCurrentSong: React.Dispatch<React.SetStateAction<Song | null>>,
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  audio: HTMLAudioElement,
  stopYouTubeVideo: (iframeRef: React.MutableRefObject<HTMLIFrameElement | null>) => void,
  iframeRef: React.MutableRefObject<HTMLIFrameElement | null>,
  stopRotationAnimation: () => void
) {
  const addSong = () => {
    if (!newSongUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      new URL(newSongUrl);
      let newSong: Song;

      if (isYoutubeUrl(newSongUrl)) {
        const videoId = extractYoutubeVideoId(newSongUrl);
        if (!videoId) {
          toast.error("Invalid YouTube URL");
          return;
        }
        newSong = {
          url: newSongUrl,
          title: "YouTube Video",
          type: 'youtube',
          videoId: videoId,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        };
      } else if (isVideoUrl(newSongUrl)) {
        newSong = {
          url: newSongUrl,
          title: new URL(newSongUrl).pathname.split("/").pop() || "Untitled Video",
          type: 'video'
        };
      } else {
        newSong = {
          url: newSongUrl,
          title: new URL(newSongUrl).pathname.split("/").pop() || "Untitled Audio",
          type: 'audio'
        };
      }
      
      setPlaylist([...playlist, newSong]);
      setNewSongUrl("");
      toast.success("Song added to playlist");
    } catch (e) {
      toast.error("Please enter a valid URL");
    }
  };

  const deleteSong = (index: number) => {
    const newPlaylist = [...playlist];
    const deletedSong = newPlaylist[index];
    
    // Check if the deleted song is currently playing
    if (deletedSong && playlist[index]?.url === deletedSong.url) {
      audio.pause();
      stopYouTubeVideo(iframeRef);
      setCurrentSong(null);
      setIsPlaying(false);
      stopRotationAnimation();
    }
    
    newPlaylist.splice(index, 1);
    setPlaylist(newPlaylist);
    toast.success("Song removed from playlist");
  };

  return {
    addSong,
    deleteSong
  };
}
