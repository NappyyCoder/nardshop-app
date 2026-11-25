import React, { useRef, useState } from "react";
import { useCart } from "../context/cartcontext";
import { Link } from "react-router-dom";
import ProductImageGallery from "../components/ProductImageGallery";
import "../styles/spring-animations.css";
import "../styles/productgallery.css";
import "../styles/productdetails.css";
import "../styles/streetwear-home.css";
import "../styles/creative-enhancements.css";

const Home = ({ regularProducts }) => {
    const { addToCart } = useCart();
    const [animatingButtons, setAnimatingButtons] = useState({});
    const buttonRefs = useRef({});

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

    return (
        <div className="streetwear-home">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="hero-title-line">NARD</span>
                        <span className="hero-title-line streetwear-accent">STREETWEAR</span>
                    </h1>
                    <p className="hero-subtitle">
                        LIMITED EDITION DROPS • EXCLUSIVE DESIGNS • STREET CULTURE
                    </p>
                    <div className="hero-cta">
                        <Link to="/limited-time-collection" className="cta-button spring-button">
                            SHOP LIMITED
                        </Link>
                        <Link to="/about" className="cta-button secondary spring-button">
                            OUR STORY
                        </Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-pattern streetwear-bg-pattern"></div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="featured-section">
                <div className="section-header">
                    <h2 className="section-title">FEATURED DROPS</h2>
                    <p className="section-subtitle">Latest releases from the NARD collection</p>
                </div>

                <div className="streetwear-grid">
                    {regularProducts.map((product, index) => (
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
                                className="add-to-cart-btn streetwear-btn spring-button"
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={animatingButtons[product.id]}
                            >
                                ADD TO CART
                            </button>
                        </div>
                    ))}
                </div>

                <div className="section-footer">
                    <Link to="/limited-time-collection" className="view-all-btn">
                        VIEW ALL PRODUCTS →
                    </Link>
                </div>
            </section>

            {/* Brand Section */}
            <section className="brand-section">
                <div className="brand-content">
                    <h2 className="brand-title">ABOUT NARD</h2>
                    <p className="brand-description">
                        Born from the streets, built for the culture. NARD represents the intersection
                        of art, fashion, and urban lifestyle. Each piece tells a story, each drop
                        creates a moment.
                    </p>
                    <Link to="/about" className="brand-cta">
                        LEARN MORE
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
