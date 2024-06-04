import React from 'react';
import ReactPlayer from 'react-player';
import { useParams , useNavigate } from 'react-router-dom';

const VideoPlayer = () => {
  const { videoUrl } = useParams();

  return (
    <div>
        <button onClick={() => navigate(-1)}>Back</button>
      <h1>Video Player</h1>
      <ReactPlayer url={decodeURIComponent(videoUrl)} controls />
    </div>
  );
};

export default VideoPlayer;
