import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import AuthPage from './pages/AuthPage';
import OrderHistory from './pages/OrderHistory';
import ReservationPage from './pages/ReservationPage';
import NotFound from './pages/NotFound';
import './App.css';

// Page title updater
const PageTitleUpdater = () => {
  const location = useLocation();
  useEffect(() => {
    const titles = {
      '/': 'Savoria — Our Menu',
      '/cart': 'Savoria — Your Cart',
      '/checkout': 'Savoria — Checkout',
      '/auth': 'Savoria — Login',
      '/my-orders': 'Savoria — My Orders',
      '/reservation': 'Savoria — Reserve a Table',
    };
    document.title = titles[location.pathname] || 'Savoria Restaurant';
  }, [location]);
  return null;
};

// Scroll to top on route change
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [location.pathname]);
  return null;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', animation:'spin 1s linear infinite', display:'inline-block' }}>🍽️</div>
        <p style={{ color:'var(--text2)', marginTop:'1rem', fontFamily:'Lato,sans-serif' }}>Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/auth" replace />;
};

function AppRoutes() {
  return (
    <>
      <PageTitleUpdater />
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
        <Route path="/my-orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <AppRoutes />
            </Router>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
