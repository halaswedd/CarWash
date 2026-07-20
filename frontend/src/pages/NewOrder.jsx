import { useState, useEffect } from 'react';
import axios from 'axios';
import './NewOrder.css';

const CATEGORIES_API = 'http://localhost/carwash/backend/api/categories.php';
const SERVICES_API = 'http://localhost/carwash/backend/api/additional_services.php';
const ORDERS_API = 'http://localhost/carwash/backend/api/orders.php';

export default function NewOrder() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);

  // السلال (carts) للفئات والخدمات الإضافية مع الكميات
  const [cart, setCart] = useState([]);
  const [servicesCart, setServicesCart] = useState([]);

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

  // إدارة سلة الفئات (Categories Cart)
  const addToCart = (category) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === category.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === category.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...category, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) => {
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

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
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

  // الحسابات
  const calculateItemsCost = () => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
  };

  const calculateServicesCost = () => {
    return servicesCart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
  };

  const totalAmount = calculateItemsCost() + calculateServicesCost();

  // إرسال الطلب النهائي
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
        price: parseFloat(item.price),
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
        <p>Click categories or additional services to add quantities, then submit order</p>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form onSubmit={handleSubmitOrder} className="pos-layout">
        <div className="pos-main">
          {/* Categories Grid */}
          <div className="pos-card">
            <h3>1. Categories (Car Types)</h3>
            <div className="categories-grid">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="category-card"
                  onClick={() => addToCart(cat)}
                >
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-price">{Number(cat.price).toLocaleString()} L.L</div>
                  <div className="cat-action-hint">➕ Add</div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Services Grid (Directly on page, no popup) */}
          <div className="pos-card">
            <h3>2. Additional Services</h3>
            <div className="categories-grid">
              {services.map((serv) => (
                <div
                  key={serv.id}
                  className="category-card service-grid-card"
                  onClick={() => addServiceToCart(serv)}
                >
                  <div className="cat-name">{serv.name}</div>
                  <div className="cat-price">+{Number(serv.price).toLocaleString()} L.L</div>
                  <div className="cat-action-hint service-hint">➕ Add</div>
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
                <div className="summary-row empty-row">Cart is empty</div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={`cat-${item.id}`} className="cart-item-row">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-price">
                          {(item.price * item.quantity).toLocaleString()} L.L
                        </span>
                      </div>
                      <div className="cart-item-controls">
                        <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
                        <button type="button" className="btn-remove-clean" onClick={() => removeFromCart(item.id)}>×</button>
                      </div>
                    </div>
                  ))}

                  {servicesCart.map((item) => (
                    <div key={`serv-${item.id}`} className="cart-item-row service-cart-row">
                      <div className="cart-item-info">
                        <span className="cart-item-name">+ {item.name}</span>
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
    </div>
  );
}