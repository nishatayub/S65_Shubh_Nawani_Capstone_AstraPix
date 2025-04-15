import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-50 py-6 sm:py-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info - Full Width on Mobile */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-white">AstraPix Inc.</h3>
            <p className="text-sm text-white/70">
              Transforming imagination into reality through AI-powered image generation.
            </p>
          </div>

          {/* Navigation Sections */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" onClick={scrollToTop} className="text-white/70 hover:text-white transition-colors cursor-pointer">Home</Link></li>
              <li><Link to="/gallery" onClick={scrollToTop} className="text-white/70 hover:text-white transition-colors cursor-pointer">Gallery</Link></li>
              <li><Link to="/pricing" onClick={scrollToTop} className="text-white/70 hover:text-white transition-colors cursor-pointer">Pricing</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-white">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" onClick={scrollToTop} className="text-white/70 hover:text-white transition-colors cursor-pointer">Help Center</Link></li>
              <li><Link to="/docs" onClick={scrollToTop} className="text-white/70 hover:text-white transition-colors cursor-pointer">Documentation</Link></li>
              <li><Link to="/contact" onClick={scrollToTop} className="text-white/70 hover:text-white transition-colors cursor-pointer">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" onClick={scrollToTop} className="text-white/70 hover:text-white transition-colors cursor-pointer">Privacy Policy</Link></li>
              <li><Link to="/terms" onClick={scrollToTop} className="text-white/70 hover:text-white transition-colors cursor-pointer">Terms of Service</Link></li>
              <li><Link to="/sitemap" onClick={scrollToTop} className="text-white/70 hover:text-white transition-colors cursor-pointer">Sitemap</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright with System Status and Time */}
        <div className="mt-6 sm:mt-8 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-white/70 order-2 sm:order-1 sm:w-1/3">
              <p>© {new Date().getFullYear()} AstraPix Inc. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2 sm:w-1/3 justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-sm text-white/70">All Systems Operational • {currentTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: false 
              })}</span>
            </div>
            <div className="sm:w-1/3 order-3"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;