import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { createOrder, createCheckoutSession } from '../services/api';
import axios from 'axios';
import './CheckoutPage.css';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    tableNumber: '',
    specialInstructions: '',
  });

  const discount = promoResult ? promoResult.discount : 0;
  const finalTotal = Math.max(0, totalPrice - discount);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!form.customerPhone.trim()) newErrors.customerPhone = 'Phone is required';
    return newErrors;
  };

  const applyPromo = async () => {
    if (!promoCode) { toast.warning('Please enter a promo code'); return; }
    setPromoError(''); setPromoLoading(true);
    try {
      const res = await API.post('/promo/validate', { code: promoCode, orderAmount: totalPrice });
      setPromoResult(res.data.data);
      toast.success(`🎟️ Promo applied! You saved $${res.data.data.discount.toFixed(2)}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid promo code';
      setPromoError(msg);
      toast.error(msg);
      setPromoResult(null);
    } finally { setPromoLoading(false); }
  };

  const removePromo = () => {
    setPromoResult(null); setPromoCode(''); setPromoError('');
    toast.info('Promo code removed');
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fill in all required fields');
      return;
    }
    if (items.length === 0) { toast.error('Your cart is empty!'); return; }
    try {
      setLoading(true);
      const orderRes = await createOrder({ ...form, items: items.map((i) => ({ menuItemId: i._id, quantity: i.quantity })) });
      const orderId = orderRes.data.data._id;
      if (promoResult) await API.post('/promo/use', { code: promoResult.code });
      const paymentRes = await createCheckoutSession(orderId);
      clearCart();
      window.location.href = paymentRes.data.url;
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  if (items.length === 0) return (
    <div className="checkout-empty">
      <h2>No items to checkout</h2>
      <button className="btn-primary" onClick={() => navigate('/')}>Go to Menu</button>
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-grid">
          <div className="checkout-form">
            <h2>Your Details</h2>
            <div className="form-group">
              <label>Full Name *</label>
              <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="John Doe" className={errors.customerName ? 'input-error' : ''} />
              {errors.customerName && <span className="field-error">⚠️ {errors.customerName}</span>}
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input name="customerPhone" value={form.customerPhone} onChange={handleChange} placeholder="+92 300 123 4567" className={errors.customerPhone ? 'input-error' : ''} />
              {errors.customerPhone && <span className="field-error">⚠️ {errors.customerPhone}</span>}
            </div>
            <div className="form-group">
              <label>Email (optional)</label>
              <input name="customerEmail" value={form.customerEmail} onChange={handleChange} placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label>Table Number (optional)</label>
              <input name="tableNumber" value={form.tableNumber} onChange={handleChange} placeholder="e.g. Table 5" />
            </div>
            <div className="form-group">
              <label>Special Instructions (optional)</label>
              <textarea name="specialInstructions" value={form.specialInstructions} onChange={handleChange} placeholder="Allergies, preferences..." rows={3} />
            </div>
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {items.map((item) => (
                <div key={item._id} className="summary-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
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
                  <input className="promo-input" placeholder="e.g. SAVE10, WELCOME" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && applyPromo()} />
                  <button className="promo-apply-btn" onClick={applyPromo} disabled={promoLoading}>{promoLoading ? '...' : 'Apply'}</button>
                </div>
              )}
              {promoError && <p className="promo-error">⚠️ {promoError}</p>}
            </div>

            <div className="summary-divider" />
            <div className="summary-row"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
            {discount > 0 && <div className="summary-row" style={{color:'#27ae60',fontWeight:'700'}}><span>🎟️ Discount</span><span>-${discount.toFixed(2)}</span></div>}
            <div className="summary-row"><span>Tax (8%)</span><span>${(finalTotal * 0.08).toFixed(2)}</span></div>
            <div className="summary-row total"><span>Total</span><span>${(finalTotal * 1.08).toFixed(2)}</span></div>

            <button className="btn-pay" onClick={handleSubmit} disabled={loading}>
              {loading ? <span style={{display:'flex',alignItems:'center',gap:'8px',justifyContent:'center'}}><span style={{width:18,height:18,border:'2px solid rgba(26,26,46,0.3)',borderTopColor:'#1a1a2e',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'}} />Processing...</span> : `Pay $${(finalTotal * 1.08).toFixed(2)} →`}
            </button>
            <p className="stripe-note">🔒 Secured by Stripe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
