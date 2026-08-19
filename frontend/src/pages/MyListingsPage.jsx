import React, { useState, useEffect, useContext, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import ProductModal from '../components/ProductModal';

const MyListingsPage = () => {
  const { token, API_URL, user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchMyListings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/my-listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setProducts(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCategories(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchMyListings();
    fetchCategories();
  }, [fetchMyListings, fetchCategories]);

  const handleCreateNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleDelete = async (prodId) => {
    if (!window.confirm('Delete this product listing? This will purge its Cloudinary images.')) return;
    try {
      const res = await fetch(`${API_URL}/products/my/${prodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        fetchMyListings();
      } else {
        alert(data.message || 'Failed to delete listing.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveSuccess = () => {
    setIsModalOpen(false);
    fetchMyListings();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
              My Product Listings ({products.length})
            </h1>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Manage your campus items for sale</span>
          </div>

          <button
            onClick={handleCreateNew}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
            }}
          >
            + Post New Item
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>Loading your listings...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px border #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>No Listings Yet</h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>Sell your unused textbooks, electronics, or supplies to fellow IUST students.</p>
            <button onClick={handleCreateNew} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
              Post Your First Item
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {products.map((prod) => (
              <div key={prod._id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#f1f5f9' }}>
                  <img src={prod.images && prod.images.length > 0 ? prod.images[0].url : 'https://via.placeholder.com/300'} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: prod.status === 'approved' ? '#f0fdf4' : prod.status === 'rejected' ? '#fef2f2' : '#fffbeb', color: prod.status === 'approved' ? '#15803d' : prod.status === 'rejected' ? '#b91c1c' : '#b45309' }}>
                    {prod.status}
                  </span>
                </div>
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.375rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{prod.name}</h3>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>₹{prod.price?.toLocaleString('en-IN')}</div>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prod.description}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.875rem' }}>
                    <button onClick={() => handleEdit(prod)} style={{ flex: 1, backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                      Edit Item
                    </button>
                    <button onClick={() => handleDelete(prod._id)} style={{ flex: 1, backgroundColor: '#fff5f5', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ProductModal isOpen={isModalOpen} product={editingProduct} categories={categories} onClose={() => setIsModalOpen(false)} onSuccess={handleSaveSuccess} />
      <Footer />
    </div>
  );
};

export default MyListingsPage;
