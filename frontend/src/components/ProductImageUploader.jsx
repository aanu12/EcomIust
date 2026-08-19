import React, { useRef } from 'react';
import { CloseIcon } from './Icons';

const ProductImageUploader = ({
  existingImages = [],
  selectedFiles = [],
  onExistingRemove,
  onNewFileRemove,
  onNewFilesAdd,
  maxImages = 10
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onNewFilesAdd(files);
    }
    // Reset file input value so user can re-select the same file if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalImagesCount = existingImages.length + selectedFiles.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
          Product Images ({totalImagesCount}/{maxImages})
        </label>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>High-res photos supported (up to 25MB each)</span>
      </div>

      {/* Grid of Previews + Add Button */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.875rem' }}>
        {/* Existing Cloudinary Images */}
        {existingImages.map((img) => (
          <div
            key={img.public_id || img.url}
            style={{
              position: 'relative',
              aspectRatio: '1 / 1',
              borderRadius: '14px',
              overflow: 'hidden',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}
          >
            <img src={img.url} alt="Existing Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button"
              onClick={() => onExistingRemove(img.public_id)}
              title="Remove existing image"
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                backgroundColor: 'rgba(239, 68, 68, 0.95)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              <CloseIcon size={14} color="#ffffff" />
            </button>
            <span style={{ position: 'absolute', bottom: '4px', left: '4px', backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', fontSize: '0.625rem', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 600 }}>Saved</span>
          </div>
        ))}

        {/* Newly Selected Files */}
        {selectedFiles.map((file, idx) => {
          const previewUrl = URL.createObjectURL(file);
          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: '14px',
                overflow: 'hidden',
                backgroundColor: '#f1f5f9',
                border: '2px solid #007aff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}
            >
              <img src={previewUrl} alt="New Selection" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => onNewFileRemove(idx)}
                title="Remove selected image"
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: 'rgba(239, 68, 68, 0.95)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <CloseIcon size={14} color="#ffffff" />
              </button>
              <span style={{ position: 'absolute', bottom: '4px', left: '4px', backgroundColor: '#007aff', color: '#ffffff', fontSize: '0.625rem', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>New</span>
            </div>
          );
        })}

        {/* Add More Files Trigger Card */}
        {totalImagesCount < maxImages && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              aspectRatio: '1 / 1',
              borderRadius: '14px',
              border: '2px dashed #cbd5e1',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#007aff',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ fontSize: '1.5rem', lineHeight: 1, fontWeight: 700 }}>+</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, marginTop: '2px', color: '#475569' }}>Add Photos</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ProductImageUploader;
