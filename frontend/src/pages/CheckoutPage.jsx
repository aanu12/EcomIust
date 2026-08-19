import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';

const CheckoutPage = () => {
  const { token, API_URL, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [meetpoints, setMeetpoints] = useState([]);
  const [selectedMeetpoint, setSelectedMeetpoint] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCartAndMeetpoints = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [cartRes, meetRes] = await Promise.all([
        fetch(`${API_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/meetpoints`)
      ]);

      const cartData = await cartRes.json();
      const meetData = await meetRes.json();

      if (cartRes.ok && cartData.status === 'success') {
        setCart(cartData.data);
      }

      if (meetRes.ok && meetData.status === 'success') {
        const mpList = meetData.data || [];
        setMeetpoints(mpList);
        if (mpList.length > 0) setSelectedMeetpoint(mpList[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchCartAndMeetpoints();
  }, [fetchCartAndMeetpoints]);

  const handlePlaceOrder = async () => {
    if (!selectedMeetpoint) return alert('Please select a campus pickup meetpoint.');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ meetpointId: selectedMeetpoint })
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Checkout failed.');
      }

      // Simulate Test Razorpay Payment Verification
      const verifyRes = await fetch(`${API_URL}/orders/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: data.orderId, paymentOutcome: 'success' })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.status === 'success') {
        navigate(`/payment-success?orderId=${data.orderId}`);
      } else {
        navigate('/payment-failed');
      }
    } catch (err) {
      alert(`Checkout error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f2f2f7', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, maxWidth: '400px', margin: '4rem auto', textAlign: 'center', padding: '1.5rem' }}>
          <h3>Sign in required</h3>
        </div>
        <Footer />
      </div>
    );
  }

  const items = cart?.items || [];
  const totalAmount = items.reduce((acc, item) => acc + ((item.product?.price || item.priceAtAddition) * item.quantity), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f2f2f7', color: '#000000', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ maxWidth: '600px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem', boxSizing: 'border-box' }}>
        <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 800 }}>Campus Checkout</h1>
        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: '#8e8e93' }}>Select your campus pickup location and confirm test payment.</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#8e8e93' }}>Loading checkout options...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* 1. User Details Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase' }}>1. Buyer Information</h3>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{user.name} ({user.course})</div>
              <div style={{ fontSize: '0.8125rem', color: '#8e8e93', marginTop: '2px' }}>{user.email}</div>
            </div>

            {/* 2. Campus Meetpoints Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase' }}>2. Select Campus Pickup Meetpoint</h3>
              {meetpoints.length === 0 ? <div style={{ fontSize: '0.875rem', color: '#ff3b30' }}>No active meetpoints configured.</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {meetpoints.map((mp) => (
                    <label key={mp._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem', borderRadius: '12px', border: selectedMeetpoint === mp._id ? '2px solid #007aff' : '1px solid #e5e5ea', backgroundColor: selectedMeetpoint === mp._id ? '#f0f7ff' : '#ffffff', cursor: 'pointer' }}>
                      <input type="radio" name="meetpoint" value={mp._id} checked={selectedMeetpoint === mp._id} onChange={() => setSelectedMeetpoint(mp._id)} style={{ marginTop: '3px' }} />
                      <div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#000000' }}>📍 {mp.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: '#8e8e93', marginTop: '2px' }}>Landmark: {mp.landmark}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Order Summary Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase' }}>3. Order Items ({items.length})</h3>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx < items.length - 1 ? '1px solid #e5e5ea' : 'none', fontSize: '0.875rem' }}>
                  <span>{it.product?.name} (x{it.quantity})</span>
                  <span style={{ fontWeight: 700 }}>₹{((it.product?.price || it.priceAtAddition) * it.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #e5e5ea', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 800 }}>
                <span>Total Amount:</span>
                <span style={{ color: '#007aff' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* 4. Action Payment Button */}
            <button onClick={handlePlaceOrder} disabled={submitting || items.length === 0} style={{ backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '1rem', fontWeight: 700, fontSize: '1.0625rem', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,122,255,0.3)' }}>
              {submitting ? 'Processing Payment...' : 'Pay with Razorpay (Test Mode)'}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
