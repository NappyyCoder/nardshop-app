import React, { useState } from 'react';
import { useCart } from "../context/cartcontext";
import { useNavigate } from 'react-router-dom';
import '../styles/checkoutpage.css';

const CheckoutPage = () => {
    const { cart } = useCart();  // Change from cartItems to cart
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5.99;
    const tax = total * 0.08; // 8% tax
    const finalTotal = total + shipping + tax;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically handle payment processing

        // Navigate to success page with order details
        navigate('/order-success', {
            state: {
                orderDetails: formData,
                cartItems: cart  // Change this to cart as well
            }
        });
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <div className="order-summary">
                    <h2>Order Summary</h2>
                    <div className="order-items">
                        {cart.map((item) => (
                            <div key={item.id} className="order-item">
                                <img src={item.image} alt={item.name} className="item-image" />
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="order-totals">
                        <div className="total-line">
                            <span>Subtotal:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="total-line">
                            <span>Shipping:</span>
                            <span>${shipping.toFixed(2)}</span>
                        </div>
                        <div className="total-line">
                            <span>Tax:</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="total-line final-total">
                            <span>Total:</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <form className="checkout-form" onSubmit={handleSubmit}>
                    <h2>Shipping Information</h2>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="state">State</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="zipCode">ZIP Code</label>
                            <input
                                type="text"
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <h2>Payment Information</h2>
                    <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="expiryDate">Expiry Date</label>
                            <input
                                type="text"
                                id="expiryDate"
                                name="expiryDate"
                                placeholder="MM/YY"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cvv">CVV</label>
                            <input
                                type="text"
                                id="cvv"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="place-order-btn">
                        Place Order
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
