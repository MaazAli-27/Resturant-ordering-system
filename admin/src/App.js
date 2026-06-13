import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import PromoPage from './pages/PromoPage';
import ReservationsAdminPage from './pages/ReservationsAdminPage';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetch('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => { if (data.success) setUser(data.data); else localStorage.removeItem('adminToken'); })
        .catch(() => localStorage.removeItem('adminToken'))
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f1117', color:'#f4c542', fontFamily:'sans-serif' }}>Loading...</div>;
  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <Router>
      <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={() => { localStorage.removeItem('adminToken'); setUser(null); }} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/promos" element={<PromoPage />} />
            <Route path="/reservations" element={<ReservationsAdminPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
