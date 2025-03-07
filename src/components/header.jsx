import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/cartcontext";
import logo from "../assets/logo.png";
import "../styles/header.css";

const Header = () => {
    const { cart } = useCart(); // Change this from cartItems to cart

    return (
        <header className="header">
            <nav className="nav">
                <Link to="/">Home</Link>
                <Link to="/limited-time-collection">Limited Time Collection</Link>
                <Link to="/about">About Us</Link>
                <Link to="/shipping-returns">Shipping & Returns</Link>
            </nav>
            <div className="logo">
                <Link to="/">
                    <img src={logo} alt="Nardshop Logo" className="logo-image" />
                </Link>
            </div>
            <div className="cart">
                <Link to="/cartpage">
                    🛒 <span className="cart-count">{cart.length}</span>
                </Link>
            </div>
        </header>
    );
};

export default Header;
