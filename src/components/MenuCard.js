import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './MenuCard.css';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const StarRating = ({ value, onChange, readonly }) => {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(star => (
        <span key={star} style={{ cursor: readonly ? 'default' : 'pointer', fontSize: readonly ? '0.85rem' : '1.3rem', color: star <= (hover || value) ? '#f4c542' : '#ccc', transition: 'color 0.1s' }}
          onClick={() => !readonly && onChange && onChange(star)} onMouseEnter={() => !readonly && setHover(star)} onMouseLeave={() => !readonly && setHover(0)}>★</span>
      ))}
    </div>
  );
};

const MenuCard = ({ item }) => {
  const { addItem, items } = useCart();
  const { user } = useAuth();
  const inCart = items.find((i) => i._id === item._id);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [showReviews, setShowReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  useEffect(() => {
    API.get(`/reviews/${item._id}`).then(res => { setReviews(res.data.data); setAvgRating(res.data.avgRating); }).catch(() => {});
    if (user) {
      const token = localStorage.getItem('token');
      API.get(`/favourites/check/${item._id}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => setIsFav(res.data.isFavourite)).catch(() => {});
    }
  }, [item._id, user]);

  const toggleFav = async () => {
    if (!user) return alert('Please login to save favourites');
    const token = localStorage.getItem('token');
    try {
      const res = await API.post(`/favourites/${item._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setIsFav(res.data.isFavourite);
    } catch (err) {}
  };

  const handleAddToCart = () => { addItem(item); setAddedAnim(true); setTimeout(() => setAddedAnim(false), 600); };

  const submitReview = async () => {
    if (!user) return alert('Please login to leave a review');
    const token = localStorage.getItem('token');
    try {
      setSubmitting(true);
      const res = await API.post(`/reviews/${item._id}`, { rating: newRating, comment: newComment }, { headers: { Authorization: `Bearer ${token}` } });
      setReviews(prev => [res.data.data, ...prev]);
      setAvgRating(prev => (((prev * reviews.length) + newRating) / (reviews.length + 1)).toFixed(1));
      setNewComment('');
    } catch (err) { alert(err.response?.data?.message || 'Failed to submit review'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className={`menu-card ${!item.isAvailable ? 'unavailable' : ''}`}>
      <div className="card-image-wrap">
        <img src={item.image} alt={item.name} className="card-image" onError={e => e.target.src='https://via.placeholder.com/300x180?text=Food'} />
        {item.isPopular && <span className="popular-badge">⭐ Popular</span>}
        {!item.isAvailable && <div className="sold-out-overlay"><span>Sold Out</span></div>}
        <button className={`fav-btn ${isFav ? 'fav-active' : ''}`} onClick={toggleFav}>{isFav ? '❤️' : '🤍'}</button>
      </div>
      <div className="card-body">
        <div className="card-header">
          <h3 className="card-name">{item.name}</h3>
          <span className="card-price">${item.price.toFixed(2)}</span>
        </div>
        <p className="card-desc">{item.description}</p>
        {avgRating > 0 && (
          <div className="card-rating">
            <StarRating value={Math.round(avgRating)} readonly />
            <span style={{color:'#f4c542',fontSize:'0.8rem'}}>{avgRating}</span>
            <span style={{fontSize:'0.8rem',color:'var(--text2)'}}>({reviews.length})</span>
          </div>
        )}
        <button className={`add-btn ${inCart ? 'in-cart' : ''} ${addedAnim ? 'added-anim' : ''}`} onClick={handleAddToCart} disabled={!item.isAvailable}>
          {!item.isAvailable ? '❌ Sold Out' : inCart ? `✓ In Cart (${inCart.quantity})` : '+ Add to Cart'}
        </button>
        <button className="review-toggle-btn" onClick={() => setShowReviews(!showReviews)}>
          {showReviews ? '▲ Hide Reviews' : `💬 Reviews (${reviews.length})`}
        </button>
        {showReviews && (
          <div className="reviews-section">
            {user && (
              <div className="review-form">
                <StarRating value={newRating} onChange={setNewRating} />
                <textarea placeholder="Write a review..." value={newComment} onChange={e => setNewComment(e.target.value)} className="review-input" rows={2} />
                <button className="review-submit" onClick={submitReview} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
              </div>
            )}
            {reviews.length === 0 && <p className="no-reviews">No reviews yet. Be the first!</p>}
            {reviews.map(r => (
              <div key={r._id} className="review-item">
                <div className="review-header"><span className="reviewer-name">{r.userName}</span><StarRating value={r.rating} readonly /></div>
                {r.comment && <p className="review-comment">{r.comment}</p>}
                <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCard;
