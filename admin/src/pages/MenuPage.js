import React, { useState, useEffect } from 'react';
import { getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/adminApi';
import './MenuPage.css';

const CATEGORIES = ['Starters', 'Burgers', 'Pizza', 'Sandwiches', 'BBQ', 'Desi', 'Sides', 'Desserts', 'Ice Cream', 'Shakes', 'Drinks'];
const EMPTY_FORM = { name: '', description: '', price: '', category: 'Starters', image: '', isAvailable: true, isPopular: false };

const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await getAllMenuItems();
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item, price: item.price.toString() }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) return alert('Fill in required fields');
    try {
      setSaving(true);
      const payload = { ...form, price: parseFloat(form.price) };
      if (editItem) {
        await updateMenuItem(editItem._id, payload);
        setItems(prev => prev.map(i => i._id === editItem._id ? { ...i, ...payload } : i));
      } else {
        const res = await createMenuItem(payload);
        setItems(prev => [...prev, res.data.data]);
      }
      setShowForm(false);
    } catch (err) {
      alert('Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteMenuItem(id);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const filtered = items.filter(i => {
    const matchCat = filterCat === 'All' || i.category === filterCat;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="menu-page-admin">
      <div className="page-header">
        <div>
          <h1>Menu Items</h1>
          <p className="page-sub">{items.length} total items</p>
        </div>
        <button className="btn-add" onClick={openAdd}>+ Add Item</button>
      </div>

      {/* Filters */}
      <div className="menu-filters">
        <input
          className="search-input"
          placeholder="🔍 Search items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="cat-filters">
          {['All', ...CATEGORIES].map(c => (
            <button key={c} className={`cat-btn ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading && <div className="loading-msg">Loading menu items...</div>}
      {!loading && (
        <div className="menu-admin-grid">
          {filtered.map(item => (
            <div key={item._id} className="menu-admin-card">
              <div className="admin-card-img-wrap">
                <img src={item.image} alt={item.name} className="admin-card-img" onError={e => e.target.src = 'https://via.placeholder.com/300x180?text=No+Image'} />
                <div className="admin-card-badges">
                  {item.isPopular && <span className="badge-popular">⭐ Popular</span>}
                  {!item.isAvailable && <span className="badge-unavail">Unavailable</span>}
                </div>
              </div>
              <div className="admin-card-body">
                <div className="admin-card-top">
                  <span className="admin-card-cat">{item.category}</span>
                  <span className="admin-card-price">${item.price.toFixed(2)}</span>
                </div>
                <h3 className="admin-card-name">{item.name}</h3>
                <p className="admin-card-desc">{item.description}</p>
                <div className="admin-card-actions">
                  <button className="btn-edit" onClick={() => openEdit(item)}>✏️ Edit</button>
                  <button className="btn-del" onClick={() => handleDelete(item._id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Item name" />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://images.unsplash.com/..." />
              </div>
              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} />
                  Available
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })} />
                  Mark as Popular
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
