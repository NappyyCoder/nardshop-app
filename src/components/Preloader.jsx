import React from 'react';
import preloaderGif from '../assets/nard-tv-preloader.gif';
import '../styles/preloader.css';

const Preloader = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="preloader-overlay">
            <div className="preloader-container">
                <div className="preloader-content">
                    <img 
                        src={preloaderGif} 
                        alt="NARD loading" 
                        className="preloader-gif"
                    />
                    <div className="preloader-text">
                        <h2 className="preloader-title">NARD</h2>
                        <p className="preloader-subtitle">LOADING STREETWEAR...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
