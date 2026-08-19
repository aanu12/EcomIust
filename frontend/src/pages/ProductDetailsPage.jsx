import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { API_URL, token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/${id}`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setProduct(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    setAddingToCart(true);
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product._id, quantity: 1 })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        alert('Added to cart!');
      } else {
        alert(data.message || 'Failed to add to cart.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) return navigate('/login');
    await handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '6rem 0', color: '#64748b' }}>Loading product details...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '6rem 1.5rem', color: '#64748b' }}>
          <h3>Product listing not found</h3>
          <button onClick={() => navigate('/')} style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', marginTop: '1rem', fontWeight: 600, cursor: 'pointer' }}>Back to Home</button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [{ url: 'https://via.placeholder.com/600' }];
  const currentImage = images[selectedImageIndex] || images[0];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? '80px' : '2rem' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: isMobile ? '1rem' : '2rem 1.5rem', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Gallery Section */}
          <div>
            <div style={{ position: 'relative', width: '100%', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <img src={currentImage.url} alt={product.name} onClick={() => setShowLightbox(true)} style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain', display: 'block', cursor: 'zoom-in' }} />
              {product.isAdminProduct && (
                <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
                  🛡️ Assured
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {images.map((img, idx) => (
                  <img key={idx} src={img.url} alt="Thumbnail" onClick={() => setSelectedImageIndex(idx)} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '12px', cursor: 'pointer', border: selectedImageIndex === idx ? '2px solid #007aff' : '1px solid #e2e8f0' }} />
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{product.category?.name || 'General'}</span>
                <span style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>Condition: {product.condition}</span>
              </div>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
                {product.name}
              </h1>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                ₹{product.price?.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Desktop Action Buttons */}
            {!isMobile && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleAddToCart} disabled={addingToCart} style={{ flex: 1, backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                  {addingToCart ? 'Adding...' : 'Add to Cart 🛒'}
                </button>
                <button onClick={handleBuyNow} style={{ flex: 1, backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                  Buy Now ⚡
                </button>
              </div>
            )}

            {/* Description */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem', fontWeight: 800 }}>Description</h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{product.description}</p>
            </div>

            {/* Clean iOS-Style Specifications List */}
            {product.specifications && product.specifications.length > 0 && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.875rem 0', fontSize: '0.9375rem', fontWeight: 800 }}>Specifications</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx < product.specifications.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: '0.875rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>{spec.key}</span>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Information */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {product.seller?.name ? product.seller.name[0] : 'S'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Seller: {product.seller?.name || 'Verified Student'}</div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Course: {product.seller?.course || 'IUST Awantipora'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Action Bar */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid #e2e8f0',
            padding: '0.75rem 1rem',
            display: 'flex',
            gap: '0.75rem',
            zIndex: 999
          }}
        >
          <button onClick={handleAddToCart} disabled={addingToCart} style={{ flex: 1, backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.75rem', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer' }}>
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          <button onClick={handleBuyNow} style={{ flex: 1, backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.75rem', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer' }}>
            Buy Now
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && (
        <div onClick={() => setShowLightbox(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <img src={currentImage.url} alt="Fullscreen View" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
