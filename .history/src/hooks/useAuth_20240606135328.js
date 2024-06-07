import { useEffect } from 'react';

const useAuth = (setAuth) => {
  useEffect(() => {
    const auth = localStorage.getItem('auth');
    const expirationTime = localStorage.getItem('expirationTime');
    const currentTime = new Date().getTime();

    if (!auth || currentTime > expirationTime) {
      localStorage.removeItem('auth');
      localStorage.removeItem('expirationTime');
      setAuth(false);
    }
  }, [setAuth]);
};

export default useAuth;
