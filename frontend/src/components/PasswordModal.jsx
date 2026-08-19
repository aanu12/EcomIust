import React, { useState } from 'react';

const PasswordModal = ({ isOpen, user, password, onClose, onSendEmail }) => {
  const [copied, setCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  if (!isOpen || !user) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const result = await onSendEmail(user._id || user.id, password);
      setEmailStatus({ success: true, message: result.message || `Login credentials sent to ${user.email}` });
    } catch (err) {
      setEmailStatus({ success: false, message: err.message || 'Failed to send credentials email.' });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              margin: '0 auto 1rem auto',
              border: '1px solid #bbf7d0'
            }}
          >
            ✓
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
            Account Approved & Password Generated
          </h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            Credentials for <strong>{user.name}</strong> ({user.email})
          </p>
        </div>

        {/* Password Display Box */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', tracking: '0.05em', fontWeight: 600 }}>
            Generated Secure Password
          </span>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '0.05em',
              margin: '0.5rem 0'
            }}
          >
            {password}
          </div>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? '#f0fdf4' : '#ffffff',
              border: `1px solid ${copied ? '#86efac' : '#cbd5e1'}`,
              color: copied ? '#15803d' : '#475569',
              borderRadius: '6px',
              padding: '0.375rem 0.875rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {copied ? '✓ Password Copied' : '📋 Copy Password'}
          </button>
        </div>

        {emailStatus && (
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: emailStatus.success ? '#f0fff4' : '#fff5f5',
              border: `1px solid ${emailStatus.success ? '#9ae6b4' : '#feb2b2'}`,
              color: emailStatus.success ? '#22543d' : '#9b2c2c'
            }}
          >
            {emailStatus.success ? '✅ ' : '❌ '}
            {emailStatus.message}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleSendEmail}
            disabled={sendingEmail}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.875rem',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: sendingEmail ? 'not-allowed' : 'pointer',
              opacity: sendingEmail ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            ✉️ {sendingEmail ? 'Sending Email Credentials...' : 'Send in Email'}
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '0.75rem',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
