import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 py-6 sm:py-8 border-t border-white/10">
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

        {/* Copyright - Improved Mobile Layout */}
        <div className="mt-6 sm:mt-8 pt-4 border-t border-white/10">
          <p className="text-center text-sm text-white/70">
            © {new Date().getFullYear()} AstraPix Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;