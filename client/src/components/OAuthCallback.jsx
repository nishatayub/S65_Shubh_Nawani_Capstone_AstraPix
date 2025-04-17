import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userParam = params.get('user');

        if (!token) {
          setError('No authentication token received');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        await login(token);
        if (userParam) {
          const user = JSON.parse(decodeURIComponent(userParam));
          // You can handle the user data here if needed
        }
        navigate('/dashboard');
      } catch (error) {
        setError(error.message || 'Authentication failed');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };
    handleCallback();
  }, [location, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900/50 p-4">
      <div className="text-center bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 max-w-sm w-full">
        {error ? (
          <div className="space-y-3">
            <div className="text-red-400 text-sm sm:text-base">{error}</div>
            <p className="text-white/60 text-xs sm:text-sm">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-white/20 border-t-purple-500 mx-auto"></div>
            <p className="mt-4 text-white/80 text-sm sm:text-base">Completing authentication...</p>
            <p className="mt-2 text-white/50 text-xs sm:text-sm">Please wait, you'll be redirected shortly</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;