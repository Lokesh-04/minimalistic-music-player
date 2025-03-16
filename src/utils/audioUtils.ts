
export interface Song {
  url: string;
  title: string;
  type: 'youtube' | 'audio' | 'video';
  videoId?: string;
  thumbnail?: string;
}

export const extractYoutubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const isYoutubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

export const isVideoUrl = (url: string): boolean => {
  const extension = url.split('.').pop()?.toLowerCase();
  return extension === 'mp4' || extension === 'webm' || extension === 'mov';
};

// Get a random item from the playlist
export const getRandomSong = (playlist: Song[], currentSong: Song | null): Song | null => {
  if (playlist.length === 0) return null;
  if (playlist.length === 1) return playlist[0];
  
  // Filter out current song to avoid playing the same song again
  const filteredPlaylist = currentSong 
    ? playlist.filter(song => song.url !== currentSong.url) 
    : playlist;
  
  // If there's only one song left after filtering, return that
  if (filteredPlaylist.length === 0) return playlist[0];
  
  // Get random song from filtered list
  const randomIndex = Math.floor(Math.random() * filteredPlaylist.length);
  return filteredPlaylist[randomIndex];
};
