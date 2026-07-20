import { useState, useEffect } from 'react';
import axios from 'axios';
import './Categories.css';

const API_URL = 'http://localhost/carwash/backend/api/categories.php';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState('fixed');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { withCredentials: true });
      if (res.data.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModalForCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setPrice('');
    setPriceType('fixed');
    setError('');
    setIsModalOpen(true);
  };

  const openModalForEdit = (category) => {
    setIsEditing(true);
    setCurrentId(category.id);
    setName(category.name || '');
    setPrice(category.price || '');
    setPriceType(category.price_type || 'fixed');
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      id: currentId,
      name,
      price: parseFloat(price) || 0,
      price_type: priceType,
    };

    try {
      const res = isEditing
        ? await axios.put(API_URL, payload, { withCredentials: true })
        : await axios.post(API_URL, payload, { withCredentials: true });

      if (res.data.success) {
        fetchCategories();
        closeModal();
      }
    } catch (err) {
      console.error('Save category error:', err);
      setError(
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : 'Failed to save category.')
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await axios.delete(`${API_URL}?id=${id}`, { withCredentials: true });
      if (res.data.success) {
        fetchCategories();
      }
    } catch (err) {
      console.error('Delete category error:', err);
      alert('Failed to delete category.');
    }
  };

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p className="page-subtitle">Manage vehicle types and pricing rules</p>
        </div>
        <button className="btn btn-primary" onClick={openModalForCreate}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Category
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-state">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">No categories found. Click Add New Category to get started.</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Price (L.L)</th>
                <th>Pricing Model</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="font-semibold">{cat.name}</td>
                  <td>{Number(cat.price).toLocaleString()} L.L</td>
                  <td>
                    <span className={`badge ${cat.price_type === 'per_meter' ? 'badge-info' : 'badge-neutral'}`}>
                      {cat.price_type === 'per_meter' ? 'Per Meter' : 'Fixed Price'}
                    </span>
                  </td>
                  <td className="text-right actions-cell">
                    <button className="icon-btn edit-btn" onClick={() => openModalForEdit(cat)} title="Edit Category">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="icon-btn delete-btn" onClick={() => handleDelete(cat.id)} title="Delete Category">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal / Popup */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Category' : 'Add New Category'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Small Car, SUV, Van..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Price (L.L) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  placeholder="e.g. 500000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Pricing Model *</label>
                <select value={priceType} onChange={(e) => setPriceType(e.target.value)}>
                  <option value="fixed">Fixed Price (Per Car)</option>
                  <option value="per_meter">Variable Price (Per Meter)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}