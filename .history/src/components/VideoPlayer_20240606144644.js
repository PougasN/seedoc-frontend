import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';

const VideoPlayer = () => {
  const { videoUrl } = useParams();
  const playerRef = useRef(null);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
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
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <ReactPlayer
          ref={playerRef}
          url={decodeURIComponent(videoUrl)}
          playing={isPlaying}
          controls
          width="80%"
          height="1000px"
        />
        <div style={{ marginTop: '20px' }}>
          <button onClick={handlePlayPause} style={{ margin: '0 10px' }}>{isPlaying ? 'Pause' : 'Play'}</button>          
          <button onClick={handleRewind} style={{ margin: '0 10px' }}>Rewind 10s</button>
          <button onClick={handleForward} style={{ margin: '0 10px' }}>Forward 10s</button>          
          <button onClick={handleFrameBackward} style={{ margin: '0 10px' }}>Frame Backward</button>
          <button onClick={handleFrameForward} style={{ margin: '0 10px' }}>Frame Forward</button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
