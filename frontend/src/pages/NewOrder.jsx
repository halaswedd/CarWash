import { useState, useEffect } from 'react';
import axios from 'axios';
import './NewOrder.css';

const CATEGORIES_API = 'http://localhost/carwash/backend/api/categories.php';
const SERVICES_API = 'http://localhost/carwash/backend/api/additional_services.php';
const ORDERS_API = 'http://localhost/carwash/backend/api/orders.php';

export default function NewOrder() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);

  // السلال (carts) للفئات والخدمات الإضافية
  const [cart, setCart] = useState([]);
  const [servicesCart, setServicesCart] = useState([]);

  // حالة الـ Pop-up الخاصة بالمتر (للسجاد مثلاً)
  const [showMeterModal, setShowMeterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [meterInput, setMeterInput] = useState('');

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

  // التعامل مع النقر على الفئة (Category Click)
  const handleCategoryClick = (category) => {
    if (category.price_type === 'per_meter') {
      setSelectedCategory(category);
      setMeterInput('');
      setShowMeterModal(true);
    } else {
      addToCartRegular(category);
    }
  };

  // إضافة فئة ذات سعر ثابت للعربة
  const addToCartRegular = (category) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === category.id && item.price_type !== 'per_meter');
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === category.id && item.price_type !== 'per_meter'
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...category, cartItemId: Date.now(), quantity: 1, displayPrice: parseFloat(category.price) }];
      }
    });
  };

  // تأكيد إدخال الأمتار من الـ Pop-up (أرقام صحيحة حصراً بين 1 و 100)
  const handleConfirmMeters = (e) => {
    e.preventDefault();
    const meters = parseInt(meterInput, 10);

    if (isNaN(meters) || meters < 1 || meters > 100) {
      alert('Please enter a valid whole number of meters between 1 and 100.');
      return;
    }

    const unitPrice = parseFloat(selectedCategory.price) || 0;
    const totalPrice = unitPrice * meters;

    setCart((prevCart) => [
      ...prevCart,
      {
        ...selectedCategory,
        cartItemId: Date.now(),
        quantity: 1,
        meters: meters,
        displayPrice: totalPrice,
      },
    ]);

    setShowMeterModal(false);
    setSelectedCategory(null);
    setMeterInput('');
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            if (item.price_type !== 'per_meter') {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  // إدارة سلة الخدمات الإضافية (Services Cart)
  const addServiceToCart = (service) => {
    setServicesCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === service.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...service, quantity: 1 }];
      }
    });
  };

  const updateServiceQuantity = (id, delta) => {
    setServicesCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeServiceFromCart = (id) => {
    setServicesCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // الحسابات الإجمالية
  const calculateItemsCost = () => {
    return cart.reduce((sum, item) => {
      if (item.price_type === 'per_meter') {
        return sum + (item.displayPrice || 0);
      } else {
        return sum + (parseFloat(item.price) || 0) * item.quantity;
      }
    }, 0);
  };

  const calculateServicesCost = () => {
    return servicesCart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
  };

  const totalAmount = calculateItemsCost() + calculateServicesCost();

  // إرسال الطلب النهائي للـ Backend
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0 && servicesCart.length === 0) {
      setErrorMsg('Cart is empty. Please add items.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      items: cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price_type === 'per_meter' ? item.displayPrice / item.meters : parseFloat(item.price),
        meters: item.price_type === 'per_meter' ? item.meters : null,
      })),
      additional_services: servicesCart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
      total_amount: totalAmount,
    };

    try {
      const res = await axios.post(ORDERS_API, payload, { withCredentials: true });
      if (res.data.success) {
        setSuccessMsg(`Order #${res.data.order_id} submitted successfully! 🎉`);
        setCart([]);
        setServicesCart([]);
      }
    } catch (err) {
      console.error('Create order error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit order.');
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
        <h2>New Order / POS</h2>
        <p>Click categories or additional services. Carpet/Per-meter items will ask for meters.</p>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form onSubmit={handleSubmitOrder} className="pos-layout">
        <div className="pos-main">
          {/* Categories Grid */}
          <div className="pos-card">
            <h3>1. Categories (Car Types & Carpets)</h3>
            <div className="categories-grid">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="category-card"
                  onClick={() => handleCategoryClick(cat)}
                >
                  <div className="cat-name">
                    <span>{cat.name}</span>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{cat.name_ar}</span>
                  </div>
                  <div className="cat-price">
                    {Number(cat.price).toLocaleString()} L.L {cat.price_type === 'per_meter' ? '/ m²' : ''}
                  </div>
                  <div className="cat-action-hint">Add</div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Services Grid */}
          <div className="pos-card">
            <h3>2. Additional Services</h3>
            <div className="categories-grid">
              {services.map((serv) => (
                <div
                  key={serv.id}
                  className="category-card service-grid-card"
                  onClick={() => addServiceToCart(serv)}
                >
                  <div className="cat-name">
                    <span>{serv.name}</span>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{serv.name_ar}</span>
                  </div>
                  <div className="cat-price" style={{ color: '#0369a1' }}>+{Number(serv.price).toLocaleString()} L.L</div>
                  <div className="cat-action-hint service-hint">Add</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Summary & Cart */}
        <div className="pos-sidebar">
          <div className="summary-card">
            <h3>Order Summary Cart</h3>

            <div className="summary-section">
              {cart.length === 0 && servicesCart.length === 0 ? (
                <div className="empty-row">Cart is empty</div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={`cart-${item.cartItemId}`} className="cart-item-row">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name} ({item.name_ar})</span>
                        {item.price_type === 'per_meter' && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Meters: {item.meters}</span>
                        )}
                        <span className="cart-item-price">
                          {item.price_type === 'per_meter' 
                            ? `${item.displayPrice.toLocaleString()} L.L` 
                            : `${(item.price * item.quantity).toLocaleString()} L.L`}
                        </span>
                      </div>
                      <div className="cart-item-controls">
                        {item.price_type !== 'per_meter' && (
                          <>
                            <button type="button" onClick={() => updateQuantity(item.cartItemId, -1)}>-</button>
                            <span>{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.cartItemId, 1)}>+</button>
                          </>
                        )}
                        <button type="button" className="btn-remove-clean" onClick={() => removeFromCart(item.cartItemId)}>×</button>
                      </div>
                    </div>
                  ))}

                  {servicesCart.map((item) => (
                    <div key={`serv-${item.id}`} className="cart-item-row service-cart-row">
                      <div className="cart-item-info">
                        <span className="cart-item-name">+ {item.name} ({item.name_ar})</span>
                        <span className="cart-item-price">
                          {(item.price * item.quantity).toLocaleString()} L.L
                        </span>
                      </div>
                      <div className="cart-item-controls">
                        <button type="button" onClick={() => updateServiceQuantity(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateServiceQuantity(item.id, 1)}>+</button>
                        <button type="button" className="btn-remove-clean" onClick={() => removeServiceFromCart(item.id)}>×</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="summary-divider"></div>

            <div className="total-box">
              <span>Total Amount</span>
              <span className="total-price">{totalAmount.toLocaleString()} L.L</span>
            </div>

            <button
              type="submit"
              className="btn-submit-order"
              disabled={(cart.length === 0 && servicesCart.length === 0) || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Order'}
            </button>
          </div>
        </div>
      </form>

      {/* Meter Input Modal (Pop-up) */}
      {showMeterModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Enter Meters for {selectedCategory?.name}</h3>
            <p>
              Price per meter: {Number(selectedCategory?.price).toLocaleString()} L.L
            </p>
            <form onSubmit={handleConfirmMeters}>
              <input
                type="number"
                step="1"
                min="1"
                max="100"
                placeholder="Enter meters (e.g. 5)"
                value={meterInput}
                onChange={(e) => setMeterInput(e.target.value)}
                autoFocus
                className="modal-input"
              />
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowMeterModal(false)}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-confirm"
                >
                  Add to Cart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}