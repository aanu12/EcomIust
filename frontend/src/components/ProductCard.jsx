import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const mainImage = product.images && product.images.length > 0
    ? product.images[0].url
    : 'https://via.placeholder.com/400x400?text=No+Image';

  const categoryName = typeof product.category === 'object' && product.category
    ? product.category.name
    : 'General';

  return (
    <Link
      to={`/product/${product._id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}
      >
        {/* Product Image Container */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
          <img
            src={mainImage}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />

          {/* Condition Badge */}
          <span
            style={{
              position: 'absolute',
              top: '0.625rem',
              left: '0.625rem',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
              color: '#0f172a',
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              textTransform: 'uppercase'
            }}
          >
            {product.condition}
          </span>

          {/* Admin Assured Green Badge */}
          {product.isAdminProduct && (
            <span
              style={{
                position: 'absolute',
                top: '0.625rem',
                right: '0.625rem',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                fontSize: '0.6875rem',
                fontWeight: 800,
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              🛡️ Assured
            </span>
          )}
        </div>

        {/* Content Container */}
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>
              {categoryName}
            </span>
            <h4
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#0f172a',
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {product.name}
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
