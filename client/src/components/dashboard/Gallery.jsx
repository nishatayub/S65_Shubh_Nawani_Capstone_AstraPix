import React, { useState, useEffect, useMemo, Suspense, useContext, useCallback, lazy, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Loader, Download, Share2, Trash2, ArrowUpDown, X, Maximize2, Heart, AlertTriangle } from 'lucide-react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import ImageViewer from '../common/ImageViewer';

const ITEMS_PER_PAGE = 6;

// Lazy load modal to reduce initial bundle size
const PaymentModal = lazy(() => import('../modals/PaymentModal'));

// Separate into smaller components
const ActionButton = React.memo(({ icon, onClick, danger = false, label, loading = false }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`p-2 rounded-full transition-colors touch-manipulation focus:outline-none focus:ring-2 ${
      danger 
        ? 'bg-red-500/20 hover:bg-red-500/30 focus:ring-red-500' 
        : 'bg-white/20 hover:bg-white/30 focus:ring-purple-500'
    } focus:ring-offset-1 focus:ring-offset-gray-900`}
    aria-label={label}
    disabled={loading}
  >
    {loading ? (
      <Loader className={`w-4 h-4 animate-spin ${danger ? 'text-red-400' : 'text-white'}`} aria-hidden="true" />
    ) : (
      React.cloneElement(icon, { 
        className: `w-4 h-4 ${danger ? 'text-red-400' : 'text-white'}`,
        'aria-hidden': true
      })
    )}
  </motion.button>
));

// Break out ImageCard component for better memoization
const ImageCard = React.memo(({ 
  image, 
  index, 
  favorites, 
  downloadProgress, 
  downloadCounts, 
  shareCounts,
  handleDownload, 
  handleShare, 
  handleDelete, 
  toggleFavorite, 
  openFullscreen,
  setupImageObserver
}) => (
  <motion.div
    key={image._id}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2, delay: index * 0.05 }}
    className="group relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/5 shadow-lg min-h-[200px] flex items-center"
    role="listitem"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFullscreen(image);
      }
    }}
    aria-label={`Image generated from prompt: ${image.prompt}`}
  >
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-800/50 flex items-center justify-center"
        style={{ display: image.loaded ? 'none' : 'flex' }}
        aria-hidden="true"
      >
        <Loader className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
      <img
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
        data-src={image.imageUrl}
        alt={`AI-generated image: ${image.prompt}`}
        className="w-auto h-auto max-w-full max-h-[400px] object-contain rounded-lg transform transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
        ref={setupImageObserver}
        onLoad={(e) => {
          e.target.style.opacity = 1;
          e.target.src = image.imageUrl;
          image.loaded = true;
        }}
        onError={(e) => {
          console.error('Image failed to load:', image.imageUrl);
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23555'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='middle' fill='%23fff' font-size='15'%3EImage Error%3C/text%3E%3C/svg%3E";
        }}
        style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
      />
    </div>
    
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:duration-200 md:transition-opacity focus-within:opacity-100 touch:opacity-100">
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4">
        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(image._id);
            }}
            className={`p-1.5 sm:p-2 rounded-full touch-manipulation focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-gray-900 ${
              favorites.includes(image._id) 
                ? 'bg-purple-500/30' 
                : 'bg-white/20'
            }`}
            aria-label={favorites.includes(image._id) ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favorites.includes(image._id)}
          >
            <Heart 
              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                favorites.includes(image._id) 
                  ? 'text-purple-400 fill-purple-400' 
                  : 'text-white'
              }`}
              aria-hidden="true"
            />
          </button>
          {downloadCounts[image._id] > 0 && (
            <span className="text-xs text-white/60" aria-live="polite">
              {downloadCounts[image._id]} downloads
            </span>
          )}
          {shareCounts[image._id] > 0 && (
            <span className="text-xs text-white/60" aria-live="polite">
              {shareCounts[image._id]} shares
            </span>
          )}
        </div>
        <p className="text-white text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3">
          {image.prompt}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <ActionButton 
              icon={<Download />} 
              onClick={() => handleDownload(image)} 
              label="Download image"
              loading={downloadProgress[image._id]}
            />
            {navigator.share && (
              <ActionButton 
                icon={<Share2 />} 
                onClick={() => handleShare(image)} 
                label="Share image"
              />
            )}
            <ActionButton 
              icon={<Maximize2 />} 
              onClick={() => openFullscreen(image)} 
              label="View fullscreen"
            />
          </div>
          <ActionButton 
            icon={<Trash2 />} 
            onClick={() => handleDelete(image._id)} 
            danger 
            label="Delete image"
          />
        </div>
      </div>
    </div>
  </motion.div>
));

// Optimized Gallery component
const Gallery = ({ showHeaderFooter = true, isMinimal = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [downloadCounts, setDownloadCounts] = useState({});
  const [shareCounts, setShareCounts] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState(null);
  
  // Refs for accessibility
  const deleteModalRef = useRef(null);
  const fullscreenModalRef = useRef(null);
  const searchInputRef = useRef(null);
  const observersRef = useRef([]);
  const galleryRef = useRef(null);
  
  // Track mounted state for async operations
  const isMounted = useRef(true);
  
  // Debounce search to prevent excessive re-renders
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
      
      // Cleanup all observers
      observersRef.current.forEach(observer => observer.disconnect());
      observersRef.current = [];
    };
  }, []);

  // API request with AbortController for cleanup
  const fetchUserData = useCallback(async () => {
    const controller = new AbortController();
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URI}/check/credits/${user.email}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        signal: controller.signal
      });
      
      if (isMounted.current) {
        setCredits(response.data.credit);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch user credits:', error);
        if (isMounted.current) {
          setError('Could not fetch credits. Please try refreshing.');
        }
      }
    }
    
    return () => controller.abort();
  }, [user?.email]);

  const fetchImages = useCallback(async () => {
    const controller = new AbortController();
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URI}/generate/gallery`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        signal: controller.signal
      });
      
      if (isMounted.current) {
        // Optimize initial image format with blurred placeholders
        const optimizedImages = (response.data.images || []).map(img => ({
          ...img,
          loaded: false,
          optimizedUrl: img.imageUrl.replace('/upload/', '/upload/w_400,f_auto,q_auto:low/')
        }));
        
        setImages(optimizedImages);
        setError(null);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch images:', error);
        if (isMounted.current) {
          toast.error('Failed to fetch images');
          setError('Could not load images. Please try refreshing.');
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
    
    return () => controller.abort();
  }, []);

  // Improved refreshData with race condition protection
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const fetchCreditsPromise = fetchUserData();
    const fetchImagesPromise = fetchImages();
    
    try {
      await Promise.all([fetchImagesPromise, fetchCreditsPromise]);
    } catch (err) {
      console.error('Error refreshing data:', err);
      if (isMounted.current) {
        setError('An error occurred while refreshing. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [fetchImages, fetchUserData]);

  const handleDelete = useCallback((imageId) => {
    setImageToDelete(imageId);
    setShowDeleteModal(true);
    // Focus on the delete modal for accessibility when it opens
    setTimeout(() => {
      deleteModalRef.current?.focus();
    }, 100);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!imageToDelete) return;
    
    try {
      // Optimistic update - remove from UI first
      setImages(prevImages => prevImages.filter(img => img._id !== imageToDelete));
      setShowDeleteModal(false);
      
      // Then delete from server
      await axios.delete(`${import.meta.env.VITE_BASE_URI}/generate/${imageToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast.success('Image deleted successfully');
      setImageToDelete(null);
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
      // Only fetch images again if delete failed
      await fetchImages();
    }
  }, [imageToDelete, fetchImages]);

  // Improved with blob caching
  const handleShare = useCallback(async (image) => {
    try {
      // Start with a loading indicator
      toast.loading('Preparing to share...');
      
      // Use cached blob if available
      if (!image.blob) {
        const response = await fetch(image.imageUrl);
        if (!response.ok) throw new Error('Failed to fetch image for sharing');
        image.blob = await response.blob();
      }
      
      const file = new File([image.blob], `astrapix-${image.prompt.slice(0, 30)
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase()}.jpg`, { type: 'image/jpeg' });

      // Dismiss loading toast
      toast.dismiss();

      if (navigator.share) {
        await navigator.share({
          title: 'Check out my AI-generated image on AstraPix!',
          text: `Generated with prompt: ${image.prompt}`,
          files: [file]
        });
        toast.success('Shared successfully');
      } else {
        await navigator.clipboard.writeText(
          `Check out this AI-generated image on AstraPix!\n\nPrompt: ${image.prompt}\n\nLink: ${image.imageUrl}`
        );
        toast.success('Share link copied to clipboard (File sharing not supported in this browser)');
      }

      // Update share counts
      setShareCounts(prev => ({
        ...prev,
        [image._id]: (prev[image._id] || 0) + 1
      }));
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss();
      
      if (error.name === 'AbortError') return;
      console.error('Share error:', error);
      toast.error('Failed to share image');
    }
  }, []);

  // Improved with blob caching
  const handleDownload = useCallback(async (image) => {
    try {
      setDownloadProgress(prev => ({ ...prev, [image._id]: true }));
      
      // Use cached blob if available
      if (!image.blob) {
        const response = await fetch(image.imageUrl);
        if (!response.ok) throw new Error('Download failed');
        image.blob = await response.blob();
      }
      
      const filename = `astrapix-${image.prompt.slice(0, 30)
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase()}.jpg`;
      
      const url = window.URL.createObjectURL(image.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.setAttribute('download', filename);
      link.setAttribute('aria-label', `Download image: ${image.prompt}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Delay revoking to ensure download starts
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
      toast.success('Download started');

      setDownloadCounts(prev => ({
        ...prev,
        [image._id]: (prev[image._id] || 0) + 1
      }));
    } catch (error) {
      toast.error('Failed to download image');
      console.error('Download error:', error);
    } finally {
      setDownloadProgress(prev => ({ ...prev, [image._id]: false }));
    }
  }, []);

  // Load images and user data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('galleryFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error parsing favorites:', e);
        localStorage.removeItem('galleryFavorites');
      }
    }
  }, []);

  // Improved image lazy loading with IntersectionObserver pool
  const setupImageObserver = useCallback((node) => {
    if (!node) return;
    
    // Reuse existing observer if possible
    let observer = observersRef.current.find(obs => obs.root === null);
    
    if (!observer) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src && img.src !== img.dataset.src) {
                // Preload image
                const preloadImg = new Image();
                preloadImg.onload = () => {
                  img.src = img.dataset.src;
                  img.style.opacity = 1;
                };
                preloadImg.src = img.dataset.src;
                observer.unobserve(img);
              }
            }
          });
        },
        { rootMargin: '200px', threshold: 0.01 }
      );
      
      observersRef.current.push(observer);
    }
    
    observer.observe(node);
  }, []);

  // Handle keyboard navigation for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Close modals on escape key
      if (e.key === 'Escape') {
        if (fullscreenImage) {
          setFullscreenImage(null);
          e.preventDefault();
        } else if (showDeleteModal) {
          setShowDeleteModal(false);
          e.preventDefault();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage, showDeleteModal]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/auth');
  }, [logout, navigate]);

  const handleCreditUpdate = useCallback(async (newCredits) => {
    setCredits(newCredits);
    await refreshData();
    toast.success(`Credits updated! New balance: ${newCredits}`);
  }, [refreshData]);

  // Memoized sorted images
  const sortedImages = useMemo(() => {
    if (!images?.length) return [];
    return [...images].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortNewestFirst ? timeB - timeA : timeA - timeB;
    });
  }, [images, sortNewestFirst]);

  // Memoized filtered images (by favorites and search)
  const filteredImages = useMemo(() => {
    if (filterType === 'favorites') {
      return sortedImages.filter(img => favorites.includes(img._id));
    }
    if (!debouncedSearchTerm) return sortedImages;
    return sortedImages.filter(img => 
      img.prompt.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [sortedImages, debouncedSearchTerm, filterType, favorites]);

  // Memoized paginated images
  const paginatedImages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredImages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredImages, currentPage]);

  // Toggle favorite status
  const toggleFavorite = useCallback((imageId) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(imageId);
      const newFavorites = isFavorite
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId];
      
      localStorage.setItem('galleryFavorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // Memoized optimized images (with CDN params)
  const optimizedImages = useMemo(() => 
    paginatedImages.map(img => ({
      ...img,
      optimizedUrl: img.imageUrl.replace('/upload/', '/upload/w_400,f_auto,q_auto:good/')
    }))
  , [paginatedImages]);

  // Handler to open fullscreen view with keyboard accessibility
  const openFullscreen = useCallback((image) => {
    setFullscreenImage(image);
    // Focus on the modal when it opens
    setTimeout(() => {
      fullscreenModalRef.current?.focus();
    }, 100);
  }, []);

  // Render functions as memoized components
  const FullscreenViewer = useCallback(({ image }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={() => setFullscreenImage(null)}
      role="dialog"
      aria-modal="true"
      aria-label={`Fullscreen view: ${image.prompt}`}
    >
      <motion.div 
        ref={fullscreenModalRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setFullscreenImage(null)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-50 touch-manipulation focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
          aria-label="Close fullscreen view"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>

        <div className="relative w-full h-full flex items-center justify-center p-4">
          <img
            src={image.imageUrl}
            alt={`AI-generated image: ${image.prompt}`}
            className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg"
          />
        </div>

        <div className="w-full max-w-3xl mx-auto p-4 bg-gray-900/95 backdrop-blur-md rounded-lg mt-4">
          <p className="text-white/90 text-sm mb-3">{image.prompt}</p>
          <div className="flex items-center justify-center gap-4">
            <ActionButton
              icon={<Download />}
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(image);
              }}
              label="Download image"
            />
            <ActionButton
              icon={<Share2 />}
              onClick={(e) => {
                e.stopPropagation();
                handleShare(image);
              }}
              label="Share image"
            />
            <ActionButton
              icon={<Trash2 />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(image._id);
                setFullscreenImage(null);
              }}
              danger
              label="Delete image"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  ), [handleDelete, handleDownload, handleShare]);

  // Delete confirmation modal as memoized component
  const DeleteConfirmationModal = useCallback(() => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <motion.div
        ref={deleteModalRef}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-gray-900 border border-purple-500/20 rounded-lg p-6 max-w-sm w-full shadow-xl backdrop-blur-sm"
        tabIndex={-1}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500" aria-hidden="true" />
          <h3 id="delete-modal-title" className="text-lg font-semibold text-white">Confirm Deletion</h3>
        </div>
        <p id="delete-modal-description" className="text-white/70 mb-6">Are you sure you want to delete this image? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-gray-900"
            autoFocus
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  ), [confirmDelete]);

  // Show loading state
  if (loading) {
    return (
      <>
        {showHeaderFooter && (
          <Navbar 
            user={user}
            credits={credits}
            loading={loading}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            handleLogout={handleLogout}
            openPaymentModal={() => setIsPaymentModalOpen(true)}
          />
        )}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[400px]"
        >
          <Loader className="w-8 h-8 text-purple-500 animate-spin" aria-hidden="true" />
          <p className="mt-4 text-white/60" role="status">Loading your gallery...</p>
        </motion.div>
        {showHeaderFooter && <Footer />}
      </>
    );
  }

  return (
    <>
      {showHeaderFooter && (
        <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-white/10 shadow-lg">
          <Navbar 
            user={user}
            credits={credits}
            loading={loading}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            handleLogout={handleLogout}
            openPaymentModal={() => setIsPaymentModalOpen(true)}
          />
        </div>
      )}
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 mt-16 bg-gradient-to-b from-gray-800/50 via-gray-900/30 to-purple-900/20 backdrop-blur-lg"> 
        <div className="max-w-6xl mx-auto relative z-10">
          {!isMinimal && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-gray-800/30 backdrop-blur-xl p-4 rounded-lg border border-purple-500/10 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-grow">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Gallery</h1>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search prompts..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full sm:w-64 px-3 py-1.5 bg-white/10 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                      aria-label="Search prompts"
                    />
                    <button
                      onClick={() => setSortNewestFirst(!sortNewestFirst)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors focus:outline-none focus:ring-1 focus:ring-purple-500"
                      aria-label={`Sort by ${sortNewestFirst ? "newest" : "oldest"} first`}
                      aria-pressed={sortNewestFirst}
                    >
                      <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
                      <span>{sortNewestFirst ? "Newest" : "Oldest"}</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFilterType(filterType === 'all' ? 'favorites' : 'all')}
                    className={`flex items-center justify-center px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                      filterType === 'favorites'
                        ? 'bg-purple-500/30 text-purple-300'
                        : 'bg-white/10 hover:bg-white/20 text-white/80'
                    }`}
                    aria-label={`${filterType === 'favorites' ? 'Show all images' : 'Show only favorites'}`}
                    aria-pressed={filterType === 'favorites'}
                  >
                    <Heart 
                      className={`w-4 h-4 ${filterType === 'favorites' ? 'fill-purple-300' : ''}`} 
                      aria-hidden="true" 
                    />
                    <span className="ml-2">Favorites</span>
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-gray-900"
                  >
                    <PlusCircle className="w-5 h-5" aria-hidden="true" />
                    <span>Create New</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-500/20 backdrop-blur-sm p-4 rounded-lg border border-red-500/20 text-white"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" aria-hidden="true" />
                <p>{error}</p>
              </div>
              <button 
                onClick={refreshData}
                className="mt-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              >
                Retry
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!images.length ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="col-span-full text-center py-16 bg-black/20 rounded-xl border border-white/10 backdrop-blur-sm"
                role="status"
              >
                <p className="text-white/80 mb-4">No images generated yet. Start creating!</p>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-gray-900"
                >
                  Create Your First Image
                </button>
              </motion.div>
            ) : filteredImages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="col-span-full text-center py-16 bg-black/20 rounded-xl border border-white/10 backdrop-blur-sm"
                role="status"
              >
                <p className="text-white/80 mb-4">
                  {filterType === 'favorites' 
                    ? 'No favorite images yet. Mark some images as favorites!' 
                    : 'No images match your search. Try different keywords.'}
                </p>
                {filterType === 'favorites' ? (
                  <button 
                    onClick={() => setFilterType('all')}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-gray-900"
                  >
                    View All Images
                  </button>
                ) : (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-gray-900"
                  >
                    Clear Search
                  </button>
                )}
              </motion.div>
            ) : (
              <div 
                ref={galleryRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 contain-intrinsic-size: 1px 5000px"
                role="list"
                aria-label="Generated images gallery"
              >
                {optimizedImages.map((image, index) => (
                  <ImageCard
                    key={image._id}
                    image={image}
                    index={index}
                    favorites={favorites}
                    downloadProgress={downloadProgress}
                    downloadCounts={downloadCounts}
                    shareCounts={shareCounts}
                    handleDownload={handleDownload}
                    handleShare={handleShare}
                    handleDelete={handleDelete}
                    toggleFavorite={toggleFavorite}
                    openFullscreen={openFullscreen}
                    setupImageObserver={setupImageObserver}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          <ImageViewer
            image={selectedImage}
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
          />

          <AnimatePresence>
            {fullscreenImage && (
              <FullscreenViewer image={fullscreenImage} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showDeleteModal && <DeleteConfirmationModal />}
          </AnimatePresence>

          {!isMinimal && filteredImages.length > ITEMS_PER_PAGE && (
            <motion.nav 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex items-center justify-center gap-2"
              aria-label="Pagination"
            >
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-white/10 text-white/60 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-gray-900"
                aria-label="Previous page"
              >
                Previous
              </button>

              <div className="flex items-center gap-1" role="navigation">
                {Array.from({ length: Math.ceil(filteredImages.length / ITEMS_PER_PAGE) })
                  .map((_, idx) => {
                    if (
                      idx === 0 || 
                      idx === Math.ceil(filteredImages.length / ITEMS_PER_PAGE) - 1 ||
                      (idx >= currentPage - 2 && idx <= currentPage)
                    ) {
                      return (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`min-w-[32px] px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-gray-900 ${
                            currentPage === idx + 1 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          }`}
                          aria-label={`Page ${idx + 1}`}
                          aria-current={currentPage === idx + 1 ? 'page' : undefined}
                        >
                          {idx + 1}
                        </motion.button>
                      );
                    } else if (
                      idx === currentPage - 3 || 
                      idx === currentPage + 1
                    ) {
                      return <span key={idx} className="text-white/40" aria-hidden="true">...</span>;
                    }
                    return null;
                  }).filter(Boolean)}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredImages.length / ITEMS_PER_PAGE), prev + 1))}
                disabled={currentPage === Math.ceil(filteredImages.length / ITEMS_PER_PAGE)}
                className="px-3 py-1 rounded bg-white/10 text-white/60 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-gray-900"
                aria-label="Next page"
              >
                Next
              </button>
            </motion.nav>
          )}

          {!isMinimal && images.length > 0 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/60 mt-4 mb-6"
              aria-live="polite"
            >
              Showing {paginatedImages.length} of {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
            </motion.p>
          )}
        </div>
      </div>

      {isPaymentModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <Loader className="w-8 h-8 text-purple-500 animate-spin" />
        </div>}>
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onSuccess={handleCreditUpdate}
            title="Purchase Credits"
          />
        </Suspense>
      )}
      
      {showHeaderFooter && <Footer />}
    </>
  );
};

// Custom hooks for optimization
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

export default React.memo(Gallery);
