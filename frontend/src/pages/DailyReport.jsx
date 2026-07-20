import { useState, useEffect } from 'react';
import axios from 'axios';
import './DailyReport.css'; // أو استعمل ملف الـ CSS الخاص فيك

const REPORT_API = 'http://localhost/carwash/backend/api/daily_report.php';

export default function DailyReport() {
  // الحصول على تاريخ اليوم بصيغة YYYY-MM-DD افتراضياً
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate]);

  const fetchReport = async (date) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await axios.get(`${REPORT_API}?date=${date}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setReportData(res.data);
      } else {
        setErrorMsg('Failed to load report data.');
      }
    } catch (err) {
      console.error('Error fetching daily report:', err);
      setErrorMsg('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = () => {
    window.print(); // بيفتح نافذة الطباعة الخاصة بالمتصفح لحفظه كـ PDF بشكل نظيف
  };

  return (
    <div className="daily-report-container">
      <div className="report-header">
        <h2>Daily Report</h2>
        <p>Preview and download a summary for any day.</p>
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <div className="report-card">
        <div className="report-preview-title">
          <span>📄 Report Preview</span>
        </div>

        <div className="date-picker-section">
          <label>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input-field"
          />
        </div>

        {loading ? (
          <div className="report-loading">Loading report...</div>
        ) : reportData ? (
          <>
            <div className="report-stats-grid">
              <div className="stat-box">
                <span className="stat-label">DATE</span>
                <span className="stat-value">
                  {new Date(reportData.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="stat-box">
                <span className="stat-label">TOTAL CARS</span>
                <span className="stat-value">{reportData.total_cars}</span>
              </div>

              <div className="stat-box">
                <span className="stat-label">REVENUE</span>
                <span className="stat-value revenue-text">
                  {Number(reportData.total_revenue).toLocaleString()} L.L
                </span>
              </div>
            </div>

            {/* تفاصيل أنواع السيارات الكميات والمدخول */}
            <div className="breakdown-section">
              <h4>Cars Breakdown by Category</h4>
              {reportData.categories_breakdown && reportData.categories_breakdown.length > 0 ? (
                <table className="breakdown-table">
                  <thead>
                    <tr>
                      <th>Car Type (Category)</th>
                      <th>Quantity</th>
                      <th>Subtotal Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.categories_breakdown.map((item, index) => (
                      <tr key={index}>
                        <td className="fw-bold">{item.category_name}</td>
                        <td>{item.car_count} Cars</td>
                        <td className="text-primary-color">
                          {Number(item.category_revenue).toLocaleString()} L.L
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data-text">No cars washed on this date.</p>
              )}
            </div>
          </>
        ) : null}

        <button type="button" className="btn-download-pdf" onClick={handlePrintPDF}>
          📥 Download / Print PDF
        </button>
      </div>
    </div>
  );
}