import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ProductCard from './ProductCard';

const FeaturedProducts = ({ products: initialProducts }) => {
  const { API_URL } = useContext(AuthContext);
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (initialProducts !== undefined) {
      setProducts(initialProducts);
      setLoading(false);
    }
  }, [initialProducts]);

  useEffect(() => {
    if (initialProducts === undefined && API_URL) {
      fetch(`${API_URL}/products/featured`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success') {
            setProducts(Array.isArray(data.data) ? data.data : []);
          }
        })
        .catch((err) => console.error('Failed to load featured products:', err))
        .finally(() => setLoading(false));
    }
  }, [API_URL, initialProducts]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>
        Loading featured student products...
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ fontSize: '1.125rem' }}>⭐</span>
            <h3 style={{ margin: 0, fontSize: isMobile ? '1.125rem' : '1.375rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
              Featured Listings
            </h3>
          </div>
          <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Handpicked campus products & verified deals</span>
        </div>
      </div>

      {/* Horizontal Swipe Carousel on Mobile, Responsive Grid on Desktop */}
      <div
        style={
          isMobile
            ? {
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                paddingBottom: '0.5rem',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }
            : {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.25rem'
              }
        }
      >
        {products.map((product) => (
          <div
            key={product._id}
            style={
              isMobile
                ? {
                    flex: '0 0 200px',
                    scrollSnapAlign: 'start'
                  }
                : undefined
            }
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
