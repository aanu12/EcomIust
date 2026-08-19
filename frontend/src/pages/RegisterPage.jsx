import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const { API_URL } = useContext(AuthContext);

  const [formData, setFormData] = useState({ name: '', email: '', course: '' });
  const [idFile, setIdFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, idFile: 'Please upload a valid image file (JPG, PNG, WEBP).' });
        return;
      }
      setIdFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors({ ...errors, idFile: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!formData.name.trim()) newErrors.name = 'Full Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.course.trim()) newErrors.course = 'Course detail is required.';
    if (!idFile) newErrors.idFile = 'Student ID document image is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('email', formData.email.trim().toLowerCase());
      data.append('course', formData.course.trim());
      data.append('idImage', idFile);

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        body: data
      });

      const result = await res.json();

      if (!res.ok || result.status !== 'success') {
        throw new Error(result.message || 'Registration failed.');
      }

      setSubmittedSuccess(true);
    } catch (err) {
      setApiError(err.message || 'An error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              fontSize: '1.5rem',
              marginBottom: '1rem'
            }}
          >
            🎓
          </div>
          <h1 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em' }}>
            Student Registration
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9375rem', color: '#64748b' }}>
            University Campus Marketplace Verification
          </p>
        </div>

        {submittedSuccess ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                border: '1px solid #bbf7d0'
              }}
            >
              ✓
            </div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 600, color: '#0f172a', margin: '0 0 0.75rem 0' }}>
              Registration Submitted!
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
              Your student ID verification document has been securely uploaded. Your account is currently <strong>Pending Admin Verification</strong>.
            </p>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1rem',
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '2rem'
              }}
            >
              Once your student status is verified by the administrator, your generated login password will be dispatched.
            </div>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                width: '100%',
                padding: '0.875rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem',
                boxSizing: 'border-box'
              }}
            >
              Return to Login Page
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {apiError && (
              <div
                style={{
                  backgroundColor: '#fff5f5',
                  border: '1px solid #feb2b2',
                  color: '#c53030',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem'
                }}
              >
                ⚠️ {apiError}
              </div>
            )}

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Sahil Ahmad"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: `1px solid ${errors.name ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.name && <span style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g. student@iust.ac.in"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: `1px solid ${errors.email ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {errors.email && <span style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
            </div>

            {/* Course */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                Course / Degree
              </label>
              <input
                type="text"
                name="course"
                placeholder="e.g. B.Tech Computer Science"
                value={formData.course}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: `1px solid ${errors.course ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {errors.course && <span style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.25rem', display: 'block' }}>{errors.course}</span>}
            </div>

            {/* ID Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                Student ID Document / Card Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '10px',
                  border: `1px solid ${errors.idFile ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                  background: '#f8fafc'
                }}
              />
              {errors.idFile && <span style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.25rem', display: 'block' }}>{errors.idFile}</span>}

              {imagePreview && (
                <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.375rem' }}>Selected ID Preview:</span>
                  <img
                    src={imagePreview}
                    alt="ID Document Preview"
                    style={{
                      maxHeight: '140px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                marginTop: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              {submitting ? 'Submitting Registration...' : 'Submit Student Registration'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
