import React from 'react';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';

const VideoPlayer = () => {
  const { videoUrl } = useParams();

  return (
    <div>
      <button onClick={() => navigate("/patient")}>Back</button>
      <ReactPlayer url={decodeURIComponent(videoUrl)} controls />
    </div>
  );
  
};

export default VideoPlayer;
