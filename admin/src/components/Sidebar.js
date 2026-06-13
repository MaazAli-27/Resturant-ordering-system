import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/orders', icon: '📦', label: 'Orders' },
  { path: '/menu', icon: '🍽️', label: 'Menu Items' },
  { path: '/promos', icon: '🎟️', label: 'Promo Codes' },
  { path: '/reservations', icon: '🪑', label: 'Reservations' },
];

const Sidebar = ({ isOpen, onToggle, onLogout }) => (
  <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
    <div className="sidebar-header">
      <span className="sidebar-logo">🍽️</span>
      {isOpen && <span className="sidebar-brand">Savoria Admin</span>}
      <button className="toggle-btn" onClick={onToggle}>{isOpen ? '◀' : '▶'}</button>
    </div>
    <nav className="sidebar-nav">
      {NAV.map((item) => (
        <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{item.icon}</span>
          {isOpen && <span className="nav-label">{item.label}</span>}
        </NavLink>
      ))}
    </nav>
    <div className="sidebar-footer">
      <button className="logout-btn" onClick={onLogout}>
        <span>🚪</span>
        {isOpen && <span>Logout</span>}
      </button>
    </div>
  </aside>
);

export default Sidebar;
