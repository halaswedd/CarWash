import { useState, useEffect } from 'react';
import axios from 'axios';
import './Expenses.css';

const EXPENSES_API = 'http://localhost/carwash/backend/api/expenses.php';

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

export default function Expenses() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD'); // اختيار العملة الافتراضية
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${EXPENSES_API}?month=${selectedMonth}&year=${selectedYear}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setExpenses(res.data.data || []);
        setTotalExpenses(res.data.total_expenses || 0);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    try {
      setSubmitting(true);
      const res = await axios.post(
        EXPENSES_API,
        { 
          title, 
          amount: parseFloat(amount),
          currency 
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setTitle('');
        setAmount('');
        setCurrency('USD');
        setIsModalOpen(false);
        fetchExpenses();
      }
    } catch (err) {
      console.error('Error adding expense:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      const res = await axios.delete(EXPENSES_API, {
        data: { id },
        withCredentials: true,
      });

      if (res.data.success) {
        fetchExpenses();
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const currentMonthName = MONTHS.find((m) => m.value === selectedMonth)?.name || '';

  return (
    <div className="expenses-container">
      <div className="expenses-top-header">
        <div>
          <h2>Expenses</h2>
          <p>Monthly expenses (rent, salaries, supplies, etc.) in USD.</p>
        </div>
        <button className="btn-add-expense-main" onClick={() => setIsModalOpen(true)}>
          ➕ Add Expense
        </button>
      </div>

      <div className="expenses-filter-bar">
        <div className="filters-group">
          <div className="filter-item">
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

          <div className="filter-item">
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

        <div className="filter-total">
          Total: <span>${Number(totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="expenses-main-card">
        {loading ? (
          <div className="expenses-state-box">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="expenses-empty-state">
            <div className="empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3>No expenses recorded</h3>
            <p>Nothing recorded for {currentMonthName} {selectedYear} yet.</p>
            <button className="btn-add-expense-empty" onClick={() => setIsModalOpen(true)}>
              ➕ Add Expense
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Title / Reason</th>
                  <th>Original Amount</th>
                  <th>Amount (USD)</th>
                  <th>Date & Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="fw-bold">{exp.title}</td>
                    <td className="expense-amount-cell">
                      {Number(exp.original_amount ?? exp.amount).toLocaleString()} {exp.currency || 'USD'}
                    </td>
                    <td className="expense-amount-cell" style={{ fontWeight: 'bold', color: '#002b4d' }}>
                      ${Number(exp.amount_usd ?? exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="date-cell">
                      {new Date(exp.created_at).toLocaleString('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-delete-expense"
                        onClick={() => handleDeleteExpense(exp.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Add New Expense</h3>
            <form onSubmit={handleAddExpense} className="expense-form">
              <div className="form-group">
                <label>Expense Title / Reason</label>
                <input
                  type="text"
                  placeholder="e.g., Rent, Salaries, Electricity..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="any"
                    required
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="L.L">L.L (ل.ل)</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}