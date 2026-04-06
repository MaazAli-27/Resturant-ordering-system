import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/api';
import './OrderConfirmation.css';

const STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
const ICONS = { pending: '📋', confirmed: '✅', preparing: '👨‍🍳', ready: '🔔', delivered: '🎉' };

const OrderConfirmation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const success = searchParams.get('success');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data.data);
        setLiveStatus(res.data.data.status);
      } catch (err) { console.error('Failed to load order'); }
      finally { setLoading(false); }
    };
    if (id) fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let socket;
    const connectSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        socket = io('http://localhost:5000');
        socket.emit('join-order', id);
        socket.on('order-status-update', (data) => { if (data.orderId === id) setLiveStatus(data.status); });
      } catch (err) { console.log('Socket not available'); }
    };
    connectSocket();
    return () => { if (socket) socket.disconnect(); };
  }, [id]);

  if (loading) return <div className="confirm-loading">Loading your order...</div>;
  const currentStatus = liveStatus || order?.status || 'pending';
  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        <div className="confirm-icon">{success ? '🎉' : '⚠️'}</div>
        <h1 className="confirm-title">{success ? 'Order Placed!' : 'Payment Cancelled'}</h1>
        <p className="confirm-sub">{success ? 'Thank you! Your order is being prepared.' : 'Your order was not completed.'}</p>
        {order && success && (
          <>
            <div className="order-details">
              <div className="detail-row"><span>Order ID</span><span className="detail-val">#{order._id.slice(-6).toUpperCase()}</span></div>
              <div className="detail-row"><span>Customer</span><span className="detail-val">{order.customerName}</span></div>
              <div className="detail-row"><span>Total</span><span className="detail-val">${order.totalAmount.toFixed(2)}</span></div>
            </div>
            {currentStatus !== 'cancelled' && (
              <div className="tracking-section">
                <h3>🔴 Live Order Tracking</h3>
                <div className="tracking-steps">
                  {STEPS.map((step, i) => {
                    const stepIndex = STEPS.indexOf(step);
                    const isDone = stepIndex <= currentIndex;
                    const isActive = step === currentStatus;
                    return (
                      <React.Fragment key={step}>
                        <div className={`status-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                          <div className="step-icon">{ICONS[step]}</div>
                          <div className="step-label">{step}</div>
                        </div>
                        {i < STEPS.length - 1 && <div className={`step-connector ${stepIndex < currentIndex ? 'done' : ''}`} />}
                      </React.Fragment>
                    );
                  })}
                </div>
                <div className={`current-status-badge status-${currentStatus}`}>
                  {currentStatus === 'pending' && '⏳ Waiting for confirmation...'}
                  {currentStatus === 'confirmed' && '✅ Order confirmed!'}
                  {currentStatus === 'preparing' && '👨‍🍳 Being prepared in kitchen...'}
                  {currentStatus === 'ready' && '🔔 Ready for pickup!'}
                  {currentStatus === 'delivered' && '🎉 Delivered! Enjoy your meal!'}
                </div>
              </div>
            )}
            <div className="order-items-list">
              <h3>Items Ordered</h3>
              {order.items.map((item, i) => (<div key={i} className="ordered-item"><span>{item.name} × {item.quantity}</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>))}
            </div>
          </>
        )}
        <button className="btn-home" onClick={() => navigate('/')}>← Back to Menu</button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
