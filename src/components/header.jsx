import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/cartcontext";
import logo from "../assets/logo.png";
import "../styles/spring-animations.css";
import "../styles/header.css";

const Header = () => {
    const { cart } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="streetwear-header">
            <div className="header-container">
                {/* Mobile Menu Button */}
                <button 
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>

                {/* Logo - Enlarged & Eye-Catching */}
                <div className="header-logo">
                    <Link to="/" className="logo-link spring-hover-bounce">
                        <img src={logo} alt="NARD" className="logo-image" />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="header-nav desktop-nav">
                    <Link to="/" className="nav-link">HOME</Link>
                    <Link to="/limited-time-collection" className="nav-link">LIMITED</Link>
                    <Link to="/about" className="nav-link">ABOUT</Link>
                    <Link to="/contact" className="nav-link">CONTACT</Link>
                </nav>

                {/* Cart */}
                <div className="header-cart">
                    <Link to="/cartpage" className="cart-link">
                        <div className="cart-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" fill="currentColor"/>
                                <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z" fill="currentColor"/>
                            </svg>
                        </div>
                        {cart.length > 0 && (
                            <span className="cart-badge">{cart.length}</span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Mobile Navigation */}
            <nav className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
                <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>HOME</Link>
                <Link to="/limited-time-collection" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>LIMITED TIME</Link>
                <Link to="/about" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>ABOUT US</Link>
                <Link to="/contact" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>CONTACT</Link>
                <Link to="/shipping-returns" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>SHIPPING & RETURNS</Link>
            </nav>
        </header>
    );
};

export default Header;
