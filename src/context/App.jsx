import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import Home from '../pages/home';
import CartPage from "../pages/cartpage";
import CartProvider from "./cartcontext";
import LimitedTimeCollectionPage from '../pages/limitedtimecollection';
import ShippingReturnsPage from '../pages/shippingandreturns';
import AboutUsPage from '../pages/aboutus';


function App() {
  const [limitedTimeProducts, setLimitedTimeProducts] = useState([
    { id: 1, name: 'Limited Product 1', price: 20, description: 'Description for Limited Product 1', image: 'path/to/image1.jpg' },
    { id: 2, name: 'Limited Product 2', price: 30, description: 'Description for Limited Product 2', image: 'path/to/image2.jpg' },
  ]);

  const [regularProducts, setRegularProducts] = useState([
    {
      id: 1,
      name: 'Italian Ice - Lemon',
      price: 4.99,
      description: 'Refreshing lemon-flavored Italian ice, perfect for hot summer days',
      image: 'https://images.unsplash.com/photo-1558234469-50fc184d1cc9?w=800&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Bubble Tea - Classic Milk Tea',
      price: 5.99,
      description: 'Traditional milk tea with chewy tapioca pearls',
      image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=800&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Premium Green Tea',
      price: 12.99,
      description: 'High-quality loose leaf green tea from Japan',
      image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&auto=format&fit=crop'
    },
    {
      id: 4,
      name: 'Mango Freeze Pop',
      price: 3.99,
      description: 'Tropical mango-flavored freeze pop, a refreshing frozen treat',
      image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800&auto=format&fit=crop'
    },
    {
      id: 5,
      name: 'Sparkling Fruit Punch RTD',
      price: 4.50,
      description: 'Ready-to-drink sparkling fruit punch with natural flavors',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop'
    },
    {
      id: 6,
      name: 'Earl Grey Tea Blend',
      price: 14.99,
      description: 'Premium loose leaf Earl Grey tea with bergamot',
      image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop'
    },
    {
      id: 7,
      name: 'Watermelon Italian Ice',
      price: 4.99,
      description: 'Sweet and refreshing watermelon-flavored Italian ice',
      image: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=800&auto=format&fit=crop'
    },
    {
      id: 8,
      name: 'Passion Fruit Bubble Tea',
      price: 6.99,
      description: 'Tropical passion fruit bubble tea with popping boba',
      image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop'
    },
    {
      id: 9,
      name: 'Chamomile Herbal Tea',
      price: 11.99,
      description: 'Calming loose leaf chamomile tea for relaxation',
      image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&auto=format&fit=crop'
    },
    {
      id: 10,
      name: 'Blue Raspberry Freeze Pop',
      price: 3.99,
      description: 'Classic blue raspberry freeze pop, a nostalgic favorite',
      image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&auto=format&fit=crop'
    },
    {
      id: 11,
      name: 'Spiked Heart Pendant',
      price: 24.99,
      description: 'Edgy and stylish spiked heart pendant necklace',
      image: '/src/assets/spiked-heart.jpg'
    }
  ]);

  return (
    <CartProvider>
      <Router basename="/nardshop-app">
        <Header />
        <Routes>
          <Route path="/" element={<Home regularProducts={regularProducts} />} />
          <Route
            path="/limited-time-collection"
            element={<LimitedTimeCollectionPage limitedTimeProducts={limitedTimeProducts} />}
          />
          <Route path="/cartpage" element={<CartPage />} />
          <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
        </Routes>
        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App;
