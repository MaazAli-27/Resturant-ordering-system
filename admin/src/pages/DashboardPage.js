import React, { useState, useEffect } from 'react';
import { getAllOrders, getAllMenuItems } from '../services/adminApi';
import './DashboardPage.css';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="stat-card" style={{ '--accent-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const DashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, menuRes] = await Promise.all([getAllOrders(), getAllMenuItems()]);
        setOrders(ordersRes.data.data);
        setMenuItems(menuRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length;
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;

  const statusCounts = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map(s => ({
    status: s,
    count: orders.filter(o => o.status === s).length,
  }));

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  const categoryCount = menuItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <div className="dash-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dash-sub">Welcome back! Here's what's happening.</p>
        </div>
        <div className="dash-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="💰" label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} color="var(--accent)" sub={`${paidOrders} paid orders`} />
        <StatCard icon="📦" label="Total Orders" value={orders.length} color="var(--accent3)" sub={`${todayOrders} today`} />
        <StatCard icon="⏳" label="Pending Orders" value={pendingOrders} color="var(--warning)" sub="Needs attention" />
        <StatCard icon="🍽️" label="Menu Items" value={menuItems.length} color="var(--accent4)" sub={`${Object.keys(categoryCount).length} categories`} />
      </div>

      <div className="dash-grid">
        {/* Order Status Breakdown */}
        <div className="dash-card">
          <h2 className="card-title">Order Status</h2>
          <div className="status-list">
            {statusCounts.map(({ status, count }) => (
              <div key={status} className="status-row">
                <span className={`status-dot ${status}`}></span>
                <span className="status-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                <div className="status-bar-wrap">
                  <div className="status-bar" style={{ width: orders.length ? `${(count / orders.length) * 100}%` : '0%' }}></div>
                </div>
                <span className="status-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Menu by Category */}
        <div className="dash-card">
          <h2 className="card-title">Menu by Category</h2>
          <div className="category-list">
            {Object.entries(categoryCount).map(([cat, count]) => (
              <div key={cat} className="category-row">
                <span className="cat-name">{cat}</span>
                <div className="cat-bar-wrap">
                  <div className="cat-bar" style={{ width: `${(count / menuItems.length) * 100}%` }}></div>
                </div>
                <span className="cat-count">{count} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="dash-card full-width">
        <h2 className="card-title">Recent Orders</h2>
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id}>
                  <td className="order-id">#{order._id.slice(-6).toUpperCase()}</td>
                  <td>{order.customerName}</td>
                  <td>{order.items.length} items</td>
                  <td className="order-total">${order.totalAmount.toFixed(2)}</td>
                  <td><span className={`badge status-${order.status}`}>{order.status}</span></td>
                  <td><span className={`badge payment-${order.paymentStatus}`}>{order.paymentStatus}</span></td>
                  <td className="order-date">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
