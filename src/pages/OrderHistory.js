import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './OrderHistory.css';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const OrderHistory = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    API.get('/orders/my-orders')
      .then(res => setOrders(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <div>
            <h1>My Orders</h1>
            <p className="history-sub">Welcome, {user?.name}!</p>
          </div>
          <div className="history-actions">
            <button className="btn-menu" onClick={() => navigate('/')}>← Menu</button>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {loading && <div className="history-loading">Loading your orders...</div>}
        {!loading && orders.length === 0 && (
          <div className="history-empty">
            <div className="empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Start ordering some delicious food!</p>
            <button className="btn-order" onClick={() => navigate('/')}>Browse Menu</button>
          </div>
        )}

        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="history-card">
              <div className="history-card-top">
                <span className="history-id">#{order._id.slice(-6).toUpperCase()}</span>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </div>
              <div className="history-items">
                {order.items.map((item, i) => (
                  <span key={i} className="history-item">{item.name} ×{item.quantity}</span>
                ))}
              </div>
              <div className="history-card-bottom">
                <span className="history-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="history-total">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
