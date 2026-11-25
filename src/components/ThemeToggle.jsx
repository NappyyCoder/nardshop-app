import React from 'react';
import { useTheme } from '../context/ThemeContext';
import '../styles/theme-toggle.css';

const ThemeToggle = () => {
    const { toggleTheme, isDark } = useTheme();

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        >
            <div className="theme-toggle-track">
                <div className={`theme-toggle-thumb ${isDark ? 'dark' : 'light'}`}>
                    <div className="theme-icon">
                        {isDark ? (
                            // Moon icon for dark theme
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        ) : (
                            // Sun icon for light theme
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
            <span className="theme-label">
                {isDark ? 'DARK' : 'LIGHT'}
            </span>
        </button>
    );
};

export default ThemeToggle;
