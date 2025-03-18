
import { MutableRefObject, useEffect } from "react";

export function useYouTubePlayer(handleSongEnd: () => void) {
  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up message listener for YouTube iframe events
    window.addEventListener('message', handleYouTubeMessage);

    return () => {
      window.removeEventListener('message', handleYouTubeMessage);
    };
  }, []);

  // Function to handle YouTube iframe player state changes
  const handleYouTubeMessage = (event: MessageEvent) => {
    try {
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        // YouTube iframe API sends event when video ends (state = 0)
        if (data.event === 'onStateChange' && data.info === 0) {
          handleSongEnd();
        }
      }
    } catch (e) {
      // Not a parseable message or not from YouTube, ignore
    }
  };

  const playYouTubeVideo = (iframeRef: MutableRefObject<HTMLIFrameElement | null>) => {
    if (iframeRef.current) {
      // @ts-ignore
      iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    }
  };

  const pauseYouTubeVideo = (iframeRef: MutableRefObject<HTMLIFrameElement | null>) => {
    if (iframeRef.current) {
      // @ts-ignore
      iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    }
  };

  const stopYouTubeVideo = (iframeRef: MutableRefObject<HTMLIFrameElement | null>) => {
    if (iframeRef.current) {
      // @ts-ignore
      iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
    }
  };

  return {
    playYouTubeVideo,
    pauseYouTubeVideo,
    stopYouTubeVideo
  };
}
