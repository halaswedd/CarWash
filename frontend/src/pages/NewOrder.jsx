import { useState, useEffect } from 'react';
import axios from 'axios';
import './NewOrder.css';

const CATEGORIES_API = 'http://localhost/carwash/backend/api/categories.php';
const SERVICES_API = 'http://localhost/carwash/backend/api/additional_services.php';
const ORDERS_API = 'http://localhost/carwash/backend/api/orders.php';

export default function NewOrder() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [meters, setMeters] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [plateNumber, setPlateNumber] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [catRes, servRes] = await Promise.all([
        axios.get(CATEGORIES_API, { withCredentials: true }),
        axios.get(SERVICES_API, { withCredentials: true }),
      ]);

      if (catRes.data.success) setCategories(catRes.data.data || []);
      if (servRes.data.success) setServices(servRes.data.data || []);
    } catch (err) {
      console.error('Error fetching POS data:', err);
      setErrorMsg('Failed to load categories or services.');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (service) => {
    if (selectedServices.some((s) => s.id === service.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Live Total Calculation
  const calculateCategoryCost = () => {
    if (!selectedCategory) return 0;
    if (selectedCategory.price_type === 'per_meter') {
      return (parseFloat(selectedCategory.price) || 0) * (parseFloat(meters) || 1);
    }
    return parseFloat(selectedCategory.price) || 0;
  };

  const calculateServicesCost = () => {
    return selectedServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
  };

  const totalAmount = calculateCategoryCost() + calculateServicesCost();

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      setErrorMsg('Please select a category first.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      plate_number: plateNumber,
      category_id: selectedCategory.id,
      category_name: selectedCategory.name,
      category_price: parseFloat(selectedCategory.price),
      price_type: selectedCategory.price_type,
      meters: selectedCategory.price_type === 'per_meter' ? parseFloat(meters) : 1,
      additional_services: selectedServices.map((s) => ({ id: s.id, price: s.price })),
      total_amount: totalAmount,
    };

    try {
      const res = await axios.post(ORDERS_API, payload, { withCredentials: true });
      if (res.data.success) {
        setSuccessMsg(`Order #${res.data.order_id} created successfully! 🎉`);
        // Reset Form
        setSelectedCategory(null);
        setMeters(1);
        setSelectedServices([]);
        setPlateNumber('');
      }
    } catch (err) {
      console.error('Create order error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="pos-loading">Loading POS System...</div>;
  }

  return (
    <div className="pos-container">
      <div className="pos-header">
        <h2>New Order</h2>
        <p>Select category, additional services, and calculate total</p>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form onSubmit={handleSubmitOrder} className="pos-layout">
        {/* Left Column: Selection */}
        <div className="pos-main">
          {/* 1. Category Selection */}
          <div className="pos-card">
            <h3>1. Select Category</h3>
            <div className="categories-grid">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`category-card ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-price">
                    {Number(cat.price).toLocaleString()} L.L
                    {cat.price_type === 'per_meter' && <span className="cat-unit"> / Meter</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Meters Input (if per_meter) */}
            {selectedCategory?.price_type === 'per_meter' && (
              <div className="meter-input-box">
                <label>Enter Meters / Length:</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={meters}
                  onChange={(e) => setMeters(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* 2. Additional Services Button & Selected Preview */}
          <div className="pos-card">
            <h3>2. Additional Services</h3>
            <button
              type="button"
              className="btn-choose-services"
              onClick={() => setIsModalOpen(true)}
            >
              Choose Additional Services
            </button>

            {/* Preview of selected services */}
            {selectedServices.length > 0 && (
              <div className="selected-pills-container">
                {selectedServices.map((serv) => (
                  <span key={serv.id} className="service-pill">
                    {serv.name} (+{Number(serv.price).toLocaleString()} L.L)
                    <button
                      type="button"
                      className="remove-pill"
                      onClick={() => toggleService(serv)}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 3. Vehicle Info */}
          <div className="pos-card">
            <h3>3. Vehicle Information (Optional)</h3>
            <div className="form-group">
              <label>Plate Number / Description</label>
              <input
                type="text"
                placeholder="e.g. 123456 G or Black BMW"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="pos-sidebar">
          <div className="summary-card">
            <h3>Order Summary</h3>

            <div className="summary-section">
              <div className="summary-row header-row">
                <span>Item</span>
                <span>Amount</span>
              </div>

              {selectedCategory ? (
                <div className="summary-row">
                  <span>
                    {selectedCategory.name}
                    {selectedCategory.price_type === 'per_meter' && ` (${meters}m)`}
                  </span>
                  <span>{calculateCategoryCost().toLocaleString()} L.L</span>
                </div>
              ) : (
                <div className="summary-row empty-row">No category selected</div>
              )}

              {selectedServices.map((serv) => (
                <div key={serv.id} className="summary-row service-row">
                  <span>+ {serv.name}</span>
                  <span>{Number(serv.price).toLocaleString()} L.L</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="total-box">
              <span>Total Amount</span>
              <span className="total-price">{totalAmount.toLocaleString()} L.L</span>
            </div>

            <button
              type="submit"
              className="btn-submit-order"
              disabled={!selectedCategory || submitting}
            >
              {submitting ? 'Creating Order...' : 'Submit Order'}
            </button>
          </div>
        </div>
      </form>

      {/* POPUP MODAL FOR SERVICES */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Additional Services</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              {services.length === 0 ? (
                <p className="no-services">No additional services available.</p>
              ) : (
                <div className="services-grid">
                  {services.map((serv) => {
                    const isSelected = selectedServices.some((s) => s.id === serv.id);
                    return (
                      <div
                        key={serv.id}
                        className={`service-card ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleService(serv)}
                      >
                        <input type="checkbox" checked={isSelected} readOnly />
                        <div className="serv-info">
                          <span className="serv-name">{serv.name}</span>
                          <span className="serv-price">+{Number(serv.price).toLocaleString()} L.L</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-done"
                onClick={() => setIsModalOpen(false)}
              >
                Done ({selectedServices.length} Selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}