
import { forwardRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
}

const YouTubePlayer = forwardRef<HTMLIFrameElement, YouTubePlayerProps>(
  ({ videoId }, ref) => {
    return (
      <div className="absolute top-0 left-0 w-full h-full opacity-100 pointer-events-auto">
        <iframe
          ref={ref}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&autoplay=1&playsinline=1&origin=${window.location.origin}&rel=0&showinfo=0&modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        ></iframe>
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;
