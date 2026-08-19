import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ProductImageUploader from './ProductImageUploader';

const ProductModal = ({ isOpen, product, categories = [], isAdmin = false, onClose, onSuccess }) => {
  const { token, API_URL } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    condition: 'New',
    category: '',
    specifications: [{ key: '', value: '' }]
  });

  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        condition: product.condition || 'New',
        category: product.category?._id || product.category || (categories[0]?._id || ''),
        specifications: product.specifications && product.specifications.length > 0 ? product.specifications : [{ key: '', value: '' }]
      });
      setExistingImages(product.images ? [...product.images] : []);
      setRemovedImageIds([]);
      setSelectedFiles([]);
    } else {
      setForm({
        name: '',
        price: '',
        description: '',
        condition: 'New',
        category: categories[0]?._id || '',
        specifications: [{ key: '', value: '' }]
      });
      setExistingImages([]);
      setRemovedImageIds([]);
      setSelectedFiles([]);
    }
  }, [product, categories]);

  if (!isOpen) return null;

  const handleAddSpecRow = () => {
    setForm({ ...form, specifications: [...form.specifications, { key: '', value: '' }] });
  };

  const handleRemoveSpecRow = (idx) => {
    const next = [...form.specifications];
    next.splice(idx, 1);
    setForm({ ...form, specifications: next });
  };

  const handleSpecChange = (idx, field, val) => {
    const next = [...form.specifications];
    next[idx][field] = val;
    setForm({ ...form, specifications: next });
  };

  const handleExistingRemove = (publicId) => {
    setExistingImages((prev) => prev.filter((img) => img.public_id !== publicId));
    setRemovedImageIds((prev) => [...prev, publicId]);
  };

  const handleNewFileRemove = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewFilesAdd = (newFiles) => {
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.description.trim() || !form.category) {
      setErrorMsg('Please fill in Title, Price, Description, and Category.');
      return;
    }

    if (existingImages.length === 0 && selectedFiles.length === 0) {
      setErrorMsg('At least one product image is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const data = new FormData();
      data.append('name', form.name.trim());
      data.append('price', form.price);
      data.append('description', form.description.trim());
      data.append('condition', form.condition);
      data.append('category', form.category);

      const validSpecs = form.specifications.filter((s) => s.key.trim() && s.value.trim());
      data.append('specifications', JSON.stringify(validSpecs));

      if (removedImageIds.length > 0) {
        data.append('removedImageIds', JSON.stringify(removedImageIds));
      }

      selectedFiles.forEach((f) => data.append('images', f));

      const isEdit = !!product;
      let url = `${API_URL}/products`;
      if (isAdmin) {
        url = isEdit ? `${API_URL}/products/admin/${product._id}` : `${API_URL}/products/admin/create`;
      } else {
        url = isEdit ? `${API_URL}/products/my/${product._id}` : `${API_URL}/products`;
      }

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });

      const result = await res.json();
      if (!res.ok || result.status !== 'success') {
        throw new Error(result.message || 'Failed to save product listing.');
      }

      onSuccess();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', maxWidth: '650px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800 }}>
            {isAdmin ? (product ? 'Edit Admin Product' : 'Create Admin Assured Product') : (product ? 'Edit Product Listing' : 'Post New Campus Item')}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', backgroundColor: '#fff5f5', color: '#c53030', fontSize: '0.875rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Item Title *</label>
              <input type="text" placeholder="e.g. Engineering Mathematics Textbook" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Price (₹) *</label>
              <input type="number" placeholder="e.g. 450" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Condition *</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                <option value="New">New</option>
                <option value="Used">Used</option>
                <option value="Old">Old</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Description *</label>
            <textarea rows={3} placeholder="Describe your item, usage history, and condition..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>

          {/* Dynamic Specifications */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Dynamic Specifications (Optional)</label>
              <button type="button" onClick={handleAddSpecRow} style={{ border: 'none', background: '#f1f5f9', color: '#2563eb', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>+ Add Row</button>
            </div>
            {form.specifications.map((row, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input type="text" placeholder="Key (e.g. Edition)" value={row.key} onChange={(e) => handleSpecChange(idx, 'key', e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }} />
                <input type="text" placeholder="Value (e.g. 5th Edition)" value={row.value} onChange={(e) => handleSpecChange(idx, 'value', e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }} />
                <button type="button" onClick={() => handleRemoveSpecRow(idx)} style={{ border: 'none', background: '#fff5f5', color: '#dc2626', padding: '0.5rem 0.625rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>✕</button>
              </div>
            ))}
          </div>

          {/* Product Image Uploader */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <ProductImageUploader
              existingImages={existingImages}
              selectedFiles={selectedFiles}
              onExistingRemove={handleExistingRemove}
              onNewFileRemove={handleNewFileRemove}
              onNewFilesAdd={handleNewFilesAdd}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" disabled={submitting} style={{ flex: 1, backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: 700, fontSize: '0.9375rem', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Submitting...' : isAdmin ? (product ? 'Save Changes' : 'Create Assured Product') : (product ? 'Update Listing' : 'Post Product Listing')}
            </button>
            <button type="button" onClick={onClose} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.875rem 1.25rem', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
