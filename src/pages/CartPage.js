import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const { items, removeItem, updateQty, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some delicious items from our menu!</p>
        <button className="btn-primary" onClick={() => navigate('/')}>Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Your Cart</h1>
          <button className="btn-clear" onClick={clearCart}>Clear All</button>
        </div>

        <div className="cart-items">
          {items.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.image} alt={item.name} className="item-img" />
              <div className="item-info">
                <h3 className="item-name">{item.name}</h3>
                <span className="item-price">${item.price.toFixed(2)} each</span>
              </div>
              <div className="item-controls">
                <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity - 1)}>−</button>
                <span className="qty-num">{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
              </div>
              <div className="item-subtotal">${(item.price * item.quantity).toFixed(2)}</div>
              <button className="btn-remove" onClick={() => removeItem(item._id)}>✕</button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%)</span>
            <span>${(totalPrice * 0.08).toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${(totalPrice * 1.08).toFixed(2)}</span>
          </div>
          <button className="btn-checkout" onClick={() => navigate('/checkout')}>
            Proceed to Checkout →
          </button>
          <button className="btn-back" onClick={() => navigate('/')}>← Continue Shopping</button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
