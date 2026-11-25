import React, { useRef, useState, useEffect } from "react";
import { useCart } from "../context/cartcontext";
import { Link } from "react-router-dom";
import "../styles/streetwear-home.css";
import "../styles/creative-enhancements.css";

const CreativeHome = ({ regularProducts }) => {
    const { addToCart } = useCart();
    const [animatingButtons, setAnimatingButtons] = useState({});
    const [matrixChars, setMatrixChars] = useState([]);
    const buttonRefs = useRef({});

    // Generate matrix characters
    useEffect(() => {
        const chars = Array.from({ length: 100 }).map(() =>
            String.fromCharCode(0x30A0 + Math.random() * 96)
        );
        setMatrixChars(chars);
    }, []);

    const createRipple = (event, buttonElement) => {
        const circle = document.createElement("span");
        const diameter = Math.max(buttonElement.clientWidth, buttonElement.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - buttonElement.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - buttonElement.offsetTop - radius}px`;
        circle.classList.add("ripple");

        const ripple = buttonElement.getElementsByClassName("ripple")[0];
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
            const ripple = buttonElement.getElementsByClassName("ripple")[0];
            if (ripple) {
                ripple.remove();
            }
        }, 1000);
    };

    return (
        <div className="streetwear-home">
            {/* Matrix Background Effect */}
            <div className="matrix-bg">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="matrix-rain"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    >
                        {matrixChars.slice(i * 5, (i + 1) * 5).map((char, j) => (
                            <div key={j} style={{ marginBottom: '10px', color: '#ffd400' }}>
                                {char}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title creative-title" data-text="NARD STREETWEAR">
                        <span className="hero-title-line">NARD</span>
                        <span className="hero-title-line streetwear-accent">STREETWEAR</span>
                    </h1>
                    <p className="hero-subtitle">
                        LIMITED EDITION DROPS • EXCLUSIVE DESIGNS • STREET CULTURE
                    </p>
                    <div className="hero-cta">
                        <Link to="/limited-time-collection" className="cta-button cyber-button">
                            SHOP LIMITED
                        </Link>
                        <Link to="/about" className="cta-button cyber-button secondary">
                            ABOUT US
                        </Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="streetwear-bg-pattern"></div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="featured-section">
                <div className="section-header">
                    <h2 className="section-title creative-title" data-text="FEATURED DROPS">FEATURED DROPS</h2>
                    <p className="section-subtitle">EXCLUSIVE STREETWEAR COLLECTION</p>
                </div>

                <div className="streetwear-grid-advanced">
                    {regularProducts.map((product, index) => (
                        <div
                            key={product.id}
                            className="streetwear-card-advanced animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="product-image-container">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="product-image"
                                />
                                <div className="product-overlay">
                                    <Link to={`/product/${product.id}`} className="view-product">
                                        VIEW PRODUCT
                                    </Link>
                                </div>
                                <div className="price-tag streetwear-accent">
                                    ${product.price.toFixed(2)}
                                </div>
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-description">{product.description}</p>
                                <button
                                    ref={el => buttonRefs.current[product.id] = el}
                                    className={`add-to-cart-btn cyber-button ${animatingButtons[product.id] ? 'success' : ''}`}
                                    onClick={(e) => handleAddToCart(e, product)}
                                    disabled={animatingButtons[product.id]}
                                >
                                    {animatingButtons[product.id] ? 'ADDED!' : 'ADD TO CART'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="section-footer">
                    <Link to="/" className="view-all-btn cyber-button">
                        VIEW ALL PRODUCTS
                    </Link>
                </div>
            </section>

            {/* Brand Section */}
            <section className="brand-section">
                <div className="brand-content">
                    <h2 className="brand-title creative-title" data-text="NARD CULTURE">NARD CULTURE</h2>
                    <p className="brand-description">
                        WHERE STREET MEETS ART • WHERE FASHION MEETS REBELLION • WHERE YOU MEET YOURSELF
                    </p>
                    <div className="brand-cta">
                        <Link to="/about" className="cta-button cyber-button">
                            JOIN THE MOVEMENT
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CreativeHome;
