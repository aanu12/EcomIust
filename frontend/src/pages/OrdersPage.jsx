import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';

const OrdersPage = () => {
  const { token, API_URL, user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setOrders(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [API_URL, token]);

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, maxWidth: '500px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <h3>Please Sign In to View Orders</h3>
          <Link to="/login" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
          My Purchase Orders ({orders.length})
        </h1>
        <p style={{ margin: '0 0 2rem 0', fontSize: '0.875rem', color: '#64748b' }}>
          Review your campus order receipts and pickup meetpoints.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>Loading order history...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>No Orders Placed Yet</h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>Explore campus marketplace listings and purchase items securely.</p>
            <Link to="/" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order) => (
              <div key={order._id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.875rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                      Order #{order.orderNumber}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: order.paymentStatus === 'paid' ? '#f0fdf4' : order.paymentStatus === 'failed' ? '#fef2f2' : '#fffbeb', color: order.paymentStatus === 'paid' ? '#15803d' : order.paymentStatus === 'failed' ? '#b91c1c' : '#b45309' }}>
                      Payment: {order.paymentStatus}
                    </span>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: '#f1f5f9', color: '#334155' }}>
                      Status: {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Items Ordered ({order.items?.length}):</span>
                    {order.items?.map((it, idx) => (
                      <div key={idx} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                        • {it.productName} (x{it.quantity}) - ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                      </div>
                    ))}
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Campus Meetpoint Pickup:</span>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#2563eb' }}>📍 {order.meetpoint?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>Landmark: {order.meetpoint?.landmark}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.875rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    Total: ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </span>
                  <Link to={`/payment-success?orderId=${order._id}`} style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none' }}>
                    View Receipt 🧾
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrdersPage;
