import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReservationsAdminPage.css';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const STATUSES = ['pending', 'confirmed', 'cancelled'];

const ReservationsAdminPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [tableNumber, setTableNumber] = useState('');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reservations');
      setReservations(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/reservations/${id}/status`, { status, tableNumber });
      setReservations(prev => prev.map(r => r._id === id ? { ...r, status, tableNumber } : r));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status, tableNumber }));
    } catch (err) { alert('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reservation?')) return;
    await API.delete(`/reservations/${id}`);
    setReservations(prev => prev.filter(r => r._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

  const counts = {
    all: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div className="reservations-page">
      <div className="page-header">
        <div>
          <h1>Reservations</h1>
          <p className="page-sub">{reservations.length} total bookings</p>
        </div>
        <button className="btn-refresh" onClick={fetchReservations}>🔄 Refresh</button>
      </div>

      <div className="filter-tabs">
        {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="tab-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="res-layout">
        <div className="res-list">
          {loading && <div className="loading-msg">Loading reservations...</div>}
          {!loading && filtered.length === 0 && <div className="empty-msg">No reservations found</div>}
          {filtered.map(res => (
            <div key={res._id} className={`res-card ${selected?._id === res._id ? 'selected' : ''}`} onClick={() => { setSelected(res); setTableNumber(res.tableNumber || ''); }}>
              <div className="res-card-top">
                <span className="res-name">{res.name}</span>
                <span className={`res-status-badge status-${res.status}`}>{res.status}</span>
              </div>
              <div className="res-info">
                <span>📅 {res.date}</span>
                <span>⏰ {res.time}</span>
                <span>👥 {res.guests} guests</span>
              </div>
              <div className="res-contact">
                <span>📞 {res.phone}</span>
                {res.email && <span>📧 {res.email}</span>}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="res-detail">
            <div className="detail-header">
              <h2>Reservation Details</h2>
              <button className="btn-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="detail-section">
              <h3>Guest Info</h3>
              <div className="detail-row"><span>Name</span><span>{selected.name}</span></div>
              <div className="detail-row"><span>Phone</span><span>{selected.phone}</span></div>
              {selected.email && <div className="detail-row"><span>Email</span><span>{selected.email}</span></div>}
            </div>

            <div className="detail-section">
              <h3>Booking Details</h3>
              <div className="detail-row"><span>Date</span><span>{selected.date}</span></div>
              <div className="detail-row"><span>Time</span><span>{selected.time}</span></div>
              <div className="detail-row"><span>Guests</span><span>{selected.guests}</span></div>
              {selected.specialRequests && <div className="detail-row"><span>Requests</span><span>{selected.specialRequests}</span></div>}
            </div>

            <div className="detail-section">
              <h3>Assign Table</h3>
              <input
                className="table-input"
                placeholder="e.g. Table 5"
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
              />
            </div>

            <div className="detail-section">
              <h3>Update Status</h3>
              <div className="status-buttons">
                {STATUSES.map(s => (
                  <button key={s} className={`status-btn ${selected.status === s ? 'active' : ''}`} onClick={() => handleStatusChange(selected._id, s)}>{s}</button>
                ))}
              </div>
            </div>

            <button className="btn-delete" onClick={() => handleDelete(selected._id)}>🗑️ Delete Reservation</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsAdminPage;
