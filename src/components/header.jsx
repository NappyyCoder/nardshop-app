import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/cartcontext"; // Access cart items from context
import "../styles/header.css";

const Header = () => {
    const { cartItems } = useCart(); // Access cartItems from context

    return (
        <header className="header">
            <div className="logo">
                <Link to="/">Nardshop</Link>
            </div>
            <nav className="nav">
                <Link to="/limited-time-collection">Limited Time Collection</Link>
                <Link to="/about">About Us</Link>
                <Link to="/shipping-returns">Shipping & Returns</Link>
            </nav>
            <div className="cart">
                <Link to="/cartpage">
                    🛒 <span className="cart-count">{cartItems.length}</span>
                </Link>
            </div>
        </header>
    );
};

export default Header;
