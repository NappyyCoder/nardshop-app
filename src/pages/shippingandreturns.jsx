// ShippingReturnsPage.jsx
import React from 'react';
import '../styles/shippingandreturn.css'; // Add styling if needed

const ShippingReturnsPage = () => {
    return (
        <div className="shipping-returns-page">
            <h1>Shipping & Returns</h1>

            <section className="shipping">
                <h2>Shipping Policy</h2>
                <p>
                    We offer fast and reliable shipping on all orders. Orders typically ship within 2-3 business days. Once shipped, you will receive a tracking number to follow your package. Delivery times may vary depending on your location.
                </p>
                <ul>
                    <li>Standard Shipping: 5-7 business days</li>
                    <li>Express Shipping: 2-3 business days</li>
                    <li>International Shipping: 7-14 business days (customs may affect delivery time)</li>
                </ul>
                <p>If you have any issues with your shipping, please contact our customer support team.</p>
            </section>

            <section className="returns">
                <h2>Return Policy</h2>
                <p>
                    We want you to be completely satisfied with your purchase. If you're not happy with an item, we offer a 30-day return policy.
                </p>
                <ul>
                    <li>Items must be returned within 30 days of receiving the order.</li>
                    <li>Returns are accepted for unused and unworn items in their original packaging.</li>
                    <li>Refunds will be issued to the original payment method.</li>
                    <li>Return shipping costs are the responsibility of the customer.</li>
                </ul>
                <p>To initiate a return, please contact our customer service team at support@nardshop.com.</p>
            </section>

            <section className="contact">
                <h2>Contact Us</h2>
                <p>If you have any questions or need further assistance, feel free to reach out to us:</p>
                <ul>
                    <li>Email: support@nardshop.com</li>
                    <li>Phone: (555) 123-4567</li>
                </ul>
            </section>
        </div>
    );
};

export default ShippingReturnsPage;
