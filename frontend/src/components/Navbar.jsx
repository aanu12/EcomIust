import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  MenuIcon,
  ShoppingBagIcon,
  HomeIcon,
  GridIcon,
  PackageIcon,
  UserIcon,
  ShieldCheckIcon,
  LogOutIcon,
  CloseIcon,
  ChevronRightIcon
} from './Icons';

const Navbar = () => {
  const { user, token, logoutUser, API_URL } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch Cart Count safely with AuthContext token
  useEffect(() => {
    if (!user || !token) {
      setCartCount(0);
      return;
    }

    fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && data.data?.items) {
          const totalQty = data.data.items.reduce((acc, item) => acc + item.quantity, 0);
          setCartCount(totalQty);
        }
      })
      .catch(() => {});
  }, [API_URL, user, token]);

  const handleNavClick = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <header
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e5e5ea',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: isMobile ? '0.625rem 1rem' : '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          {/* Mobile Left Menu Trigger */}
          {isMobile && (
            <button
              onClick={() => setIsMenuOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f2f2f7',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                color: '#007aff'
              }}
            >
              <MenuIcon size={22} color="#007aff" />
            </button>
          )}

          {/* Logo & Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <img
              src="/logo.png"
              alt="IUST Ecom Logo"
              style={{
                height: isMobile ? '36px' : '48px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                IUST Ecom
              </span>
              {!isMobile && (
                <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Campus Marketplace
                </span>
              )}
            </div>
          </Link>

          {/* Mobile Right Cart Action */}
          {isMobile ? (
            <button
              onClick={() => navigate('/cart')}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f2f2f7',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer'
              }}
            >
              <ShoppingBagIcon size={20} color="#0f172a" />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: '#ff3b30',
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    borderRadius: '9999px',
                    padding: '0.15rem 0.35rem',
                    lineHeight: 1
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          ) : (
            /* Desktop Navigation */
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/" style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', textDecoration: 'none', padding: '0.4rem 0.875rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                Home
              </Link>
              <button onClick={() => navigate('/my-listings')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', padding: '0.45rem 0.875rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                📦 My Listings
              </button>
              <button onClick={() => navigate('/cart')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', padding: '0.45rem 0.875rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                <ShoppingBagIcon size={18} color="#475569" />
                <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
              </button>

              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.45rem 0.875rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', border: '1px solid #e2e8f0', textDecoration: 'none' }}>
                    <UserIcon size={18} color="#2563eb" />
                    <span>{user.name}</span>
                  </Link>
                  {user.role === 'admin' && (
                    <button onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.5rem 0.875rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                      <ShieldCheckIcon size={16} color="#ffffff" />
                      <span>Admin</span>
                    </button>
                  )}
                  <button onClick={logoutUser} style={{ backgroundColor: '#ffffff', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.45rem 0.875rem', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Link to="/login" style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.45rem 0.875rem', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
                  <Link to="/register" style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.45rem 0.875rem', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* iOS-Style Side Sheet / Drawer Navigation Menu */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex' }}>
          {/* Backdrop Overlay */}
          <div onClick={() => setIsMenuOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />

          {/* iOS Side Sheet */}
          <div
            style={{
              position: 'relative',
              width: '80%',
              maxWidth: '320px',
              height: '100%',
              backgroundColor: '#f2f2f7',
              boxShadow: '4px 0 25px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10001,
              animation: 'slideInLeft 0.25s ease-out'
            }}
          >
            {/* Sheet Header */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1rem', borderBottom: '1px solid #e5e5ea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <img src="/logo.png" alt="Logo" style={{ height: '36px' }} />
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#000000' }}>IUST Ecom</div>
                  <span style={{ fontSize: '0.6875rem', color: '#8e8e93' }}>Campus Marketplace</span>
                </div>
              </div>
              <button onClick={() => setIsMenuOpen(false)} style={{ border: 'none', background: '#e5e5ea', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <CloseIcon size={18} color="#8e8e93" />
              </button>
            </div>

            {/* User Avatar Section */}
            {user ? (
              <div style={{ backgroundColor: '#ffffff', margin: '1rem', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#007aff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.125rem' }}>
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#000000' }}>{user.name}</div>
                  <span style={{ fontSize: '0.75rem', color: '#8e8e93' }}>{user.course}</span>
                </div>
              </div>
            ) : (
              <div style={{ margin: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleNavClick('/login')} style={{ flex: 1, backgroundColor: '#ffffff', color: '#007aff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.625rem', fontWeight: 600, fontSize: '0.875rem' }}>Sign In</button>
                <button onClick={() => handleNavClick('/register')} style={{ flex: 1, backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.625rem', fontWeight: 600, fontSize: '0.875rem' }}>Register</button>
              </div>
            )}

            {/* Grouped iOS Menu List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem' }}>
                {[
                  { label: 'Home', icon: <HomeIcon size={20} color="#007aff" />, path: '/' },
                  { label: 'Categories', icon: <GridIcon size={20} color="#34c759" />, path: '/#categories' },
                  { label: 'Shopping Cart', icon: <ShoppingBagIcon size={20} color="#ff9500" />, path: '/cart' },
                  { label: 'My Listings', icon: <PackageIcon size={20} color="#af52de" />, path: '/my-listings' },
                  { label: 'Purchase Orders', icon: <PackageIcon size={20} color="#5856d6" />, path: '/orders' },
                  { label: 'Profile & Wallet', icon: <UserIcon size={20} color="#007aff" />, path: '/profile' }
                ].map((item, idx, arr) => (
                  <div
                    key={item.label}
                    onClick={() => handleNavClick(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.875rem 1rem',
                      cursor: 'pointer',
                      borderBottom: idx < arr.length - 1 ? '1px solid #e5e5ea' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.icon}
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#000000' }}>{item.label}</span>
                    </div>
                    <ChevronRightIcon size={18} color="#c7c7cc" />
                  </div>
                ))}
              </div>

              {/* Admin Dashboard Option */}
              {user && user.role === 'admin' && (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div
                    onClick={() => handleNavClick('/admin')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <ShieldCheckIcon size={20} color="#15803d" />
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#15803d' }}>Admin Dashboard</span>
                    </div>
                    <ChevronRightIcon size={18} color="#c7c7cc" />
                  </div>
                </div>
              )}

              {/* Logout Row */}
              {user && (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div
                    onClick={() => { setIsMenuOpen(false); logoutUser(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', cursor: 'pointer', color: '#ff3b30' }}
                  >
                    <LogOutIcon size={20} color="#ff3b30" />
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Sign Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
