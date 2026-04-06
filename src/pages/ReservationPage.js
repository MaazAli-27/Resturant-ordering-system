import React, { useState } from 'react';
import axios from 'axios';
import './ReservationPage.css';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const TIME_SLOTS = ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];

const ReservationPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '', guests: 2, specialRequests: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [reservation, setReservation] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.date || !form.time) return setError('Please fill in all required fields');
    try {
      setLoading(true); setError('');
      const res = await API.post('/reservations', form);
      setReservation(res.data.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to make reservation');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="reservation-page">
      <div className="reservation-success">
        <div className="success-icon">🪑</div>
        <h1>Reservation Confirmed!</h1>
        <p>We'll see you soon, <strong>{reservation?.name}</strong>!</p>
        <div className="reservation-details">
          <div className="res-detail"><span>📅 Date</span><span>{reservation?.date}</span></div>
          <div className="res-detail"><span>⏰ Time</span><span>{reservation?.time}</span></div>
          <div className="res-detail"><span>👥 Guests</span><span>{reservation?.guests}</span></div>
          <div className="res-detail"><span>📋 Status</span><span className="res-status">{reservation?.status}</span></div>
        </div>
        <p className="res-note">We'll confirm your reservation shortly via phone.</p>
        <button className="btn-back" onClick={() => { setSuccess(false); setForm({ name: '', email: '', phone: '', date: '', time: '', guests: 2, specialRequests: '' }); }}>Make Another Reservation</button>
      </div>
    </div>
  );

  return (
    <div className="reservation-page">
      <div className="reservation-hero">
        <h1>Reserve a Table</h1>
        <p>Book your dining experience at Savoria</p>
      </div>

      <div className="reservation-container">
        <div className="reservation-form">
          <h2>Your Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
            </div>
          </div>
          <div className="form-group">
            <label>Email (optional)</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
          </div>

          <h2 style={{ marginTop: '1.5rem' }}>Booking Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label>Number of Guests *</label>
              <select name="guests" value={form.guests} onChange={handleChange}>
                {[1,2,3,4,5,6,7,8,10,12,15,20].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Time Slot *</label>
            <div className="time-slots">
              {TIME_SLOTS.map(slot => (
                <button key={slot} className={`time-slot ${form.time === slot ? 'active' : ''}`} onClick={() => setForm({ ...form, time: slot })}>{slot}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Special Requests (optional)</label>
            <textarea name="specialRequests" value={form.specialRequests} onChange={handleChange} placeholder="Birthday celebration, dietary requirements, high chair needed..." rows={3} />
          </div>

          {error && <p className="res-error">{error}</p>}
          <button className="btn-reserve" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Booking...' : '🪑 Reserve Table'}
          </button>
        </div>

        <div className="reservation-info">
          <div className="info-card">
            <h3>📍 Location</h3>
            <p>123 Food Street, Downtown</p>
            <p>Karachi, Pakistan</p>
          </div>
          <div className="info-card">
            <h3>⏰ Opening Hours</h3>
            <p>Monday - Friday: 12pm - 10pm</p>
            <p>Saturday - Sunday: 11am - 11pm</p>
          </div>
          <div className="info-card">
            <h3>📞 Contact</h3>
            <p>+92 300 123 4567</p>
            <p>info@savoria.com</p>
          </div>
          <div className="info-card highlight">
            <h3>ℹ️ Reservation Policy</h3>
            <p>• Reservations held for 15 mins</p>
            <p>• Cancel 2hrs before booking</p>
            <p>• Groups of 10+ call directly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
