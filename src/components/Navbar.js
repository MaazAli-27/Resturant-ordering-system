import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">🍽️</span>
        <span className="brand-name">Savoria</span>
      </Link>
      <div className="navbar-links">
        <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>Menu</Link>
        <Link to="/reservation" className={location.pathname === '/reservation' ? 'nav-link active' : 'nav-link'}>Reserve</Link>
        {user ? (
          <>
            <Link to="/my-orders" className="nav-link">My Orders</Link>
            <span className="nav-user">👤 {user.name.split(' ')[0]}</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/auth" className="nav-link">Login</Link>
        )}
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">{isDark ? '☀️' : '🌙'}</button>
        <Link to="/cart" className="nav-cart">
          <span className="cart-icon">🛒</span>
          <span className="cart-label">Cart</span>
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
