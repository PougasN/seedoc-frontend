import React from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';

const VideoPlayer = () => {
  const { videoUrl } = useParams();

  return (
    <div>
      <button onClick={() => useNavigate("/patient")}>Back</button>
      <ReactPlayer url={decodeURIComponent(videoUrl)} controls />
    </div>
  );
  
};

export default VideoPlayer;
