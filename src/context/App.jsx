import React, { memo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CartProvider from "./cartcontext";
import { ThemeProvider } from './ThemeContext';
import Header from '../components/header';
import Footer from '../components/footer';
import Preloader from '../components/Preloader';
import ThemeToggle from '../components/ThemeToggle';
import ComingSoon from '../pages/ComingSoon';
import Y2KHome from '../pages/Y2KHome';
import CartPage from "../pages/cartpage";
import LimitedTimeCollectionPage from '../pages/limitedtimecollection';
import ShippingReturnsPage from '../pages/shippingandreturns';
import AboutUsPage from '../pages/aboutus';
import ProductDetails from '../pages/ProductDetailsNew.jsx';
import CheckoutPage from '../pages/checkoutpage';
import OrderSuccessPage from '../pages/ordersuccess';
import ContactPage from '../pages/contact';
import PrivacyPolicy from '../pages/privacy';
import PlaytestPage from '../pages/Playtest';
import useWordPressProducts from '../hooks/useWordPressProducts';

const MemoizedHeader = memo(Header);
const MemoizedFooter = memo(Footer);

function ShopApp() {
  const { regularProducts, limitedTimeProducts, loading, error } = useWordPressProducts();

  // Show preloader while fetching products
  if (loading) {
    return <Preloader isLoading={true} />;
  }

  // Show error state if products failed to load
  if (error) {
    return (
      <div className="app-container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2>Unable to load products</h2>
          <p>Error: {error}</p>
          <p>Please check your WordPress configuration and try again.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <CartProvider>
        <div className="app-container">
          <MemoizedHeader />
          <ThemeToggle />
          <main>
            <Routes>
              <Route path="/shop" element={<Y2KHome regularProducts={regularProducts} />} />
              <Route
                path="/limited-time-collection"
                element={<LimitedTimeCollectionPage
                  limitedTimeProducts={limitedTimeProducts}
                  regularProducts={regularProducts}
                />}
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
      </CartProvider>
    </ThemeProvider>
  );
}

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

function App() {
  return (
    <Router basename={routerBasename}>
      <Routes>
        <Route path="/" element={<ComingSoon />} />
        <Route path="/play" element={<PlaytestPage />} />
        <Route path="/play/:gameId" element={<PlaytestPage />} />
        <Route path="/*" element={<ShopApp />} />
      </Routes>
    </Router>
  );
}

export default memo(App);
