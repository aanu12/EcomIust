import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const CategoryList = ({ categories: initialCategories }) => {
  const { API_URL } = useContext(AuthContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState(initialCategories || []);
  const [loading, setLoading] = useState(!initialCategories);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (initialCategories !== undefined) {
      setCategories(initialCategories);
      setLoading(false);
    }
  }, [initialCategories]);

  useEffect(() => {
    if (initialCategories === undefined && API_URL) {
      fetch(`${API_URL}/categories`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success') {
            setCategories(Array.isArray(data.data) ? data.data : []);
          }
        })
        .catch((err) => console.error('Failed to load categories:', err))
        .finally(() => setLoading(false));
    }
  }, [API_URL, initialCategories]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>
        Loading categories...
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', width: '100%', boxSizing: 'border-box' }} id="categories">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: isMobile ? '1.125rem' : '1.375rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
            Categories
          </h3>
          <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Explore campus marketplace departments</span>
        </div>
      </div>

      {/* Responsive Layout: Horizontal Carousel on Mobile, Responsive Grid on Desktop */}
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '1.25rem'
              }
        }
      >
        {categories.map((cat) => (
          <div
            key={cat._id}
            onClick={() => navigate(`/category/${cat._id}`)}
            style={
              isMobile
                ? {
                    flex: '0 0 110px',
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }
                : {
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '0.875rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }
            }
          >
            {/* 1:1 Square Category Image Container (512x512 Source target) */}
            <div
              style={{
                width: isMobile ? '90px' : '100%',
                height: isMobile ? '90px' : 'auto',
                aspectRatio: '1 / 1',
                borderRadius: '18px',
                overflow: 'hidden',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                marginBottom: '0.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <img
                src={cat.image?.url}
                alt={cat.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

            {/* Category Name Underneath */}
            <span
              style={{
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                fontWeight: 700,
                color: '#0f172a',
                textAlign: 'center',
                lineHeight: 1.2,
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryList;
