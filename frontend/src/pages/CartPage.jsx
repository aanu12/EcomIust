import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';

const CartPage = () => {
  const { token, API_URL, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCart(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/cart/item`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: newQuantity })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCart(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/cart/item/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCart(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '1.5rem' }}>
          <h3>Sign in to view your cart</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Please log in to manage your campus marketplace cart.</p>
          <Link to="/login" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((acc, item) => acc + ((item.product?.price || item.priceAtAddition) * item.quantity), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 800 }}>Shopping Cart ({items.length})</h1>
        <p style={{ margin: '0 0 2rem 0', color: '#64748b', fontSize: '0.875rem' }}>Review items before proceeding to campus pickup checkout.</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>Loading shopping cart...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Your cart is empty</h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>Browse campus marketplace items and add them to your cart.</p>
            <Link to="/" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>Explore Listings</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => {
                const prod = item.product || {};
                const itemPrice = prod.price || item.priceAtAddition;
                return (
                  <div key={item._id || prod._id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src={prod.images && prod.images.length > 0 ? prod.images[0].url : 'https://via.placeholder.com/100'} alt={prod.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700 }}>{prod.name}</h4>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>₹{itemPrice?.toLocaleString('en-IN')}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                          <button onClick={() => handleUpdateQuantity(prod._id, item.quantity - 1)} disabled={updating || item.quantity <= 1} style={{ border: 'none', background: '#f1f5f9', padding: '0.25rem 0.6rem', fontWeight: 700, cursor: 'pointer' }}>-</button>
                          <span style={{ padding: '0 0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(prod._id, item.quantity + 1)} disabled={updating} style={{ border: 'none', background: '#f1f5f9', padding: '0.25rem 0.6rem', fontWeight: 700, cursor: 'pointer' }}>+</button>
                        </div>
                        <button onClick={() => handleRemoveItem(prod._id)} disabled={updating} style={{ color: '#ef4444', border: 'none', background: 'transparent', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>Remove</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 800 }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                <span>Items Subtotal:</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                <span>Campus Pickup Fee:</span><span style={{ color: '#16a34a', fontWeight: 700 }}>FREE</span>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                <span>Total Amount:</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <button onClick={() => navigate('/checkout')} style={{ width: '100%', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
