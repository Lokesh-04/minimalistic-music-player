
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
