
/// <reference types="vite/client" />

interface YT {
  Player: any;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

interface Window {
  YT?: YT;
  onYouTubeIframeAPIReady?: () => void;
}
