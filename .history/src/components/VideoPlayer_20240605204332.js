import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';
import './VideoPlayer.css'; // Add some basic styling for the video player

const VideoPlayer = () => {
  const { videoUrl } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleForward = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10, 'seconds'); // Forward 10 seconds
  };

  const handleRewind = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10, 'seconds'); // Rewind 10 seconds
  };

  const handleFrameForward = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + 1 / 30, 'seconds'); // Assuming 30fps, move forward by one frame
  };

  const handleFrameBack = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - 1 / 30, 'seconds'); // Assuming 30fps, move backward by one frame
  };

  return (
    <div className="video-player">
      <button onClick={() => navigate(-1)}>Back</button>
      <ReactPlayer
        ref={playerRef}
        url={decodeURIComponent(videoUrl)}
        playing={isPlaying}
        controls
        width="640px" // Set the desired width
        height="360px" // Set the desired height
      />
      <div className="controls">
        <button onClick={handlePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={handleForward}>Forward 10s</button>
        <button onClick={handleRewind}>Rewind 10s</button>
        <button onClick={handleFrameForward}>Frame Forward</button>
        <button onClick={handleFrameBack}>Frame Back</button>
      </div>
    </div>
  );
};

export default VideoPlayer;
