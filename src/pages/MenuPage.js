import React, { useState, useEffect } from 'react';
import MenuCard from '../components/MenuCard';
import { getMenuItems } from '../services/api';
import './MenuPage.css';

const CATEGORIES = ['All', 'Starters', 'Burgers', 'Pizza', 'Sandwiches', 'BBQ', 'Desi', 'Sides', 'Desserts', 'Ice Cream', 'Shakes', 'Drinks'];

const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const category = activeCategory === 'All' ? null : activeCategory;
        const res = await getMenuItems(category);
        setItems(res.data.data);
      } catch (err) {
        setError('Failed to load menu. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [activeCategory]);

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="menu-page">
      <div className="menu-hero">
        <h1 className="menu-title">Our Menu</h1>
        <p className="menu-subtitle">Fresh ingredients, bold flavors, unforgettable meals</p>
        <div className="menu-search">
          <input className="search-bar" placeholder="Search dishes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`cat-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </div>
      {loading && <div className="status-msg">Loading menu...</div>}
      {error && <div className="status-msg error">{error}</div>}
      {!loading && !error && (
        <>
          {filtered.length === 0 && <div className="status-msg">No items found for "{search}"</div>}
          <div className="menu-grid">
            {filtered.map((item) => (<MenuCard key={item._id} item={item} />))}
          </div>
        </>
      )}
    </div>
  );
};

export default MenuPage;
