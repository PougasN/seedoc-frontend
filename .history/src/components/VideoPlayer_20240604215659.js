import React from 'react';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';

const VideoPlayer = () => {
  const { videoUrl } = useParams();

  return (
    <div>
      <h1>Video Player</h1>
      <ReactPlayer url={decodeURIComponent(videoUrl)} controls />
    </div>
  );
};

export default VideoPlayer;
