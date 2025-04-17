import React from 'react';
import { motion } from 'framer-motion';
import { Coins, ImageIcon } from 'lucide-react';

const StatsGrid = ({ loading, credits, generatedImages, openPaymentModal }) => {
  const imageCount = generatedImages?.length || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-6">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-black/20 p-3 sm:p-6 rounded-xl border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs sm:text-sm">Credits Available</p>
            <h3 className="text-xl sm:text-3xl font-bold text-white mt-1">{loading ? '-' : credits}</h3>
          </div>
          <Coins className="w-5 h-5 sm:w-8 sm:h-8 text-purple-400" />
        </div>
        <button
          onClick={openPaymentModal}
          className="mt-2 sm:mt-4 w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors text-xs sm:text-base touch-manipulation"
        >
          Buy Credits
        </button>
      </motion.div>

      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-black/20 p-3 sm:p-6 rounded-xl border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs sm:text-sm">Images Generated</p>
            <h3 className="text-xl sm:text-3xl font-bold text-white mt-1">{loading ? '-' : imageCount}</h3>
          </div>
          <ImageIcon className="w-5 h-5 sm:w-8 sm:h-8 text-purple-400" />
        </div>
        <p className="mt-2 sm:mt-4 text-white/60 text-xs sm:text-sm">
          {loading ? 'Loading...' : `${imageCount} image${imageCount !== 1 ? 's' : ''} created with AI`}
        </p>
      </motion.div>
    </div>
  );
};

export default StatsGrid;