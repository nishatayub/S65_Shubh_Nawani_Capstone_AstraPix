import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import GoogleIcon from '../assets/google.png';

// Optimize motion animations
const pageTransition = {
  duration: 0.2,
  ease: "easeInOut"
};

const AuthForm = ({
  isLogin,
  formData,
  handleChange,
  handleSubmit,
  isSubmitting,
  error,
  handleGoogleLogin,
  onForgotPassword
}) => {
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    if (!isLogin && (value.length < 8 || value.length > 16)) {
      setPasswordError('Password must be between 8 and 16 characters');
    } else {
      setPasswordError('');
    }
    handleChange(e);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!isLogin && (formData.password.length < 8 || formData.password.length > 16)) {
      setPasswordError('Password must be between 8 and 16 characters');
      return;
    }
    handleSubmit(e);
  };

  return (
    <motion.div
      key="auth-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={pageTransition}
      className="p-4 sm:p-8 md:p-12 w-full max-w-md mx-auto"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">
        {isLogin ? 'Sign In' : 'Create Account'}
      </h2>
      <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
            required
          />
          <div className="space-y-1">
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder="Password"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                required
              />
            </div>
            {!isLogin && (
              <p className={`text-xs ${passwordError ? 'text-red-400' : 'text-white/50'}`}>
                {passwordError || 'Password must be between 8 and 16 characters'}
              </p>
            )}
          </div>
        </div>
        {isLogin && (
          <div className="text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 sm:text-base text-sm"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            isLogin ? 'Sign In' : 'Create Account'
          )}
        </button>
      </form>
      <div className="mt-6">
        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 bg-white/10 rounded-lg text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
        >
          <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>
    </motion.div>
  );
};

export default React.memo(AuthForm);