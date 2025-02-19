import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../components/header'; // Your header component
import Home from '../pages/home'; // Assuming this is the home page
import CartPage from "../pages/cartpage"
import CartProvider from "./cartcontext"; // Your cart context provider
import LimitedTimeCollectionPage from '../pages/limitedtimecollection'; // Your limited time collection page
import ShippingReturnsPage from '../pages/shippingandreturns'; // Your shipping & returns page
import AboutUsPage from '../pages/aboutus'; // Assuming you have an About Us page

function App() {
  const [cart, setCart] = useState([]);
  const [limitedTimeProducts, setLimitedTimeProducts] = useState([
    { id: 1, name: 'Limited Product 1', price: 20, description: 'Description for Limited Product 1', image: 'path/to/image1.jpg' },
    { id: 2, name: 'Limited Product 2', price: 30, description: 'Description for Limited Product 2', image: 'path/to/image2.jpg' },
    // Add more products as needed
  ]);

  // Add regular products
  const [regularProducts, setRegularProducts] = useState([
    { id: 1, name: 'Product 1', price: 20, description: 'Description for Product 1' },
    { id: 2, name: 'Product 2', price: 30, description: 'Description for Product 2' },
    // Add more products as needed
  ]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  return (
    <CartProvider>
      <Router basename="/nardshop-app"> {/* Ensure basename is set correctly for deployment */}
        <Header />
        <Routes>
          <Route path="/" element={<Home regularProducts={regularProducts} addToCart={addToCart} />} />
          <Route
            path="/limited-time-collection"
            element={<LimitedTimeCollectionPage limitedTimeProducts={limitedTimeProducts} addToCart={addToCart} />}
          />
          <Route path="/cartpage" element={<CartPage />} />
          <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
