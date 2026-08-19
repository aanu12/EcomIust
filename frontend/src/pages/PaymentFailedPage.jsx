import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PaymentFailedPage = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '550px', width: '100%', margin: '4rem auto', padding: '0 1.5rem', boxSizing: 'border-box', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #feb2b2', borderRadius: '24px', padding: '2.5rem 1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#fff5f5', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.25rem auto' }}>
            ✕
          </div>

          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 800, color: '#dc2626' }}>
            Payment Transaction Failed
          </h1>
          <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.9375rem' }}>
            Your test payment was cancelled or declined. No money was charged and your order was not placed.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/checkout" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.75rem 1.25rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              Retry Checkout
            </Link>
            <Link to="/cart" style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              Return to Cart
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentFailedPage;
