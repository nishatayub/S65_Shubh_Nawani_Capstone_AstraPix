import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const formTransition = {
  duration: 0.2,
  ease: "easeInOut"
};

const ForgotPasswordForm = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

  useEffect(() => {
    let timer;
    if (!canResend && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [canResend, countdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/forgot-password`, 
        { email },
        { timeout: 8000 }
      );
      toast.success('OTP sent! Check your email.');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].current.focus();
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/forgot-password`,
        { email },
        { timeout: 8000 }
      );
      toast.success('New OTP sent!');
      setCanResend(false);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      toast.error('Password must be between 8 and 16 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/auth/verify-otp`,
        {
          email,
          otp: otpString,
          newPassword
        },
        { timeout: 8000 }
      );

      if (response.data && response.status === 200) {
        toast.success('Password updated successfully! Redirecting to login...');
        setTimeout(() => onBack(), 1500);
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
      if (error.response?.status === 400) {
        setOtp(['', '', '', '', '', '']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      className="p-8 md:p-12 col-span-2 md:col-span-1"
    >
      <Toaster />
      <h2 className="text-3xl font-bold text-white mb-4">
        {step === 1 ? 'Reset Password' : 'Verify OTP'}
      </h2>
      {step === 2 && (
        <div className="space-y-2 mb-8">
          <p className="text-white/70">
            Enter the OTP sent to:
          </p>
          <p className="text-white font-medium text-lg bg-white/10 px-3 py-2 rounded">
            {email}
          </p>
        </div>
      )}
      {step === 1 ? (
        <form onSubmit={handleSendOTP} className="space-y-6">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              'Send OTP'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="flex gap-2 justify-between mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={otpRefs.current[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            ))}
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResend}
              className="text-purple-400 hover:text-purple-300 disabled:text-gray-500 text-sm"
            >
              {canResend ? 'Resend OTP' : `Resend OTP in ${countdown}s`}
            </button>
          </div>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}
      <button
        onClick={onBack}
        className="mt-4 text-white/70 hover:text-white text-sm transition-colors"
      >
        Back to Login
      </button>
    </motion.div>
  );
};

export default React.memo(ForgotPasswordForm);
