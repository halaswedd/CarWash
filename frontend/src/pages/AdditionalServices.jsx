import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdditionalServices.css';

const API_URL = 'http://localhost/carwash/backend/api/additional_services.php';

export default function AdditionalServices() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { withCredentials: true });
      if (res.data.success) {
        setServices(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch services error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModalForCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setPrice('');
    setError('');
    setIsModalOpen(true);
  };

  const openModalForEdit = (service) => {
    setIsEditing(true);
    setCurrentId(service.id);
    setName(service.name || '');
    setPrice(service.price || '');
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
    };

    try {
      const res = isEditing
        ? await axios.put(API_URL, payload, { withCredentials: true })
        : await axios.post(API_URL, payload, { withCredentials: true });

      if (res.data.success) {
        fetchServices();
        closeModal();
      }
    } catch (err) {
      console.error('Save service error:', err);
      setError(
        err.response?.data?.message || 'Failed to save service.'
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      const res = await axios.delete(`${API_URL}?id=${id}`, { withCredentials: true });
      if (res.data.success) {
        fetchServices();
      }
    } catch (err) {
      console.error('Delete service error:', err);
      alert('Failed to delete service.');
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(services.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentServices = services.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="services-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Additional Services</h2>
          <p className="page-subtitle">These appear in the New Order popup.</p>
        </div>
        <button className="btn btn-primary" onClick={openModalForCreate}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Service
        </button>
      </div>

      {/* Services Table Card */}
      <div className="table-card">
        {loading ? (
          <div className="loading-state">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="empty-state">No additional services found. Click Add Service to create one.</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentServices.map((service) => (
                <tr key={service.id}>
                  <td className="font-semibold">{service.name}</td>
                  <td>{Number(service.price).toLocaleString()} L.L</td>
                  <td className="text-right actions-cell">
                    <button className="action-icon edit-icon" onClick={() => openModalForEdit(service)} title="Edit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="action-icon delete-icon" onClick={() => handleDelete(service.id)} title="Delete">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer (Matching Screenshot) */}
      {!loading && services.length > 0 && (
        <div className="pagination-container">
          <span className="pagination-text">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, services.length)} of {services.length}
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </button>
            <span className="page-indicator">
              {currentPage} / {totalPages}
            </span>
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal / Popup */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Service' : 'Add New Service'}</h3>
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
                <label>Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diesel Cleaning, Ghasil feresh..."
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
                  step="100"
                  placeholder="e.g. 2200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Update Service' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}