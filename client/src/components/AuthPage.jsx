import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sun, Moon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import BackgroundImage from '../assets/bg.jpg';
import Logo from './Logo';
import GoogleIcon from '../assets/google.png';
import axios from 'axios';

const AuthPage = () => {
  const { login } = useAuth();
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData({ email: '', password: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const url = `http://localhost:8000/api/${isLogin ? 'login' : 'signup'}`;
      const response = await axios.post(url, formData);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen relative flex items-center justify-center ${darkMode ? 'dark' : ''}`}>
      <div 
        className="absolute inset-0 bg-cover bg-center filter brightness-50" 
        style={{ 
          backgroundImage: `url(${BackgroundImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          zIndex: -1 
        }}
      />

      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-50"
        aria-label="Toggle theme"
      >
        {darkMode ? 
          <Sun className="text-yellow-500 h-5 w-5" /> : 
          <Moon className="text-gray-600 h-5 w-5" />
        }
      </button>

      <motion.div 
        className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden relative z-10 mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 50 }}
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <Logo className="h-16 w-16" />
          </div>

          <motion.div 
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              {isLogin ? 'Login' : 'Signup'}
            </h2>
            <motion.button 
              onClick={handleToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
              disabled={isSubmitting}
            >
              {isLogin ? 'Create account' : 'Back to login'}
            </motion.button>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.form 
              key={isLogin ? 'login' : 'signup'}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: isLogin ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-2">Email</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/70 dark:bg-gray-700/70 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-800 transition duration-300"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-gray-700 dark:text-gray-200 mb-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/70 dark:bg-gray-700/70 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-800 transition duration-300 pr-12"
                    disabled={isSubmitting}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 transition"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <motion.button 
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                className={`w-full flex items-center justify-center py-3 rounded-lg transition duration-300 ease-in-out transform ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    {isLogin ? 'Logging in...' : 'Creating Account...'}
                  </>
                ) : (
                  isLogin ? 'Login' : 'Create Account'
                )}
              </motion.button>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                  className={`mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                    isSubmitting 
                      ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                  } transition-colors duration-300`}
                >
                  <img 
                    src={GoogleIcon} 
                    alt="Google" 
                    className="h-5 w-5"
                  />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    Continue with Google
                  </span>
                </motion.button>
              </div>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;