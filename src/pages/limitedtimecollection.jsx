import React, { useState, useEffect } from "react";
import { useCart } from "../context/cartcontext"; // Access cart context
import "../styles/limitedtimecollection.css";

const LimitedTimeCollectionPage = ({ limitedTimeProducts }) => {
    const [timeRemaining, setTimeRemaining] = useState(3600); // Example: 1 hour in seconds
    const { addToCart } = useCart(); // Access addToCart function from context

    // Countdown timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeRemaining((prevTime) => {
                if (prevTime <= 0) {
                    clearInterval(interval); // Stop the countdown when time is up
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(interval); // Clean up the interval on unmount
    }, []);

    // Format the remaining time to HH:MM:SS
    const formatTime = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    return (
        <div className="limited-time-collection-page">
            <h1>Limited Time Collection</h1>
            <p className="countdown-timer">
                Time remaining: {formatTime(timeRemaining)}
            </p>
            <div className="product-gallery">
                {limitedTimeProducts.map((product) => (
                    <div key={product.id} className="product-card">
                        <img src={product.image} alt={product.name} className="product-image" />
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p className="price">${product.price}</p>
                        <button onClick={() => addToCart(product)} className="add-to-cart-btn">
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LimitedTimeCollectionPage;
