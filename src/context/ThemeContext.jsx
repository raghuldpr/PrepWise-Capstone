import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {},
  setForcedDarkMode: (force) => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('prepwise-theme');
      if (saved) {
        return saved === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });
  const [forcedDark, setForcedDark] = useState(false);

  const effectiveDarkMode = isDarkMode || forcedDark;

  useEffect(() => {
    try {
      if (effectiveDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('prepwise-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('prepwise-theme', 'light');
      }
    } catch (e) {
      // Ignore localStorage errors in restricted environments
    }
  }, [effectiveDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setTheme = (mode) => {
    setIsDarkMode(mode === 'dark');
  };

  const setForcedDarkMode = (force) => {
    setForcedDark(force);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode: effectiveDarkMode,
        toggleTheme,
        setTheme,
        setForcedDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
