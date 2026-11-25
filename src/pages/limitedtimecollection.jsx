import React, { useState, useEffect } from "react";
import { useCart } from "../context/cartcontext";
import { Link } from "react-router-dom";
import ProductImageGallery from "../components/ProductImageGallery";
import "../styles/spring-animations.css";
import "../styles/limitedtimecollection.css";
import "../styles/streetwear-home.css";
import "../styles/streetwear-limited.css";
import "../styles/creative-enhancements.css";
import "../styles/productgallery.css";

const LimitedTimeCollectionPage = ({ limitedTimeProducts, regularProducts }) => {
    const { addToCart } = useCart();
    // Set countdown end date to February 4th, 2026 at 5:00 PM Eastern Time (Indiana)
    const countdownEndDate = new Date('2026-02-04T17:00:00-05:00');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [animatingButtons, setAnimatingButtons] = useState({});
    const buttonRefs = React.useRef({});

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date();
            const difference = countdownEndDate - now;
            return Math.max(0, Math.floor(difference / 1000)); // Convert to seconds
        };

        // Set initial time
        setTimeRemaining(calculateTimeRemaining());

        // Update every second
        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (time) => {
        const days = Math.floor(time / 86400);
        const hours = Math.floor((time % 86400) / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;

        return (
            <div className="countdown-wrapper">
                {days > 0 && (
                    <div className="time-unit">
                        <span>{String(days).padStart(2, "0")}</span>
                        <small>DAYS</small>
                    </div>
                )}
                <div className="time-unit">
                    <span>{String(hours).padStart(2, "0")}</span>
                    <small>HRS</small>
                </div>
                <div className="time-unit">
                    <span>{String(minutes).padStart(2, "0")}</span>
                    <small>MIN</small>
                </div>
                <div className="time-unit">
                    <span>{String(seconds).padStart(2, "0")}</span>
                    <small>SEC</small>
                </div>
            </div>
        );
    };

    const createRipple = (event, buttonElement) => {
        const circle = document.createElement("span");
        const diameter = Math.max(buttonElement.clientWidth, buttonElement.clientHeight);
        const radius = diameter / 2;

        const rect = buttonElement.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add("spring-ripple");

        const ripple = buttonElement.getElementsByClassName("spring-ripple")[0];
        if (ripple) {
            ripple.remove();
        }

        buttonElement.appendChild(circle);
    };

    const handleAddToCart = (event, product) => {
        event.preventDefault();

        if (animatingButtons[product.id]) return;

        const buttonElement = buttonRefs.current[product.id];

        // Set animating state
        setAnimatingButtons(prev => ({ ...prev, [product.id]: true }));

        // Create ripple effect
        createRipple(event, buttonElement);

        // Add to cart
        addToCart(product);

        // Add success class
        buttonElement.classList.add('success');

        // Reset after animation
        setTimeout(() => {
            setAnimatingButtons(prev => ({ ...prev, [product.id]: false }));
            buttonElement.classList.remove('success');
            const ripple = buttonElement.getElementsByClassName("spring-ripple")[0];
            if (ripple) {
                ripple.remove();
            }
        }, 800);
    };

    // Filter products to show pool ball items (based on categories or product names)
    const poolBallProducts = [...limitedTimeProducts, ...regularProducts].filter(product =>
        product.categories && product.categories.some(cat =>
            cat.name.toLowerCase().includes('pool') ||
            cat.slug.toLowerCase().includes('pool')
        ) ||
        product.name.toLowerCase().includes('pool') ||
        product.name.toLowerCase().includes('skeleton')
    );

    return (
        <div className="streetwear-limited-collection">
            {/* Matrix Background Effect */}
            <div className="matrix-bg">
                {Array.from({ length: 25 }).map((_, i) => (
                    <div
                        key={i}
                        className="matrix-rain"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    >
                        {Array.from({ length: 12 }).map((_, j) => (
                            <div key={j} style={{ marginBottom: '10px', color: '#ffd400' }}>
                                {String.fromCharCode(0x30A0 + Math.random() * 96)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Hero Section */}
            <section className="limited-hero-section">
                <div className="hero-content">
                    <h1 className="hero-title creative-title" data-text="POOL BALL COLLECTION">
                        <span className="hero-title-line">POOL BALL</span>
                        <span className="hero-title-line streetwear-accent">COLLECTION</span>
                    </h1>
                    <p className="hero-subtitle">
                        LIMITED EDITION • SKELETON DESIGN • STREET CULTURE
                    </p>

                    {/* Countdown Timer */}
                    <div className="countdown-section">
                        <h3 className="countdown-label">THE JOURNEY ENDS IN:</h3>
                        <div className="countdown-timer holographic">
                            {formatTime(timeRemaining)}
                        </div>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="pool-ball-pattern"></div>
                </div>
            </section>

            {/* Products Section */}
            <section className="limited-products-section">
                <div className="section-header">
                    <h2 className="section-title">POOL BALL DROPS</h2>
                    <p className="section-subtitle">Exclusive skeleton pool ball designs</p>
                </div>

                <div className="streetwear-grid">
                    {poolBallProducts.map((product, index) => (
                        <div
                            key={product.id}
                            className="streetwear-card product-card animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <Link to={`/product/${product.id}`} className="product-link">
                                <div className="product-image-container">
                                    <div className="price-tag streetwear-accent">${product.price.toFixed(2)}</div>
                                    <ProductImageGallery
                                        product={product}
                                        className="product-image"
                                    />
                                    <div className="product-overlay">
                                        <span className="view-product">VIEW PRODUCT</span>
                                    </div>
                                </div>
                                <div className="product-info">
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-description">{product.description}</p>
                                </div>
                            </Link>
                            <button
                                ref={el => buttonRefs.current[product.id] = el}
                                className="add-to-cart-btn cyber-button spring-button"
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={animatingButtons[product.id]}
                            >
                                {animatingButtons[product.id] ? 'ADDED!' : 'ADD TO CART'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="section-footer">
                    <Link to="/" className="view-all-btn">
                        BACK TO HOME →
                    </Link>
                </div>
            </section>

            {/* Limited Edition Info */}
            <section className="limited-info-section">
                <div className="info-content">
                    <h2 className="info-title">LIMITED EDITION</h2>
                    <p className="info-description">
                        Each piece in our Pool Ball Collection is a limited edition drop.
                        Once sold out, these designs will never be reproduced.
                        Own a piece of streetwear history.
                    </p>
                    <div className="info-features">
                        <div className="feature">
                            <span className="feature-icon">⚡</span>
                            <span className="feature-text">LIMITED QUANTITY</span>
                        </div>
                        <div className="feature">
                            <span className="feature-icon">🎯</span>
                            <span className="feature-text">EXCLUSIVE DESIGN</span>
                        </div>
                        <div className="feature">
                            <span className="feature-icon">🔥</span>
                            <span className="feature-text">STREET CULTURE</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LimitedTimeCollectionPage;
