import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = (setAuth) => {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    const expirationTime = localStorage.getItem('expirationTime');
    const currentTime = new Date().getTime();

    if (!auth || currentTime > expirationTime) {
      localStorage.removeItem('auth');
      localStorage.removeItem('expirationTime');
      setAuth(false);
      alert('Your session has expired. Please log in again.');
      navigate('/login');
    }
  }, [navigate, setAuth]);
};

export default useAuth;
