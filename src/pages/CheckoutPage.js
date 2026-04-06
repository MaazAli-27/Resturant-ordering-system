import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { createOrder, createCheckoutSession } from '../services/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    tableNumber: '',
    specialInstructions: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerPhone) {
      setError('Please fill in your name and phone number.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty!');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Create the order
      const orderPayload = {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        tableNumber: form.tableNumber,
        specialInstructions: form.specialInstructions,
        items: items.map((i) => ({ menuItemId: i._id, quantity: i.quantity })),
      };

      const orderRes = await createOrder(orderPayload);
      const orderId = orderRes.data.data._id;

      // 2. Create Stripe checkout session
      const paymentRes = await createCheckoutSession(orderId);
      clearCart();

      // 3. Redirect to Stripe
      window.location.href = paymentRes.data.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>No items to checkout</h2>
        <button className="btn-primary" onClick={() => navigate('/')}>Go to Menu</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-grid">
          {/* Form */}
          <div className="checkout-form">
            <h2>Your Details</h2>
            <div className="form-group">
              <label>Full Name *</label>
              <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input name="customerPhone" value={form.customerPhone} onChange={handleChange} placeholder="+1 234 567 8900" />
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

          {/* Order Summary */}
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
            <div className="summary-row">
              <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span><span>${(totalPrice * 0.08).toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span><span>${(totalPrice * 1.08).toFixed(2)}</span>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button className="btn-pay" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Processing...' : `Pay $${(totalPrice * 1.08).toFixed(2)} →`}
            </button>
            <p className="stripe-note">🔒 Secured by Stripe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
