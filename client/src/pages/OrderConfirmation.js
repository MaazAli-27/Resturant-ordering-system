import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/api';
import { SOCKET_URL } from '../config';
import './OrderConfirmation.css';

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📋', desc: 'Your order has been received', color: '#a78bfa' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅', desc: 'Restaurant accepted your order', color: '#34d399' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', desc: 'Chef is cooking your meal', color: '#f59e0b' },
  { key: 'ready', label: 'Ready', icon: '🔔', desc: 'Your food is ready!', color: '#f4c542' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Enjoy your meal!', color: '#10b981' },
];

const ParticleCanvas = ({ active }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 4 + 1,
      dx: (Math.random() - 0.5) * 2,
      dy: -Math.random() * 3 - 1,
      color: ['#f4c542', '#34d399', '#a78bfa', '#f87171', '#60a5fa'][Math.floor(Math.random() * 5)],
      alpha: 1,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.dx; p.y += p.dy; p.alpha -= 0.008;
        if (p.y < 0 || p.alpha <= 0) {
          particles[i] = { x: Math.random() * canvas.width, y: canvas.height, r: Math.random() * 4 + 1, dx: (Math.random() - 0.5) * 2, dy: -Math.random() * 3 - 1, color: ['#f4c542', '#34d399', '#a78bfa', '#f87171', '#60a5fa'][Math.floor(Math.random() * 5)], alpha: 1 };
        }
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  return <canvas ref={canvasRef} className="particle-canvas" />;
};

const OrderConfirmation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const success = searchParams.get('success');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState('pending');
  const [statusChanged, setStatusChanged] = useState(false);
  const [pulseActive, setPulseActive] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data.data);
        setLiveStatus(res.data.data.status);
      } catch (err) {
        console.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let socket;
    const connectSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        socket = io(SOCKET_URL);
        socket.emit('join-order', id);
        socket.on('order-status-update', (data) => {
          if (data.orderId === id) {
            setLiveStatus(data.status);
            setStatusChanged(true);
            setTimeout(() => setStatusChanged(false), 1000);
          }
        });
      } catch (err) {}
    };
    connectSocket();
    return () => { if (socket) socket.disconnect(); };
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => setPulseActive(p => !p), 1500);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="confirm-loading-screen">
      <div className="loading-spinner" />
      <p>Loading your order...</p>
    </div>
  );

  const currentIndex = STEPS.findIndex(s => s.key === liveStatus);
  const currentStep = STEPS[currentIndex] || STEPS[0];
  const isDelivered = liveStatus === 'delivered';
  const isCancelled = liveStatus === 'cancelled';

  return (
    <div className="confirm-page-3d">
      <ParticleCanvas active={isDelivered || statusChanged} />
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      <div className="confirm-wrapper">
        <div className={`confirm-header ${statusChanged ? 'status-flash' : ''}`}>
          <div className="confirm-icon-3d">{success ? currentStep.icon : '⚠️'}</div>
          <h1 className="confirm-title-3d">{success ? 'Order Placed!' : 'Payment Cancelled'}</h1>
          <p className="confirm-subtitle">{success ? 'Your order is on its way to being delicious!' : 'Your order was not completed.'}</p>
        </div>

        {order && success && (
          <>
            <div className="order-info-card">
              <div className="order-info-row"><span className="info-label">Order ID</span><span className="info-value accent">#{order._id.slice(-6).toUpperCase()}</span></div>
              <div className="order-info-row"><span className="info-label">Customer</span><span className="info-value">{order.customerName}</span></div>
              <div className="order-info-row"><span className="info-label">Total</span><span className="info-value accent">${order.totalAmount.toFixed(2)}</span></div>
              {order.tableNumber && <div className="order-info-row"><span className="info-label">Table</span><span className="info-value">{order.tableNumber}</span></div>}
            </div>

            {!isCancelled && (
              <div className="tracking-card-3d">
                <div className="tracking-header">
                  <div className={`live-dot ${pulseActive ? 'pulse' : ''}`} />
                  <span className="live-label">LIVE ORDER TRACKING</span>
                </div>

                <div className="steps-3d-container">
                  {STEPS.map((step, i) => {
                    const isDone = i <= currentIndex;
                    const isActive = step.key === liveStatus;
                    const isFuture = i > currentIndex;
                    return (
                      <div key={step.key} className="step-3d-item">
                        {i < STEPS.length - 1 && (
                          <div className={`step-connector-3d ${isDone && i < currentIndex ? 'filled' : ''}`}>
                            <div className="connector-fill" style={{ width: isDone && i < currentIndex ? '100%' : '0%', background: step.color }} />
                          </div>
                        )}
                        <div className={`step-bubble-3d ${isDone ? 'done' : ''} ${isActive ? 'active' : ''} ${isFuture ? 'future' : ''}`}
                          style={isActive ? { '--step-color': step.color, boxShadow: `0 0 30px ${step.color}60, 0 0 60px ${step.color}30` } : { '--step-color': step.color }}>
                          <span className="step-icon-3d">{step.icon}</span>
                          {isActive && <div className="step-ring" style={{ borderColor: step.color }} />}
                          {isActive && <div className="step-ring-2" style={{ borderColor: step.color }} />}
                        </div>
                        <div className={`step-label-3d ${isActive ? 'active' : ''} ${isFuture ? 'future' : ''}`}>
                          <span className="step-name" style={isActive ? { color: step.color } : {}}>{step.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="status-banner-3d" style={{ background: `linear-gradient(135deg, ${currentStep.color}20, ${currentStep.color}10)`, borderColor: `${currentStep.color}40` }}>
                  <span className="status-banner-icon">{currentStep.icon}</span>
                  <div className="status-banner-text">
                    <span className="status-banner-title" style={{ color: currentStep.color }}>{currentStep.label}</span>
                    <span className="status-banner-desc">{currentStep.desc}</span>
                  </div>
                  <div className="status-banner-pulse" style={{ background: currentStep.color }} />
                </div>

                {!isDelivered && (
                  <div className="eta-bar">
                    <span>Estimated time: </span>
                    <strong>
                      {liveStatus === 'pending' && '25-35 mins'}
                      {liveStatus === 'confirmed' && '20-30 mins'}
                      {liveStatus === 'preparing' && '10-15 mins'}
                      {liveStatus === 'ready' && 'Ready now!'}
                    </strong>
                  </div>
                )}
              </div>
            )}

            <div className="items-card-3d">
              <h3 className="items-title">Items Ordered</h3>
              {order.items.map((item, i) => (
                <div key={i} className="ordered-item-3d">
                  <span className="item-name-3d">{item.name} <span className="item-qty">x{item.quantity}</span></span>
                  <span className="item-price-3d">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="items-total">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        <button className="btn-home-3d" onClick={() => navigate('/')}>Back to Menu</button>
      </div>
    </div>
  );
};

export default OrderConfirmation;

