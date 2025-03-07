import React from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";
const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} Nardshop. All rights reserved.</p>
                <nav className="footer-nav">
                    <Link to="/terms">Terms &amp; Conditions</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/contact">Contact Us</Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
