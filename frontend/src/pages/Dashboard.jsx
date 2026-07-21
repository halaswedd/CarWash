import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const DASHBOARD_API = 'http://localhost/carwash/backend/api/dashboard.php';

export default function Dashboard({ setActivePage }) {
  const [stats, setStats] = useState({
    cars_today: 0,
    revenue_today: 0,
    cars_month: 0,
    revenue_month: 0,
    monthly_expenses: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(DASHBOARD_API, { withCredentials: true })
      .then(res => {
        if (res.data && res.data.success) {
          setStats(res.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Overview of today&apos;s activity and this month&apos;s performance.</p>
      </div>

      {/* الـ 5 كاردات الإحصائية مع الأيقونات */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="stat-card-info">
            <span className="stat-title">CARS TODAY</span>
            <span className="stat-number">{loading ? '...' : stats.cars_today}</span>
          </div>
          <div className="stat-icon-box car-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 12.3 2 13.1 2 14v3c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle>
              <circle cx="17" cy="17" r="2"></circle>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <span className="stat-title">REVENUE TODAY</span>
            <span className="stat-number">
              {loading ? '...' : `$${Number(stats.revenue_today || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="stat-icon-box currency-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <span className="stat-title">CARS THIS MONTH</span>
            <span className="stat-number">{loading ? '...' : stats.cars_month}</span>
          </div>
          <div className="stat-icon-box calendar-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <span className="stat-title">REVENUE THIS MONTH</span>
            <span className="stat-number">
              {loading ? '...' : `$${Number(stats.revenue_month || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="stat-icon-box trend-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <span className="stat-title">MONTHLY EXPENSES</span>
            <span className="stat-number expense-color">
              {loading ? '...' : `$${Number(stats.monthly_expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="stat-icon-box wallet-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
              <path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path>
              <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* قسم الإجراءات السريعة (Quick Actions) */}
      <div className="quick-actions-section">
        <h3>Quick actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-card active-action" onClick={() => setActivePage('new-order')}>
            <span className="qa-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </span>
            <span className="qa-text">New Order</span>
          </button>

          <button className="quick-action-card" onClick={() => setActivePage('orders')}>
            <span className="qa-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </span>
            <span className="qa-text">Orders</span>
          </button>

          <button className="quick-action-card" onClick={() => setActivePage('categories')}>
            <span className="qa-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
            </span>
            <span className="qa-text">Categories</span>
          </button>

          <button className="quick-action-card" onClick={() => setActivePage('expenses')}>
            <span className="qa-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </span>
            <span className="qa-text">Expenses</span>
          </button>

          <button className="quick-action-card" onClick={() => setActivePage('daily-report')}>
            <span className="qa-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </span>
            <span className="qa-text">Daily PDF</span>
          </button><button className="quick-action-card" onClick={() => setActivePage('monthly-report')}>
            <span className="qa-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </span>
            <span className="qa-text">Monthly PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}