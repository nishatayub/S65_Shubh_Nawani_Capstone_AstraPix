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
      className="p-3 sm:p-4 md:p-12 w-full max-w-md mx-auto"
    >
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6 md:mb-8">
        {isLogin ? 'Sign In' : 'Create Account'}
      </h2>
      <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
        <div className="space-y-3 sm:space-y-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
            required
            autoComplete="email"
          />
          <div className="space-y-1">
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder="Password"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
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
              className="text-white/70 hover:text-white text-xs sm:text-sm transition-colors touch-manipulation"
            >
              Forgot Password?
            </button>
          </div>
        )}
        
        {error && <p className="text-red-400 text-xs sm:text-sm">{error}</p>}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 text-sm sm:text-base touch-manipulation"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mx-auto" />
          ) : (
            isLogin ? 'Sign In' : 'Create Account'
          )}
        </button>
      </form>
      
      <div className="mt-4 sm:mt-6">
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 sm:py-2.5 md:py-3 bg-white/10 rounded-lg text-white font-medium sm:font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation"
          type="button"
          aria-label="Continue with Google"
        >
          <img src={GoogleIcon} alt="" className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          <span className="text-sm sm:text-base">Continue with Google</span>
        </button>
      </div>
    </motion.div>
  );
};

export default React.memo(AuthForm);