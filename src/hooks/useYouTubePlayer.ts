
import { MutableRefObject, useEffect, useCallback } from "react";

export function useYouTubePlayer(onVideoEnd: () => void) {
  // Handle YouTube iframe player state changes
  const handleYouTubeMessage = useCallback((event: MessageEvent) => {
    try {
      // Check if the message is from YouTube
      if (event.origin.includes('youtube.com')) {
        console.log("Received YouTube message:", event.data);
      }
      
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          // YouTube iframe API sends event when video ends (state = 0)
          if (data.event === 'onStateChange' && data.info === 0) {
            console.log("YouTube video ended detected from postMessage");
            onVideoEnd();
          }
        } catch (e) {
          // Not a parseable message, try to check if it's a YouTube event in a different format
          if (event.data && typeof event.data === 'string') {
            if (event.data.includes('onStateChange') && event.data.includes('"data":"0"')) {
              console.log("YouTube video ended detected (alternative format)");
              onVideoEnd();
            }
          }
        }
      } else if (event.data && typeof event.data === 'object') {
        // Some YouTube events come as objects
        if (event.data.event === 'onStateChange' && event.data.data === 0) {
          console.log("YouTube video ended detected (object format)");
          onVideoEnd();
        }
      }
    } catch (e) {
      console.error("Error handling YouTube message:", e);
    }
  }, [onVideoEnd]);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Set up message listener for YouTube iframe events
    window.addEventListener('message', handleYouTubeMessage);

    return () => {
      window.removeEventListener('message', handleYouTubeMessage);
    };
  }, [handleYouTubeMessage]);

  const playYouTubeVideo = (iframeRef: MutableRefObject<HTMLIFrameElement | null>) => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } catch (e) {
        console.error("Error playing YouTube video:", e);
      }
    }
  };

  const pauseYouTubeVideo = (iframeRef: MutableRefObject<HTMLIFrameElement | null>) => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } catch (e) {
        console.error("Error pausing YouTube video:", e);
      }
    }
  };

  const stopYouTubeVideo = (iframeRef: MutableRefObject<HTMLIFrameElement | null>) => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
      } catch (e) {
        console.error("Error stopping YouTube video:", e);
      }
    }
  };

  return {
    playYouTubeVideo,
    pauseYouTubeVideo,
    stopYouTubeVideo
  };
}
