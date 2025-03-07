import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../styles/ordersuccess.css';

const OrderSuccessPage = () => {
    const location = useLocation();
    const { orderDetails, cartItems } = location.state || { orderDetails: {}, cartItems: [] };

    return (
        <div className="order-success-page">
            <div className="success-container">
                <h1>🎉 Thank You for Your Order! 🎉</h1>
                <p className="success-message">
                    Hi {orderDetails.firstName}, your order has been successfully placed!
                    We'll send a confirmation email to {orderDetails.email} shortly.
                </p>

                <div className="order-details">
                    <h2>Order Summary</h2>
                    <div className="ordered-items">
                        {cartItems.map((item) => (
                            <div key={item.id} className="ordered-item">
                                <img src={item.image} alt={item.name} className="item-image" />
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="shipping-info">
                        <h2>Shipping Address</h2>
                        <p>
                            {orderDetails.firstName} {orderDetails.lastName}<br />
                            {orderDetails.address}<br />
                            {orderDetails.city}, {orderDetails.state} {orderDetails.zipCode}
                        </p>
                    </div>
                </div>

                <Link to="/" className="continue-shopping-btn">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccessPage;