import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import BackgroundImage from '../assets/bg.jpg';
import Logo from '../assets/logo.jpg';
import { Sun, Moon, Loader2 } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        if (user?.email) {
          const response = await axios.get(`http://localhost:8000/check/credits/${user.email}`);
          setCredits(response.data.credit);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch credits');
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, [user?.email]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleGenerateImage = async (e) => {
    e.preventDefault();
    if (credits <= 0) {
      setGenerationError('Insufficient credits. Please purchase more credits to generate images.');
      return;
    }
    
    setGenerating(true);
    setGenerationError(null);

    try {
      const response = await axios.post('http://localhost:8000/generate/generate', {
        prompt,
        userId: user._id
      });

      console.log('Generation response:', response.data);

      if (response.data.imageUrl) {
        setGeneratedImage(response.data.imageUrl);
        // Update credits from response
        setCredits(response.data.remainingCredits);
      } else {
        throw new Error('No image URL in response');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setGenerationError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to generate image'
      );
    } finally {
      setGenerating(false);
    }
  };

  const username = user?.email ? user.email.split('@')[0] : 'User';

  return (
    <div className={`min-h-screen relative ${darkMode ? 'dark' : ''}`}>
      <div 
        className="absolute inset-0 bg-cover bg-center filter brightness-50" 
        style={{ 
          backgroundImage: `url(${BackgroundImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          zIndex: -1 
        }}
      />

      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className={`p-1 rounded-full ${darkMode ? 'bg-white' : 'bg-transparent'}`}>
                <img src={Logo} alt="AstraPix Logo" className="h-8 w-auto" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AstraPix</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                  Credits: {loading ? '...' : credits}
                </span>
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Welcome, {username}
              </span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {darkMode ? 
                  <Sun className="text-yellow-500 h-5 w-5" /> : 
                  <Moon className="text-gray-600 h-5 w-5" />
                }
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-xl shadow-2xl transition-colors duration-300">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Generate Image</h3>
            <form onSubmit={handleGenerateImage} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Enter your prompt
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/90 dark:bg-gray-700/90 border-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  placeholder="A beautiful space scene..."
                  disabled={generating || credits <= 0}
                />
              </div>
              <button
                type="submit"
                disabled={generating || !prompt || credits <= 0}
                className={`w-full py-2 px-4 rounded-lg ${
                  generating || !prompt || credits <= 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white font-semibold transition duration-300`}
              >
                {generating ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Generating...
                  </span>
                ) : credits <= 0 ? (
                  'No credits available'
                ) : (
                  'Generate Image'
                )}
              </button>
            </form>

            {generationError && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg">
                {generationError}
              </div>
            )}

            {generatedImage && (
              <div className="mt-6">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Generated Image</h4>
                <div className="relative aspect-square max-w-2xl mx-auto">
                  <img
                    src={`http://localhost:8000${generatedImage}`}
                    alt="Generated artwork"
                    className="rounded-lg shadow-xl w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error');
                      setGenerationError('Failed to load generated image');
                    }}
                  />
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  Prompt: "{prompt}"
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/90 dark:bg-gray-700/90 p-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Your Stats</h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  Available Credits: {loading ? 'Loading...' : credits}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Images Generated: {generatedImage ? 1 : 0}
                </p>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-gray-700/90 p-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Buy Credits</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Purchase more credits to generate images
              </p>
              {/* Add payment integration here */}
            </div>

            <div className="bg-white/90 dark:bg-gray-700/90 p-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Your Gallery</h3>
              <p className="text-gray-600 dark:text-gray-300">View your generated images</p>
              {/* Add gallery feature here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;