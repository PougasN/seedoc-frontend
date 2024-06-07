import React, { useRef } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';

const VideoPlayer = () => {
  const { videoUrl } = useParams();
  const playerRef = useRef(null);
  const navigate = useNavigate();

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (playerRef.current.isPlaying()) {
        playerRef.current.getInternalPlayer().pause();
      } else {
        playerRef.current.getInternalPlayer().play();
      }
    }
  };

  const handleForward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
    }
  };

  const handleRewind = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
    }
  };

  const handleFrameForward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() + 1 / 5);
    }
  };

  const handleFrameBackward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() - 1 / 5);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <ReactPlayer
        ref={playerRef}
        url={decodeURIComponent(videoUrl)}
        controls
        width="80%"
        height="400px"
      />
      <div style={{ marginTop: '20px' }}>
        <button onClick={handlePlayPause}>Play/Pause</button>
        <button onClick={handleForward}>Forward 10s</button>
        <button onClick={handleRewind}>Rewind 10s</button>
        <button onClick={handleFrameForward}>Frame Forward</button>
        <button onClick={handleFrameBackward}>Frame Backward</button>
      </div>
    </div>
  );
};

export default VideoPlayer;
