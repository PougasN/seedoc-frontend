import React from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';

const VideoPlayer = () => {
  const { videoUrl } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
      <ReactPlayer url={decodeURIComponent(videoUrl)} controls />
    </div>
  );
  
};

export default VideoPlayer;
