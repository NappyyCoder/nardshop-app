import React from 'react';
import '../styles/privacy.css';

const PrivacyPolicy = () => {
    return (
        <div className="privacy-page">
            <div className="privacy-container">
                <h1>Privacy Policy</h1>
                <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2>1. Information We Collect</h2>
                    <h3>1.1 Personal Information</h3>
                    <p>We collect information that you provide directly to us, including:</p>
                    <ul>
                        <li>Name and contact information</li>
                        <li>Billing and shipping address</li>
                        <li>Email address</li>
                        <li>Phone number</li>
                        <li>Payment information</li>
                    </ul>

                    <h3>1.2 Automatically Collected Information</h3>
                    <p>When you visit our website, we automatically collect:</p>
                    <ul>
                        <li>Device information</li>
                        <li>IP address</li>
                        <li>Browser type</li>
                        <li>Usage data</li>
                        <li>Cookies and similar technologies</li>
                    </ul>
                </section>

                <section>
                    <h2>2. How We Use Your Information</h2>
                    <p>We use the collected information to:</p>
                    <ul>
                        <li>Process your orders and payments</li>
                        <li>Communicate with you about your orders</li>
                        <li>Send you marketing communications (with your consent)</li>
                        <li>Improve our website and services</li>
                        <li>Protect against fraud and unauthorized transactions</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Information Sharing</h2>
                    <p>We may share your information with:</p>
                    <ul>
                        <li>Payment processors and shipping partners</li>
                        <li>Service providers who assist our operations</li>
                        <li>Law enforcement when required by law</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access your personal information</li>
                        <li>Correct inaccurate information</li>
                        <li>Request deletion of your information</li>
                        <li>Opt-out of marketing communications</li>
                        <li>Lodge a complaint with supervisory authorities</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your
                        personal information. However, no method of transmission over the Internet is
                        100% secure, and we cannot guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h2>6. Cookies</h2>
                    <p>
                        We use cookies and similar tracking technologies to track activity on our website
                        and hold certain information. You can instruct your browser to refuse all cookies
                        or to indicate when a cookie is being sent.
                    </p>
                </section>

                <section>
                    <h2>7. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at:
                    </p>
                    <div className="contact-info">
                        <p>Email: privacy@nardshop.com</p>
                        <p>Phone: (555) 123-4567</p>
                        <p>Address: 123 Fashion Street, New York, NY 10001</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;