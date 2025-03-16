
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import PlaylistDialog from "./PlaylistDialog";
import AddSongDialog from "./AddSongDialog";
import PlayerButton from "./PlayerButton";
import PlayerControls from "./PlayerControls";
import YouTubePlayer from "./YouTubePlayer";
import NowPlaying from "./NowPlaying";

export default function AudioPlayer() {
  const {
    isPlaying,
    currentSong,
    playlist,
    newSongUrl,
    setNewSongUrl,
    rotation,
    shuffleMode,
    loopMode,
    iframeRef,
    handlePlayPause,
    addSong,
    playSong,
    deleteSong,
    toggleShuffleMode,
    toggleLoopMode
  } = useAudioPlayer();

  return (
    <div className="min-h-screen bg-player-background flex flex-col items-center justify-center p-4 relative">
      <PlaylistDialog
        playlist={playlist}
        currentSong={currentSong}
        newSongUrl={newSongUrl}
        setNewSongUrl={setNewSongUrl}
        addSong={addSong}
        playSong={playSong}
        deleteSong={deleteSong}
      />

      <PlayerControls 
        shuffleMode={shuffleMode}
        loopMode={loopMode}
        onShuffleToggle={toggleShuffleMode}
        onLoopToggle={toggleLoopMode}
      />

      <div className="relative">
        {currentSong?.type === 'youtube' && currentSong.videoId && (
          <YouTubePlayer ref={iframeRef} videoId={currentSong.videoId} />
        )}
        
        <PlayerButton
          isPlaying={isPlaying}
          rotation={rotation}
          onClick={handlePlayPause}
        />
        
        <AddSongDialog
          newSongUrl={newSongUrl}
          setNewSongUrl={setNewSongUrl}
          addSong={addSong}
        />
      </div>

      <NowPlaying currentSong={currentSong} />
    </div>
  );
}
