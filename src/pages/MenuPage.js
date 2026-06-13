import React, { useState, useEffect, useCallback } from 'react';
import MenuCard from '../components/MenuCard';
import { SkeletonGrid } from '../components/Skeleton';
import { getMenuItems } from '../services/api';
import './MenuPage.css';

const CATEGORIES = ['All', 'Starters', 'Burgers', 'Pizza', 'Sandwiches', 'BBQ', 'Desi', 'Sides', 'Desserts', 'Ice Cream', 'Shakes', 'Drinks'];
const ITEMS_PER_PAGE = 20;

// Debounce hook
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const category = activeCategory === 'All' ? null : activeCategory;
        const res = await getMenuItems(category);
        setItems(res.data.data);
        setPage(1);
      } catch (err) {
        setError('Failed to load menu. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [activeCategory]);

  // Filter by search
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    item.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Paginate
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = page < totalPages;

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearch('');
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="menu-page">
      <div className="menu-hero">
        <h1 className="menu-title">Our Menu</h1>
        <p className="menu-subtitle">Fresh ingredients, bold flavors, unforgettable meals</p>
        <div className="menu-search">
          <input
            className="search-bar"
            placeholder="Search dishes..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <SkeletonGrid count={8} />}
      {error && <div className="status-msg error">{error}</div>}

      {!loading && !error && (
        <>
          {debouncedSearch && (
            <p className="search-results">
              {filtered.length === 0
                ? `No results for "${debouncedSearch}"`
                : `${filtered.length} results for "${debouncedSearch}"`
              }
            </p>
          )}
          {filtered.length === 0 && !debouncedSearch && (
            <div className="status-msg">No items in this category</div>
          )}
          <div className="menu-grid">
            {paginated.map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="load-more-wrap">
              <button className="btn-load-more" onClick={() => setPage(p => p + 1)}>
                Load More ({filtered.length - paginated.length} remaining)
              </button>
            </div>
          )}

          {/* Item count */}
          {!hasMore && filtered.length > 0 && (
            <p className="items-count">Showing all {filtered.length} items</p>
          )}
        </>
      )}
    </div>
  );
};

export default MenuPage;
