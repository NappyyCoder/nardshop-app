import React, { useState, useEffect } from "react";
import { useCart } from "../context/cartcontext";
import "../styles/limitedtimecollection.css";

const LimitedTimeCollectionPage = ({ limitedTimeProducts }) => {
    const { addToCart } = useCart();
    const [timeRemaining, setTimeRemaining] = useState(24 * 60 * 60); // 24 hours in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    return (
        <div className="limited-time-collection-page">
            <h1 className="page-title">Limited Time Collection</h1>
            <p className="countdown-timer">
                Time remaining: {formatTime(timeRemaining)}
            </p>
            <div className="product-gallery">
                {limitedTimeProducts.map((product) => (
                    <div key={product.id} className="product-card">
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
                            <button
                                className="add-to-cart-btn"
                                onClick={() => addToCart(product)}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LimitedTimeCollectionPage;
