import React, { useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const closeMenu = () => setMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">🍽️</span>
          <span className="brand-name">Savoria</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links desktop-links">
          <Link to="/" className={isActive('/') ? 'nav-link active' : 'nav-link'}>Menu</Link>
          <Link to="/reservation" className={isActive('/reservation') ? 'nav-link active' : 'nav-link'}>Reserve</Link>
          {user ? (
            <>
              <Link to="/my-orders" className={isActive('/my-orders') ? 'nav-link active' : 'nav-link'}>My Orders</Link>
              <span className="nav-user">👤 {user.name.split(' ')[0]}</span>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/auth" className={isActive('/auth') ? 'nav-link active' : 'nav-link'}>Login</Link>
          )}
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">{isDark ? '☀️' : '🌙'}</button>
          <Link to="/cart" className="nav-cart">
            <span className="cart-icon">🛒</span>
            <span className="cart-label">Cart</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        </div>

        {/* Mobile right section */}
        <div className="mobile-nav-right">
          <button className="theme-toggle" onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</button>
          <Link to="/cart" className="nav-cart mobile-cart">
            <span>🛒</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
          <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`} onClick={closeMenu} />

      {/* Mobile menu drawer */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="brand-name">🍽️ Savoria</span>
          <button className="mobile-close" onClick={closeMenu}>✕</button>
        </div>

        {user && (
          <div className="mobile-user-card">
            <div className="mobile-avatar">👤</div>
            <div>
              <div className="mobile-user-name">{user.name}</div>
              <div className="mobile-user-email">{user.email}</div>
            </div>
          </div>
        )}

        <nav className="mobile-nav-links">
          <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`} onClick={closeMenu}>
            <span>🍽️</span> Menu
          </Link>
          <Link to="/reservation" className={`mobile-nav-link ${isActive('/reservation') ? 'active' : ''}`} onClick={closeMenu}>
            <span>🪑</span> Reserve a Table
          </Link>
          {user ? (
            <>
              <Link to="/my-orders" className={`mobile-nav-link ${isActive('/my-orders') ? 'active' : ''}`} onClick={closeMenu}>
                <span>📦</span> My Orders
              </Link>
              <Link to="/cart" className={`mobile-nav-link ${isActive('/cart') ? 'active' : ''}`} onClick={closeMenu}>
                <span>🛒</span> Cart {totalItems > 0 && `(${totalItems})`}
              </Link>
              <button className="mobile-logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className={`mobile-nav-link ${isActive('/auth') ? 'active' : ''}`} onClick={closeMenu}>
              <span>🔐</span> Login / Sign Up
            </Link>
          )}
        </nav>
      </div>
    </>
  );
};

export default Navbar;
