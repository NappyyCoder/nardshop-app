import React, { useRef, useState } from "react";
import { useCart } from "../context/cartcontext";
import { Link } from "react-router-dom";
import "../styles/productgallery.css";
import "../styles/productdetails.css"; // Add this import for the button styles

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
        <div>
            <h1 className="page-title">Home</h1>
            <div className="product-gallery">
                {regularProducts.map((product) => (
                    <div key={product.id} className="product-card">
                        <Link to={`/product/${product.id}`} className="product-link">
                            <div className="product-image-container">
                                <div className="price-tag">${product.price.toFixed(2)}</div>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="product-image"
                                />
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-description">{product.description}</p>
                            </div>
                        </Link>
                        <button
                            ref={el => buttonRefs.current[product.id] = el}
                            className="add-to-cart-btn"
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={animatingButtons[product.id]}
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
