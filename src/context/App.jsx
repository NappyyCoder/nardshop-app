import React, { memo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CartProvider from "./cartcontext";
import Header from '../components/header';
import Footer from '../components/footer';
import Home from '../pages/home';
import CartPage from "../pages/cartpage";
import LimitedTimeCollectionPage from '../pages/limitedtimecollection';
import ShippingReturnsPage from '../pages/shippingandreturns';
import AboutUsPage from '../pages/aboutus';
import ProductDetails from '../pages/ProductDetailsNew.jsx';
import CheckoutPage from '../pages/checkoutpage';
import OrderSuccessPage from '../pages/ordersuccess';
import ContactPage from '../pages/contact';
import PrivacyPolicy from '../pages/privacy';
import spikedHeart from '../assets/spiked-heart-t.jpg';
import alienBoy from '../assets/alien-boy-black-.jpg';
import nardintergal from '../assets/NARD-INTERGAL-WHITE-TEE.jpg';
import nardflame from '../assets/NARD-FLAME-PROTO-6.png';
import sunshine from '../assets/sumshine-black.jpg';

const MemoizedHeader = memo(Header);
const MemoizedFooter = memo(Footer);

function App() {
  const [limitedTimeProducts] = useState([
    {
      id: 1,
      name: "Spiked Heart T-Shirt",
      description: "Limited Edition Spiked Heart Design",
      price: 29.99,
      image: spikedHeart,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: false }
      ]
    },
    {
      id: 2,
      name: "Alien Boy T-Shirt",
      description: "Limited Edition Alien Boy Design",
      price: 29.99,
      image: alienBoy,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 3,
      name: "Alien Boy T-Shirt",
      description: "Limited Edition Alien Boy Design",
      price: 29.99,
      image: alienBoy,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 4,
      name: "Alien Boy T-Shirt",
      description: "Limited Edition Alien Boy Design",
      price: 29.99,
      image: alienBoy,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 5,
      name: "Alien Boy T-Shirt",
      description: "Limited Edition Alien Boy Design",
      price: 29.99,
      image: alienBoy,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 6,
      name: "Alien Boy T-Shirt",
      description: "Limited Edition Alien Boy Design",
      price: 29.99,
      image: alienBoy,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 7,
      name: "Alien Boy T-Shirt",
      description: "Limited Edition Alien Boy Design",
      price: 29.99,
      image: alienBoy,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 8,
      name: "Alien Boy T-Shirt",
      description: "Limited Edition Alien Boy Design",
      price: 29.99,
      image: alienBoy,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 9,
      name: "Alien Boy T-Shirt",
      description: "Limited Edition Alien Boy Design",
      price: 29.99,
      image: alienBoy,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    }
  ]);

  const [regularProducts] = useState([
    {
      id: 3,
      name: "NARD INTERGAL White Tee",
      description: "Classic NARD INTERGAL Design",
      price: 24.99,
      image: nardintergal,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 4,
      name: "NARD FLAME PROTO",
      description: "Classic NARD FLAME Design",
      price: 24.99,
      image: nardflame,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 5,
      name: "Sunshine Black Tee",
      description: "Classic Sunshine Design",
      price: 24.99,
      image: sunshine,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 6,
      name: "Sunshine Black Tee",
      description: "Classic Sunshine Design",
      price: 24.99,
      image: sunshine,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },

    {
      id: 7,
      name: "Sunshine Black Tee",
      description: "Classic Sunshine Design",
      price: 24.99,
      image: sunshine,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 8,
      name: "Sunshine Black Tee",
      description: "Classic Sunshine Design",
      price: 24.99,
      image: sunshine,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 8,
      name: "Sunshine Black Tee",
      description: "Classic Sunshine Design",
      price: 24.99,
      image: sunshine,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 9,
      name: "Sunshine Black Tee",
      description: "Classic Sunshine Design",
      price: 24.99,
      image: sunshine,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    },
    {
      id: 10,
      name: "Sunshine Black Tee",
      description: "Classic Sunshine Design",
      price: 24.99,
      image: sunshine,
      sizes: [
        { size: "S", inStock: true },
        { size: "M", inStock: true },
        { size: "L", inStock: true },
        { size: "XL", inStock: true },
        { size: "2XL", inStock: true }
      ]
    }

  ]);

  return (
    <CartProvider>
      <Router basename="/nardshop-app">
        <div className="app-container">
          <MemoizedHeader />
          <main>
            <Routes>
              <Route path="/" element={<Home regularProducts={regularProducts} />} />
              <Route
                path="/limited-time-collection"
                element={<LimitedTimeCollectionPage limitedTimeProducts={limitedTimeProducts} />}
              />
              <Route
                path="/product/:productId"
                element={<ProductDetails
                  regularProducts={regularProducts}
                  limitedTimeProducts={limitedTimeProducts}
                />}
              />
              <Route path="/cartpage" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
            </Routes>
          </main>
          <MemoizedFooter />
        </div>
      </Router>
    </CartProvider>
  );
}

export default memo(App);
