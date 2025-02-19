import React from "react";
import "../styles/footer.css";
const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} Nardshop. All rights reserved.</p>
                <nav className="footer-nav">
                    <a href="/terms">Terms &amp; Conditions</a>
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/contact">Contact Us</a>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
