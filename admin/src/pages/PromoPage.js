import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PromoPage.css';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const EMPTY_FORM = { code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: '100', isActive: true };

const PromoPage = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await API.get('/promo', { headers: { Authorization: `Bearer ${token}` } });
      setPromos(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.discountValue) return alert('Please fill in all required fields');
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      await API.post('/promo', {
        ...form,
        code: form.code.toUpperCase(),
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: parseFloat(form.minOrderAmount) || 0,
        maxUses: parseInt(form.maxUses) || 100,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchPromos();
    } catch (err) { alert(err.response?.data?.message || 'Failed to create promo'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    const token = localStorage.getItem('adminToken');
    await API.delete(`/promo/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setPromos(prev => prev.filter(p => p._id !== id));
  };

  const handleSeed = async () => {
    await API.post('/promo/seed');
    fetchPromos();
  };

  return (
    <div className="promo-page">
      <div className="page-header">
        <div>
          <h1>Promo Codes</h1>
          <p className="page-sub">{promos.length} promo codes</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-seed" onClick={handleSeed}>🌱 Seed Demo</button>
          <button className="btn-add" onClick={() => setShowForm(true)}>+ New Promo</button>
        </div>
      </div>

      {loading && <div className="loading-msg">Loading promo codes...</div>}

      <div className="promo-grid">
        {promos.map(promo => (
          <div key={promo._id} className={`promo-card ${!promo.isActive ? 'inactive' : ''}`}>
            <div className="promo-card-top">
              <span className="promo-code">{promo.code}</span>
              <span className={`promo-status ${promo.isActive ? 'active' : 'inactive'}`}>
                {promo.isActive ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>
            <div className="promo-discount">
              {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
            </div>
            <div className="promo-details">
              <div className="promo-detail-row">
                <span>Min Order</span>
                <span>${promo.minOrderAmount}</span>
              </div>
              <div className="promo-detail-row">
                <span>Used / Max</span>
                <span>{promo.usedCount} / {promo.maxUses}</span>
              </div>
              <div className="promo-progress">
                <div className="promo-progress-bar" style={{ width: `${Math.min((promo.usedCount / promo.maxUses) * 100, 100)}%` }} />
              </div>
              {promo.expiresAt && (
                <div className="promo-detail-row">
                  <span>Expires</span>
                  <span>{new Date(promo.expiresAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <button className="btn-del-promo" onClick={() => handleDelete(promo._id)}>🗑️ Delete</button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Promo Code</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Code * (e.g. SAVE20)</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE20" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === 'percentage' ? '20' : '5'} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Min Order Amount ($)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Max Uses</label>
                  <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} placeholder="100" />
                </div>
              </div>
              <div className="form-group">
                <label>Expiry Date (optional)</label>
                <input type="date" value={form.expiresAt || ''} onChange={e => setForm({ ...form, expiresAt: e.target.value })} min={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Creating...' : 'Create Promo'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoPage;
