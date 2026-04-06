import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/api';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const success = searchParams.get('success');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data.data);
      } catch (err) {
        console.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) return <div className="confirm-loading">Loading your order...</div>;

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        <div className="confirm-icon">{success ? '🎉' : '⚠️'}</div>
        <h1 className="confirm-title">
          {success ? 'Order Placed!' : 'Payment Cancelled'}
        </h1>
        <p className="confirm-sub">
          {success
            ? 'Thank you! Your order is being prepared.'
            : 'Your order was not completed. Please try again.'}
        </p>

        {order && success && (
          <div className="order-details">
            <div className="detail-row">
              <span>Order ID</span>
              <span className="detail-val">#{order._id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span>Name</span>
              <span className="detail-val">{order.customerName}</span>
            </div>
            <div className="detail-row">
              <span>Status</span>
              <span className={`status-badge ${order.status}`}>{order.status}</span>
            </div>
            <div className="detail-row">
              <span>Total Paid</span>
              <span className="detail-val">${(order.totalAmount * 1.08).toFixed(2)}</span>
            </div>
            <div className="order-items-list">
              <h3>Items Ordered</h3>
              {order.items.map((item, i) => (
                <div key={i} className="ordered-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn-home" onClick={() => navigate('/')}>
          ← Back to Menu
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
