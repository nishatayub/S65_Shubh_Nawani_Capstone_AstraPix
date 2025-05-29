import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { updateFavicon } from '../utils/themeUtils';

// Create context with default values
export const ThemeContext = createContext({
  darkMode: false,
  systemTheme: false,
  toggleTheme: () => {},
  setThemePreference: () => {},
  theme: 'light',
  logoSize: {}
});

// Custom hook for easier context consumption
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Track if we're following system preference
  const [systemTheme, setSystemTheme] = useState(() => {
    const savedTheme = localStorage.getItem('themePreference');
    return savedTheme === null || savedTheme === 'system';
  });

  // Track the actual dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('themePreference');
    const savedMode = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) || savedMode === 'dark') {
      return true;
    }
    if (savedTheme === 'light') {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [customTheme, setCustomTheme] = useState(false); // New state for custom theme

  // Update the UI when dark mode changes
  useEffect(() => {
    updateFavicon(darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    
    // Use a brief timeout to avoid flash of incorrect theme
    const applyTheme = () => {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    // Apply immediately and also after a tiny delay to ensure it works
    applyTheme();
    const timeoutId = setTimeout(applyTheme, 0);
    
    return () => clearTimeout(timeoutId);
  }, [darkMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (!systemTheme) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Update theme when system preference changes
    const handleChange = (e) => {
      setDarkMode(e.matches);
    };
    
    // Add listener with proper compatibility for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // For older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [systemTheme]);

  // Toggle between light and dark mode
  const toggleTheme = useCallback(() => {
    setSystemTheme(false);
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('themePreference', newValue ? 'dark' : 'light');
      return newValue;
    });
  }, []);

  // Set theme to a specific value (light, dark, or system)
  const setThemePreference = useCallback((preference) => {
    localStorage.setItem('themePreference', preference);
    
    if (preference === 'system') {
      setSystemTheme(true);
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setSystemTheme(false);
      setDarkMode(preference === 'dark');
    }
  }, []);

  const toggleCustomTheme = useCallback(() => {
    setCustomTheme((prev) => !prev);
  }, []);

  const themeColors = customTheme
    ? {
        primary: '#0A111A', // Chinese Black
        secondary: '#294A8F', // YInMn Blue
        background: '#9FB7E3', // Pale Cerulean
        accent: '#D8D0E7', // Languid Lavender
        text: '#9295D0', // Ceil
      }
    : darkMode
    ? {
        primary: '#0f172a',
        secondary: '#1e293b',
        background: '#0f172a',
        accent: '#1e293b',
        text: '#ffffff',
      }
    : {
        primary: '#ffffff',
        secondary: '#f3f4f6',
        background: '#ffffff',
        accent: '#f3f4f6',
        text: '#333333',
      };

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', themeColors.primary);
    document.documentElement.style.setProperty('--secondary-color', themeColors.secondary);
    document.documentElement.style.setProperty('--background-color', themeColors.background);
    document.documentElement.style.setProperty('--accent-color', themeColors.accent);
    document.documentElement.style.setProperty('--text-color', themeColors.text);
  }, [themeColors]);

  // Apply or remove custom-theme class based on customTheme state
  useEffect(() => {
    if (customTheme) {
      document.documentElement.classList.add('custom-theme');
    } else {
      document.documentElement.classList.remove('custom-theme');
    }
  }, [customTheme]);

  // Calculate current theme string
  const theme = darkMode ? 'dark' : 'light';

  // Define responsive logo sizes
  const logoSize = {
    sm: {
      height: '48px',
      width: '48px'
    },
    md: {
      height: '64px',
      width: '64px'
    },
    lg: {
      height: '96px',
      width: '96px'
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        darkMode, 
        systemTheme, 
        toggleTheme, 
        setThemePreference,
        theme,
        logoSize,
        customTheme,
        toggleCustomTheme,
        themeColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
