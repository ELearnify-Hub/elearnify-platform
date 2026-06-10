// context/ThemeContext.jsx
// Single source of truth for light/dark theme across the full app.

import { createContext, useContext, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  try {
    const storedTheme = localStorage.getItem('elearnify-theme');
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
  } catch {
    // localStorage can fail in private mode
  }
  return 'light';
};

const applyThemeToDocument = (theme) => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    applyThemeToDocument(theme);

    try {
      localStorage.setItem('elearnify-theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggleTheme,
        setLightTheme,
        setDarkTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};

export default ThemeContext;
