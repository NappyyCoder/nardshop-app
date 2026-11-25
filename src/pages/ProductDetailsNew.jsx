import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from "../context/cartcontext";
import '../styles/productdetails.css';
import '../styles/streetwear-product.css';
import '../styles/creative-enhancements.css';

const ProductDetails = ({ regularProducts, limitedTimeProducts }) => {
    const { productId } = useParams();
    const { addToCart } = useCart();
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [sizeError, setSizeError] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const buttonRef = useRef(null);

    const allProducts = [...regularProducts, ...limitedTimeProducts];
    const product = allProducts.find(p => p.id.toString() === productId);

    if (!product) {
        return <div className="product-not-found">Product not found</div>;
    }

    const createRipple = (event) => {
        const button = buttonRef.current;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        const rect = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add("ripple");

        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    };

    const handleAddToCart = (event) => {
        if (!selectedSize) {
            setSizeError(true);
            return;
        }
        setSizeError(false);
        setIsAnimating(true);
        createRipple(event);
        addToCart({ ...product, selectedSize });

        setTimeout(() => {
            setIsAnimating(false);
        }, 1000);
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        setSizeError(false);
    };

    const handleImageSelect = (index) => {
        setSelectedImageIndex(index);
    };

    const handlePreviousImage = () => {
        setSelectedImageIndex(prev =>
            prev === 0 ? galleryImages.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setSelectedImageIndex(prev =>
            prev === galleryImages.length - 1 ? 0 : prev + 1
        );
    };

    const handleImageZoom = () => {
        setIsZoomed(!isZoomed);
    };

    // Use actual gallery images from WordPress, fallback to main image if no gallery
    const galleryImages = product.images && product.images.length > 1
        ? product.images
        : [product.image];

    return (
        <div className="streetwear-product-details">
            {/* Matrix Background Effect */}
            <div className="matrix-bg">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={i}
                        className="matrix-rain"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    >
                        {Array.from({ length: 8 }).map((_, j) => (
                            <div key={j} style={{ marginBottom: '10px', color: '#ffd400' }}>
                                {String.fromCharCode(0x30A0 + Math.random() * 96)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="product-details-container">
                <div className="product-details">
                    <div className="gallery-section">
                        <div className="main-image-container">
                            <img
                                src={galleryImages[selectedImageIndex]}
                                alt={product.name}
                                className={`main-image ${isZoomed ? 'zoomed' : ''}`}
                                onClick={handleImageZoom}
                            />
                            <div className="product-badge cyber-button">FEATURED</div>

                            {/* Navigation Arrows */}
                            {galleryImages.length > 1 && (
                                <>
                                    <button
                                        className="gallery-nav-btn prev-btn"
                                        onClick={handlePreviousImage}
                                        aria-label="Previous image"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        className="gallery-nav-btn next-btn"
                                        onClick={handleNextImage}
                                        aria-label="Next image"
                                    >
                                        ›
                                    </button>
                                </>
                            )}

                            {/* Image Counter */}
                            {galleryImages.length > 1 && (
                                <div className="image-counter">
                                    {selectedImageIndex + 1} / {galleryImages.length}
                                </div>
                            )}
                        </div>
                        <div className="thumbnail-gallery">
                            {galleryImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail-container ${selectedImageIndex === index ? 'active' : ''}`}
                                    onClick={() => handleImageSelect(index)}
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} view ${index + 1}`}
                                        className="thumbnail"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="product-info-section">
                        <div className="product-header">
                            <h1 className="product-title creative-title" data-text={product.name}>{product.name}</h1>
                            <div className="product-price streetwear-accent holographic">${product.price.toFixed(2)}</div>
                        </div>
                        <p className="product-description">{product.description}</p>

                        <div className="size-selection">
                            <h3 className="size-title">SELECT SIZE</h3>
                            <div className="size-buttons">
                                {product.sizes.map(({ size, inStock }) => (
                                    <button
                                        key={size}
                                        className={`size-button streetwear-size-btn ${selectedSize === size ? 'selected' : ''} ${!inStock ? 'out-of-stock' : ''}`}
                                        onClick={() => inStock && handleSizeSelect(size)}
                                        disabled={!inStock}
                                    >
                                        {size}
                                        {!inStock && <span className="out-of-stock-label">SOLD OUT</span>}
                                    </button>
                                ))}
                            </div>
                            {sizeError && <p className="size-error streetwear-error">Please select a size</p>}
                        </div>

                        <button
                            ref={buttonRef}
                            className={`add-to-cart-btn cyber-button ${isAnimating ? 'success' : ''}`}
                            onClick={handleAddToCart}
                            disabled={isAnimating}
                        >
                            {isAnimating ? 'ADDED!' : 'ADD TO CART'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
