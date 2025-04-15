import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const OTPVerificationForm = ({
  email,
  otp,
  setOtp,
  isSubmitting,
  error,
  handleVerifyOTP,
  resendOTP
}) => {
  const handleOTPChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 1) {
      const newOtp = otp.split('');
      newOtp[index] = value;
      setOtp(newOtp.join(''));
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <motion.div
      key="otp-form"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      className="p-4 sm:p-8 md:p-12 w-full max-w-md mx-auto"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
        Verify Email
      </h2>
      <p className="text-sm sm:text-base text-white/80 mb-6 sm:mb-8">
        Please enter the 6-digit verification code sent to {email}
      </p>
      <form onSubmit={handleVerifyOTP} className="space-y-4 sm:space-y-6">
        <div className="flex gap-2 sm:gap-4 justify-between">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              value={otp[index] || ''}
              onChange={(e) => handleOTPChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-lg text-white text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              maxLength={1}
              inputMode="numeric"
              pattern="\d"
              autoComplete="off"
            />
          ))}
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 text-sm sm:text-base touch-manipulation"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Verify OTP'
          )}
        </button>
      </form>
      <button
        onClick={resendOTP}
        disabled={isSubmitting}
        className="w-full mt-4 py-2 text-white/70 hover:text-white transition-colors text-sm sm:text-base touch-manipulation"
      >
        Resend OTP
      </button>
    </motion.div>
  );
};

export default OTPVerificationForm;