import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a' }}>
              Campus Marketplace
            </h1>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>University Student Marketplace</span>
          </div>
        </div>

        <button
          onClick={logoutUser}
          style={{
            backgroundColor: '#ffffff',
            color: '#475569',
            border: '1px solid #cbd5e1',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontWeight: 500,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </header>

      {/* Main Student Hub Container */}
      <main style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  Welcome, {user?.name || 'Student'}!
                </h2>
                <span
                  style={{
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.625rem'
                  }}
                >
                  ✓ Verified Student
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9375rem', color: '#64748b' }}>
                {user?.course || 'University Student'}
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #e2e8f0',
              marginTop: '1.5rem'
            }}
          >
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
              Student Profile Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Full Name</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{user?.name}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Registered Email</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{user?.email}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Course / Department</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{user?.course}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Verification Status</span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>Approved</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
