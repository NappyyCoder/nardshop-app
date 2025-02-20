import React from "react";
import { useCart } from "../context/cartcontext";
import "../styles/cartpage.css";

const CartPage = () => {
    const { cartItems } = useCart();

    // Calculate total price
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="cart-page">
            <h1>Your Cart</h1>
            {cartItems.length === 0 ? (
                <p className="empty-cart-message">Your cart is empty.</p>
            ) : (
                <>
                    <div className="cart-items-list">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-image-container">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="cart-item-image"
                                    />
                                </div>
                                <div className="cart-item-details">
                                    <h3>{item.name}</h3>
                                    <p className="cart-item-description">{item.description}</p>
                                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                                    <div className="cart-item-quantity">
                                        <span>Quantity: {item.quantity}</span>
                                    </div>
                                    <p className="cart-item-total">
                                        Total: ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <div className="cart-total">
                            <h2>Cart Total: ${total.toFixed(2)}</h2>
                        </div>
                        <button className="checkout-btn">
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
