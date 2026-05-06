import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import './OrderHistory.css';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const OrderHistory = () => {
  const { user, logout } = useAuth();
  const { addItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    API.get('/orders/my-orders').then(res => setOrders(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleReorder = (order) => {
    clearCart();
    order.items.forEach(item => { for (let i = 0; i < item.quantity; i++) addItem({ _id: item.menuItem || item._id, name: item.name, price: item.price, image: item.image || '' }); });
    navigate('/cart');
  };

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <div><h1>My Account</h1><p className="history-sub">Welcome, {user?.name}!</p></div>
          <div className="history-actions">
            <button className="btn-menu" onClick={() => navigate('/')}>← Menu</button>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="account-tabs">
          <button className={`account-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>📦 My Orders</button>
          <button className={`account-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Profile</button>
        </div>

        {activeTab === 'profile' && (
          <div className="profile-card">
            <div className="profile-avatar">👤</div>
            <h2>{user?.name}</h2>
            <div className="profile-details">
              <div className="profile-row"><span>📧 Email</span><span>{user?.email}</span></div>
              <div className="profile-row"><span>📞 Phone</span><span>{user?.phone}</span></div>
              <div className="profile-row"><span>🛒 Total Orders</span><span>{orders.length}</span></div>
              <div className="profile-row"><span>💰 Total Spent</span><span>${orders.reduce((s, o) => s + o.totalAmount, 0).toFixed(2)}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <>
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
                    {order.items.map((item, i) => (<span key={i} className="history-item">{item.name} ×{item.quantity}</span>))}
                  </div>
                  <div className="history-card-bottom">
                    <span className="history-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="history-total">${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="history-card-actions">
                    {!['delivered', 'cancelled'].includes(order.status) && (
                      <button className="btn-track" onClick={() => navigate(`/order-confirmation/${order._id}?success=true`)}>📡 Track</button>
                    )}
                    <button className="btn-reorder" onClick={() => handleReorder(order)}>🔄 Reorder</button>
                    <button className="btn-invoice" onClick={() => window.open(`http://localhost:5000/api/orders/${order._id}/invoice`, '_blank')}>🧾 Invoice</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
