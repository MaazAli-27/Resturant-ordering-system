import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createOrder, createCheckoutSession } from '../services/api';
import axios from 'axios';
import './CheckoutPage.css';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [form, setForm] = useState({ customerName: user?.name || '', customerPhone: user?.phone || '', customerEmail: user?.email || '', tableNumber: '', specialInstructions: '' });

  const discount = promoResult ? promoResult.discount : 0;
  const finalTotal = Math.max(0, totalPrice - discount);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const applyPromo = async () => {
    if (!promoCode) return;
    setPromoError(''); setPromoLoading(true);
    try {
      const res = await API.post('/promo/validate', { code: promoCode, orderAmount: totalPrice });
      setPromoResult(res.data.data);
    } catch (err) { setPromoError(err.response?.data?.message || 'Invalid promo code'); setPromoResult(null); }
    finally { setPromoLoading(false); }
  };

  const removePromo = () => { setPromoResult(null); setPromoCode(''); setPromoError(''); };

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerPhone) return setError('Please fill in your name and phone number.');
    if (items.length === 0) return setError('Your cart is empty!');
    try {
      setLoading(true); setError('');
      const orderRes = await createOrder({ ...form, items: items.map((i) => ({ menuItemId: i._id, quantity: i.quantity })) });
      const orderId = orderRes.data.data._id;
      if (promoResult) await API.post('/promo/use', { code: promoResult.code });
      const paymentRes = await createCheckoutSession(orderId);
      clearCart();
      window.location.href = paymentRes.data.url;
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  if (items.length === 0) return (<div className="checkout-empty"><h2>No items to checkout</h2><button className="btn-primary" onClick={() => navigate('/')}>Go to Menu</button></div>);

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-grid">
          <div className="checkout-form">
            <h2>Your Details</h2>
            {['customerName','customerPhone','customerEmail','tableNumber'].map(field => (
              <div className="form-group" key={field}>
                <label>{field === 'customerName' ? 'Full Name *' : field === 'customerPhone' ? 'Phone *' : field === 'customerEmail' ? 'Email' : 'Table Number'}</label>
                <input name={field} value={form[field]} onChange={handleChange} placeholder={field === 'customerName' ? 'John Doe' : field === 'customerPhone' ? '+1 234 567 8900' : field === 'customerEmail' ? 'john@example.com' : 'Table 5'} />
              </div>
            ))}
            <div className="form-group"><label>Special Instructions</label><textarea name="specialInstructions" value={form.specialInstructions} onChange={handleChange} placeholder="Allergies, preferences..." rows={3} /></div>
          </div>
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {items.map((item) => (<div key={item._id} className="summary-item"><span>{item.name} × {item.quantity}</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>))}
            </div>
            <div className="summary-divider" />
            <div className="promo-section">
              <label className="promo-label">🎟️ Promo Code</label>
              {promoResult ? (
                <div className="promo-applied">
                  <span>✅ {promoResult.code} — {promoResult.discountType === 'percentage' ? `${promoResult.discountValue}% off` : `$${promoResult.discountValue} off`}</span>
                  <button className="promo-remove" onClick={removePromo}>✕</button>
                </div>
              ) : (
                <div className="promo-input-row">
                  <input className="promo-input" placeholder="Enter code (e.g. SAVE10)" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} />
                  <button className="promo-apply-btn" onClick={applyPromo} disabled={promoLoading}>{promoLoading ? '...' : 'Apply'}</button>
                </div>
              )}
              {promoError && <p className="promo-error">{promoError}</p>}
            </div>
            <div className="summary-divider" />
            <div className="summary-row"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
            {discount > 0 && <div className="summary-row" style={{color:'#27ae60'}}><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
            <div className="summary-row"><span>Tax (8%)</span><span>${(finalTotal * 0.08).toFixed(2)}</span></div>
            <div className="summary-row total"><span>Total</span><span>${(finalTotal * 1.08).toFixed(2)}</span></div>
            {error && <p className="error-msg">{error}</p>}
            <button className="btn-pay" onClick={handleSubmit} disabled={loading}>{loading ? 'Processing...' : `Pay $${(finalTotal * 1.08).toFixed(2)} →`}</button>
            <p className="stripe-note">🔒 Secured by Stripe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
