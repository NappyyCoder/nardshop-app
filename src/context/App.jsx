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
import spikedHeart from '../assets/spiked-heart-t.jpg';
import alienBoy from '../assets/alien-boy-black-.jpg';
import nardintergal from '../assets/NARD-INTERGAL-WHITE-TEE.jpg';
import nardflame from '../assets/NARD-FLAME-PROTO-6.png';
import sunshine from '../assets/sumshine-black.jpg';



function App() {
  const [limitedTimeProducts, setLimitedTimeProducts] = useState([
    {
      id: 1,
      name: 'Limited Edition Flame Tee',
      price: 39.99,
      description: 'Exclusive NARD flame design, available for a limited time only',
      image: nardflame
    },
    {
      id: 2,
      name: 'Sunshine Special',
      price: 34.99,
      description: 'Limited release sunshine design on premium black cotton',
      image: sunshine
    },
    {
      id: 2,
      name: 'Sunshine Special',
      price: 34.99,
      description: 'Limited release sunshine design on premium black cotton',
      image: sunshine
    }

  ]);

  const [regularProducts, setRegularProducts] = useState([
    {
      id: 1,
      name: 'Alien Boy',
      price: 34.99,
      description: 'I made this in my Digital imaging class it was really fun',
      image: alienBoy
    },
    {
      id: 2,
      name: 'InterGalictic Nard Tee Shirt',
      price: 34.99,
      description: 'Traditional milk tea with chewy tapioca pearls',
      image: nardintergal
    },
    {
      id: 3,
      name: 'Flame Nard T-Shirt ',
      price: 32.99,
      description: 'High-quality loose leaf green tea from Japan',
      image: nardflame
    },
    {
      id: 4,
      name: 'Sunshine Nard T-Shirt',
      price: 34.99,
      description: 'Tropical mango-flavored freeze pop, a refreshing frozen treat',
      image: sunshine
    },

    {
      id: 5,
      name: 'Spiked Heart Pendant',
      price: 24.99,
      description: 'Edgy and stylish spiked heart pendant necklace',
      image: spikedHeart
    },
    {
      id: 5,
      name: 'Spiked Heart Pendant',
      price: 24.99,
      description: 'Edgy and stylish spiked heart pendant necklace',
      image: spikedHeart
    },
    {
      id: 4,
      name: 'Sunshine Nard T-Shirt',
      price: 34.99,
      description: 'Tropical mango-flavored freeze pop, a refreshing frozen treat',
      image: sunshine
    },

    {
      id: 5,
      name: 'Spiked Heart Pendant',
      price: 24.99,
      description: 'Edgy and stylish spiked heart pendant necklace',
      image: spikedHeart
    },
    {
      id: 5,
      name: 'Spiked Heart Pendant',
      price: 24.99,
      description: 'Edgy and stylish spiked heart pendant necklace',
      image: spikedHeart
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
