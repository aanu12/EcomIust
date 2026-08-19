import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Footer = () => {
  const { API_URL } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setSettings(data.data);
        }
      })
      .catch((err) => console.error('Failed to load site settings for footer:', err));
  }, [API_URL]);

  const siteName = settings?.siteName || 'IUST Ecom';
  const siteDescription = settings?.siteDescription || 'Official campus marketplace for IUST students.';
  const contactEmail = settings?.contactEmail || 'officialecommercestoreiust@gmail.com';
  const contactPhone = settings?.contactPhone || '+91 (1933) 247225';
  const address = settings?.address || 'Islamic University of Science & Technology, Awantipora';
  const socialLinks = settings?.socialLinks || {};
  const copyrightText = settings?.copyrightText || '© 2026 IUST Ecom. All rights reserved.';

  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '3rem 1.5rem 2rem 1.5rem',
        marginTop: 'auto',
        borderTop: '1px solid #1e293b'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}
      >
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <img src="/logo.png" alt="IUST Ecom Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {siteName}
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
            {siteDescription}
          </p>

          {/* Dynamic Social Links */}
          <div style={{ display: 'flex', gap: '0.875rem', marginTop: '1.25rem' }}>
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" style={{ color: '#e2e8f0', fontSize: '0.875rem', textDecoration: 'none' }}>
                Instagram
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer" style={{ color: '#e2e8f0', fontSize: '0.875rem', textDecoration: 'none' }}>
                Facebook
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer" style={{ color: '#e2e8f0', fontSize: '0.875rem', textDecoration: 'none' }}>
                Twitter/X
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" style={{ color: '#e2e8f0', fontSize: '0.875rem', textDecoration: 'none' }}>
                LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Navigation
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
            <li><Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Home</Link></li>
            <li><Link to="/cart" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Shopping Cart</Link></li>
            <li><Link to="/my-listings" style={{ color: '#cbd5e1', textDecoration: 'none' }}>My Listings</Link></li>
            <li><Link to="/profile" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Student Profile & Wallet</Link></li>
          </ul>
        </div>

        {/* Contact & Campus Location Column */}
        <div>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Campus Contact
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
            <div>📧 Email: <a href={`mailto:${contactEmail}`} style={{ color: '#38bdf8', textDecoration: 'none' }}>{contactEmail}</a></div>
            <div>📞 Helpline: {contactPhone}</div>
            <div>📍 Campus Address: {address}</div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', borderTop: '1px solid #1e293b', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: '#64748b' }}>
        {copyrightText}
      </div>
    </footer>
  );
};

export default Footer;
