import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheckIcon, UserIcon, MailIcon, PackageIcon } from '../components/Icons';

const UserDashboard = () => {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '800px', width: '100%', margin: '2rem auto', padding: '0 1rem', boxSizing: 'border-box' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 800
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, color: '#0f172a' }}>
                  {user?.name || 'Student'}
                </h2>
                <span
                  style={{
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <ShieldCheckIcon size={14} color="#16a34a" /> Verified Student
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                {user?.course || 'Islamic University of Science & Technology Student'}
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid #e2e8f0'
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Student Profile Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Full Name</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{user?.name}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Registered Email</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{user?.email}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Course / Department</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{user?.course}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
