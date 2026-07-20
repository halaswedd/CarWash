import { useState, useEffect } from 'react';
import axios from 'axios';
import './Orders.css';

const ORDERS_API = 'http://localhost/carwash/backend/api/order.php';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(ORDERS_API, { withCredentials: true });
      if (res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setErrorMsg('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const orderId = `#${o.id}`.toLowerCase();
    const category = (o.category_name || '').toLowerCase();
    const services = (o.services_list || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    return orderId.includes(search) || category.includes(search) || services.includes(search);
  });

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div>
          <h2>All Orders</h2>
          <p>Manage and review all system orders</p>
        </div>
        <button className="btn-refresh" onClick={fetchOrders}>
          🔄 Refresh
        </button>
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <div className="orders-card">
        <div className="table-controls">
          <input
            type="text"
            placeholder="Search by Order ID, Category, or Service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="count-badge">{filteredOrders.length} Orders</div>
        </div>

        {loading ? (
          <div className="table-loading">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="table-empty">No orders found.</div>
        ) : (
          <div className="table-responsive">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Category</th>
                  <th>Additional Services</th>
                  <th>Total Price</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="order-id-badge">#{order.id}</span>
                    </td>
                    <td>
                      <span className="category-tag">{order.category_name || 'N/A'}</span>
                    </td>
                    <td>
                      {order.services_list ? (
                        <div className="services-tags">
                          {order.services_list.split(', ').map((serv, i) => (
                            <span key={i} className="service-tag">
                              {serv}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="no-services-text">None</span>
                      )}
                    </td>
                    <td className="total-cell">
                      {Number(order.total).toLocaleString()} L.L
                    </td>
                    <td className="date-cell">
                      {new Date(order.created_at).toLocaleString('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}