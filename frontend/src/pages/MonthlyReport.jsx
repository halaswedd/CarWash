import { useState, useEffect } from 'react';
import axios from 'axios';
import './MonthlyReport.css';

const MONTHLY_API = 'http://localhost/carwash/backend/api/monthly_report.php';

const MONTHS = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' },
];

export default function MonthlyReport() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMonthlyReport();
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await axios.get(`${MONTHLY_API}?month=${selectedMonth}&year=${selectedYear}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setReportData(res.data);
      } else {
        setErrorMsg('Failed to load monthly report.');
      }
    } catch (err) {
      console.error('Error fetching monthly report:', err);
      setErrorMsg('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="monthly-report-container">
      <div className="report-header">
        <h2>Monthly Report</h2>
        <p>Revenue, expenses, and net profit for the selected month.</p>
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <div className="report-card">
        <div className="report-preview-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Report Preview</span>
        </div>

        {/* فلاتر الشهر والسنة */}
        <div className="report-filters-row">
          <div className="filter-group">
            <label>Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Year</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="year-input-field"
              placeholder="YYYY"
              min="2000"
              max="2100"
            />
          </div>
        </div>

        {loading ? (
          <div className="report-loading">Loading report...</div>
        ) : reportData ? (
          <div className="report-stats-grid">
            <div className="stat-box">
              <span className="stat-label">CARS</span>
              <span className="stat-value">{reportData.total_cars}</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">REVENUE</span>
              <span className="stat-value revenue-color">
                {`$${Number(reportData.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>

            <div className="stat-box">
              <span className="stat-label">EXPENSES</span>
              <span className="stat-value expense-color">
                {`$${Number(reportData.total_expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>

            <div className="stat-box">
              <span className="stat-label">NET PROFIT</span>
              <span className={`stat-value ${reportData.net_profit >= 0 ? 'profit-color' : 'expense-color'}`}>
                {`$${Number(reportData.net_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>
        ) : null}

        <button type="button" className="btn-download-pdf" onClick={handlePrintPDF}>
          📥 Download / Print PDF
        </button>
      </div>
    </div>
  );
}