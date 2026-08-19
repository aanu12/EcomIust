import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import BannerCarousel from '../components/BannerCarousel';
import CategoryList from '../components/CategoryList';
import FeaturedProducts from '../components/FeaturedProducts';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { API_URL } = useContext(AuthContext);

  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [bannerError, setBannerError] = useState(null);

  const [activeCategories, setActiveCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    // 1. Fetch Real Banners
    setLoadingBanners(true);
    fetch(`${API_URL}/banners`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setBanners(Array.isArray(data.data) ? data.data : []);
        } else {
          setBannerError(data.message || 'Failed to load banners.');
        }
      })
      .catch((err) => {
        console.error('Error fetching banners:', err);
        setBannerError('Network error fetching banners.');
      })
      .finally(() => setLoadingBanners(false));

    // 2. Fetch Active Categories
    setLoadingCategories(true);
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setActiveCategories(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch((err) => console.error('Error fetching categories:', err))
      .finally(() => setLoadingCategories(false));

    // 3. Fetch Featured Products
    setLoadingProducts(true);
    fetch(`${API_URL}/products/featured`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setFeaturedProducts(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch((err) => console.error('Error fetching featured products:', err))
      .finally(() => setLoadingProducts(false));
  }, [API_URL]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden'
      }}
    >
      <Navbar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
        <BannerCarousel banners={banners} loading={loadingBanners} error={bannerError} />
        <CategoryList categories={activeCategories} loading={loadingCategories} />
        <FeaturedProducts products={featuredProducts} loading={loadingProducts} />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
