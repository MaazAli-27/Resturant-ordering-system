import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../services/adminApi';
import './OrdersPage.css';

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
const FILTERS = ['all', ...STATUSES];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders();
      setOrders(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await deleteOrder(id);
      setOrders(prev => prev.filter(o => o._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      alert('Failed to delete order');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="orders-page">
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="page-sub">{orders.length} total orders</p>
        </div>
        <button className="btn-refresh" onClick={fetchOrders}>🔄 Refresh</button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {FILTERS.map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="tab-count">{f === 'all' ? orders.length : orders.filter(o => o.status === f).length}</span>
          </button>
        ))}
      </div>

      <div className="orders-layout">
        {/* Orders List */}
        <div className="orders-list">
          {loading && <div className="loading-msg">Loading orders...</div>}
          {!loading && filtered.length === 0 && <div className="empty-msg">No orders found</div>}
          {filtered.map(order => (
            <div key={order._id} className={`order-card ${selected?._id === order._id ? 'selected' : ''}`} onClick={() => setSelected(order)}>
              <div className="order-card-top">
                <span className="order-card-id">#{order._id.slice(-6).toUpperCase()}</span>
                <span className={`badge status-${order.status}`}>{order.status}</span>
              </div>
              <div className="order-card-name">{order.customerName}</div>
              <div className="order-card-info">
                <span>{order.items.length} items</span>
                <span className="order-card-total">${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="order-card-date">{new Date(order.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Order Detail */}
        {selected && (
          <div className="order-detail">
            <div className="detail-header">
              <h2>Order #{selected._id.slice(-6).toUpperCase()}</h2>
              <button className="btn-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="detail-section">
              <h3>Customer</h3>
              <div className="detail-row"><span>Name</span><span>{selected.customerName}</span></div>
              <div className="detail-row"><span>Phone</span><span>{selected.customerPhone}</span></div>
              {selected.customerEmail && <div className="detail-row"><span>Email</span><span>{selected.customerEmail}</span></div>}
              {selected.tableNumber && <div className="detail-row"><span>Table</span><span>{selected.tableNumber}</span></div>}
            </div>

            <div className="detail-section">
              <h3>Items</h3>
              {selected.items.map((item, i) => (
                <div key={i} className="detail-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="detail-total">
                <span>Total</span>
                <span>${selected.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Update Status</h3>
              <div className="status-buttons">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    className={`status-btn ${selected.status === s ? 'active' : ''}`}
                    onClick={() => handleStatusChange(selected._id, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {selected.specialInstructions && (
              <div className="detail-section">
                <h3>Special Instructions</h3>
                <p className="instructions">{selected.specialInstructions}</p>
              </div>
            )}

            <div className="detail-section">
              <div className="detail-row">
                <span>Payment</span>
                <span className={`badge payment-${selected.paymentStatus}`}>{selected.paymentStatus}</span>
              </div>
            </div>

            <button className="btn-delete" onClick={() => handleDelete(selected._id)}>🗑️ Delete Order</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
