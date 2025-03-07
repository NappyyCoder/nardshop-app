import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from "../context/cartcontext";
import '../styles/productdetails.css';

const ProductDetails = ({ regularProducts, limitedTimeProducts }) => {
    const { productId } = useParams();
    const { addToCart } = useCart();
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [sizeError, setSizeError] = useState(false);
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

    const galleryImages = [product.image, product.image, product.image];

    return (
        <div className="product-details-container">
            <div className="product-details">
                <div className="gallery-section">
                    <div className="main-image-container">
                        <img src={product.image} alt={product.name} className="main-image" />
                    </div>
                    <div className="thumbnail-gallery">
                        {galleryImages.map((img, index) => (
                            <div key={index} className="thumbnail-container">
                                <img src={img} alt={`${product.name} view ${index + 1}`} className="thumbnail" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="product-info-section">
                    <h1 className="product-title">{product.name}</h1>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    <p className="product-description">{product.description}</p>

                    <div className="size-selection">
                        <h3>Select Size</h3>
                        <div className="size-buttons">
                            {product.sizes.map(({ size, inStock }) => (
                                <button
                                    key={size}
                                    className={`size-button ${selectedSize === size ? 'selected' : ''} ${!inStock ? 'out-of-stock' : ''}`}
                                    onClick={() => inStock && handleSizeSelect(size)}
                                    disabled={!inStock}
                                >
                                    {size}
                                    {!inStock && <span className="out-of-stock-label">Out of Stock</span>}
                                </button>
                            ))}
                        </div>
                        {sizeError && <p className="size-error">Please select a size</p>}
                    </div>

                    <button
                        ref={buttonRef}
                        className={`add-to-cart-btn ${isAnimating ? 'success' : ''}`}
                        onClick={handleAddToCart}
                        disabled={isAnimating}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
