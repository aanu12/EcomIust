import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const BannerCarousel = ({ banners: initialBanners, loading: initialLoading, error: initialError }) => {
  const { API_URL } = useContext(AuthContext);

  const [banners, setBanners] = useState(initialBanners || []);
  const [loading, setLoading] = useState(initialLoading !== undefined ? initialLoading : !initialBanners);
  const [error, setError] = useState(initialError || null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Touch Swipe State
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (initialBanners !== undefined) setBanners(initialBanners);
    if (initialLoading !== undefined) setLoading(initialLoading);
    if (initialError !== undefined) setError(initialError);
  }, [initialBanners, initialLoading, initialError]);

  useEffect(() => {
    if (initialBanners === undefined && API_URL) {
      setLoading(true);
      fetch(`${API_URL}/banners`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success') {
            setBanners(Array.isArray(data.data) ? data.data : []);
          } else {
            setError(data.message || 'Failed to load banners.');
          }
        })
        .catch((err) => {
          console.error('BannerCarousel fetch error:', err);
          setError('Network error fetching banners.');
        })
        .finally(() => setLoading(false));
    }
  }, [API_URL, initialBanners]);

  const handleNext = useCallback(() => {
    if (!banners || banners.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  }, [banners]);

  const handlePrev = useCallback(() => {
    if (!banners || banners.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  }, [banners]);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [banners, handleNext]);

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '1280px', margin: '1rem auto 0 auto', padding: '0 1rem', boxSizing: 'border-box' }}>
        <div
          style={{
            width: '100%',
            aspectRatio: isMobile ? '1080 / 1350' : '1920 / 600',
            maxHeight: isMobile ? '460px' : '520px',
            borderRadius: '20px',
            backgroundColor: '#f2f2f7',
            border: '1px solid #e5e5ea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8e8e93',
            fontSize: '0.875rem'
          }}
        >
          Loading campus banners...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100%', maxWidth: '1280px', margin: '1rem auto 0 auto', padding: '0 1rem', boxSizing: 'border-box' }}>
        <div style={{ padding: '1rem', borderRadius: '16px', backgroundColor: '#ffe5e5', border: '1px solid #ff3b30', color: '#b91c1c', fontSize: '0.875rem' }}>
          ⚠️ Error loading banners: {error}
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  // Cloudinary image resolution: 1080x1350 (4:5) mobile ratio vs 1920x600 (3.2:1) desktop ratio
  const activeImageUrl = isMobile
    ? (currentBanner.mobileImage?.url || currentBanner.desktopImage?.url)
    : (currentBanner.desktopImage?.url || currentBanner.mobileImage?.url);

  return (
    <div style={{ width: '100%', maxWidth: '1280px', margin: '1rem auto 0 auto', padding: isMobile ? '0 1rem' : '0 1.5rem', boxSizing: 'border-box' }}>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: isMobile ? '1080 / 1350' : '1920 / 600',
          maxHeight: isMobile ? '460px' : '520px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          backgroundColor: '#000000'
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {currentBanner.linkUrl ? (
            <a href={currentBanner.linkUrl} target="_blank" rel="noreferrer">
              <img
                src={activeImageUrl}
                alt={currentBanner.title || 'Campus Banner'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'all 0.5s ease' }}
              />
            </a>
          ) : (
            <img
              src={activeImageUrl}
              alt={currentBanner.title || 'Campus Banner'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'all 0.5s ease' }}
            />
          )}

          {(currentBanner.title || currentBanner.subtitle) && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0) 100%)',
                padding: isMobile ? '1.25rem 1rem' : '2rem',
                color: '#ffffff'
              }}
            >
              {currentBanner.title && (
                <h2 style={{ margin: 0, fontSize: isMobile ? '1.125rem' : '1.75rem', fontWeight: 800, lineHeight: 1.2 }}>
                  {currentBanner.title}
                </h2>
              )}
              {currentBanner.subtitle && (
                <p style={{ margin: '0.25rem 0 0 0', fontSize: isMobile ? '0.8125rem' : '0.9375rem', color: '#e5e5ea' }}>
                  {currentBanner.subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {banners.length > 1 && (
          <>
            {!isMobile && (
              <>
                <button onClick={handlePrev} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.9)', color: '#000000', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.25rem', fontWeight: 700, cursor: 'pointer', zIndex: 10 }}>‹</button>
                <button onClick={handleNext} style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.9)', color: '#000000', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.25rem', fontWeight: 700, cursor: 'pointer', zIndex: 10 }}>›</button>
              </>
            )}

            {/* Indicator Dots */}
            <div style={{ position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.375rem', zIndex: 10 }}>
              {banners.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentIndex(idx)} style={{ width: currentIndex === idx ? '20px' : '6px', height: '6px', borderRadius: '3px', backgroundColor: currentIndex === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.25s ease' }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BannerCarousel;
