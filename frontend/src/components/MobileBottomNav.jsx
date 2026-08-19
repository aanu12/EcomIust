import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MobileBottomNav = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) return null;

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/cart', label: 'Cart', icon: '🛒' },
    { path: '/my-listings', label: 'Listings', icon: '📦' },
    { path: '/orders', label: 'Orders', icon: '🛍️' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderTop: '1px solid #e5e5ea',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: '6px',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
        zIndex: 9999,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)'
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: isActive ? '#007aff' : '#8e8e93',
              flex: 1,
              padding: '4px 0',
              transition: 'color 0.15s ease'
            }}
          >
            <span style={{ fontSize: '1.25rem', marginBottom: '2px', transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.15s ease' }}>
              {item.icon}
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: isActive ? 700 : 500, letterSpacing: '-0.01em' }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
