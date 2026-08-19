import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { token, API_URL } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setOrder(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [API_URL, orderId, token]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '600px', width: '100%', margin: '4rem auto', padding: '0 1.5rem', boxSizing: 'border-box', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2.5rem 1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.25rem auto' }}>
            ✓
          </div>

          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Payment Successful!
          </h1>
          <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.9375rem' }}>
            Your order has been confirmed and a receipt email has been sent.
          </p>

          {loading ? (
            <div>Loading receipt details...</div>
          ) : order ? (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', textAlign: 'left', margin: '0 0 1.5rem 0', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Order Number:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>#{order.orderNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Total Paid:</span>
                <span style={{ fontWeight: 800, color: '#16a34a' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Payment Method:</span>
                <span style={{ fontWeight: 600 }}>{order.paymentMethod}</span>
              </div>
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Campus Pickup Location:</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>📍 {order.meetpoint?.name}</span>
                <span style={{ display: 'block', color: '#475569', fontSize: '0.75rem' }}>Landmark: {order.meetpoint?.landmark}</span>
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/orders" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.75rem 1.25rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              View My Orders
            </Link>
            <Link to="/" style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;
