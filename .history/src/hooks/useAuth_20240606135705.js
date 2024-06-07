import { useEffect } from 'react';

const useAuth = (handleSessionExpiry) => {
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('auth');
      const expirationTime = localStorage.getItem('expirationTime');
      const currentTime = new Date().getTime();

      if (!auth || currentTime > expirationTime) {
        localStorage.removeItem('auth');
        localStorage.removeItem('expirationTime');
        handleSessionExpiry();
      }
    };

    const intervalId = setInterval(checkAuth, 1000);

    return () => clearInterval(intervalId);
  }, [handleSessionExpiry]);
};

export default useAuth;
