import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [0.8, 1.5, 0.8],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center space-x-8">
        {/* Outer rotating gradients */}
        <motion.div
          className="absolute -inset-40 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 blur-3xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Pulsing rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute -inset-24 rounded-full border border-purple-500/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.2],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Logo and Text Container */}
        <div className="flex items-center space-x-8">
          {/* Logo animation */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{
              duration: 1,
              type: "spring",
              stiffness: 70,
              damping: 15
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl animate-pulse" />
            <Logo className="w-[500px] h-[500px] drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]" />
          </motion.div>

          {/* Text animation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-2"
          >
            <motion.span 
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 block drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                textShadow: [
                  "0 0 20px rgba(168,85,247,0.3)",
                  "0 0 40px rgba(168,85,247,0.6)",
                  "0 0 20px rgba(168,85,247,0.3)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: "200% auto" }}
            >
              AstraPix
            </motion.span>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-base text-purple-400/80 tracking-wider"
            >
              Generate. Create. Elevate.
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
