import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { AuthContext } from '../context/AuthContext';

const CategoryProductsPage = () => {
  const { categoryId } = useParams();
  const { API_URL } = useContext(AuthContext);

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/products/category/${categoryId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Category not found or failed to load.');
        return res.json();
      })
      .then((data) => {
        if (data.status === 'success') {
          setCategory(data.category);
          setProducts(data.data);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [API_URL, categoryId]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{category?.name || 'Category Products'}</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
            Loading products for this category...
          </div>
        ) : error ? (
          <div style={{ padding: '1.5rem', backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '16px', color: '#c53030' }}>
            ⚠️ Error: {error}
          </div>
        ) : (
          <div>
            {/* Category Header Card */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap'
              }}
            >
              {category?.image?.url && (
                <img
                  src={category.image.url}
                  alt={category.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    border: '1px solid #cbd5e1'
                  }}
                />
              )}
              <div>
                <h1 style={{ margin: '0 0 0.375rem 0', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                  {category?.name}
                </h1>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Showing {products.length} verified student {products.length === 1 ? 'listing' : 'listings'}
                </span>
              </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 1.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '20px'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                  No Listings in this Category Yet
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  Be the first student to post a listing under {category?.name}!
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '1.5rem'
                }}
              >
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryProductsPage;
