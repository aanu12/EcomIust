import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import IdViewerModal from '../components/IdViewerModal';
import PasswordModal from '../components/PasswordModal';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import ProductModal from '../components/ProductModal';

const AdminDashboard = () => {
  const { token, logoutUser, API_URL } = useContext(AuthContext);

  // Active Admin Tab: 'verifications', 'users', 'products', 'orders', 'meetpoints', 'settlements', 'categories', 'banners', 'settings'
  const [activeTab, setActiveTab] = useState('verifications');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 1. Verification & User State ---
  const [users, setUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState(null);

  // Modals state
  const [selectedIdImage, setSelectedIdImage] = useState(null);
  const [passwordModalData, setPasswordModalData] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // --- 2. Category State ---
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', order: 0, isActive: true });
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);

  // --- 3. Product State ---
  const [adminProducts, setAdminProducts] = useState([]);
  const [productFilter, setProductFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'admin'
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);

  // Admin Product Creation & Editing Form State
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingAdminProduct, setEditingAdminProduct] = useState(null);
  const [adminProductForm, setAdminProductForm] = useState({
    name: '',
    price: '',
    description: '',
    condition: 'New',
    category: '',
    isFeatured: false,
    specifications: [{ key: '', value: '' }]
  });
  const [adminProductFiles, setAdminProductFiles] = useState([]);
  const [adminProductPreviews, setAdminProductPreviews] = useState([]);
  const [savingAdminProduct, setSavingAdminProduct] = useState(false);

  // --- 4. Order State ---
  const [adminOrders, setAdminOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // --- 5. Meetpoints State ---
  const [meetpoints, setMeetpoints] = useState([]);
  const [loadingMeetpoints, setLoadingMeetpoints] = useState(false);
  const [meetpointError, setMeetpointError] = useState(null);
  const [meetpointForm, setMeetpointForm] = useState({ name: '', landmark: '', instructions: '', isActive: true });
  const [editingMeetpoint, setEditingMeetpoint] = useState(null);

  // --- 6. Settlements State ---
  const [settlements, setSettlements] = useState([]);
  const [loadingSettlements, setLoadingSettlements] = useState(false);
  const [settlementError, setSettlementError] = useState(null);

  // --- 7. Banners State ---
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [bannerError, setBannerError] = useState(null);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', linkUrl: '', order: 0, isActive: true });
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(null);
  const [desktopDimensionInfo, setDesktopDimensionInfo] = useState(null);
  const [mobileDimensionInfo, setMobileDimensionInfo] = useState(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // --- 8. Footer Settings State ---
  const [settingsForm, setSettingsForm] = useState({ siteName: 'IUST Ecom', siteDescription: '', contactEmail: '', contactPhone: '', address: '' });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState(null);

  // Data Fetching Functions with Independent Failure Protection
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUserError(null);
    try {
      const url = filterStatus === 'all' ? `${API_URL}/admin/users` : `${API_URL}/admin/users?status=${filterStatus}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setUsers(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || 'Failed to fetch users.');
      }
    } catch (err) {
      setUserError(err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [API_URL, filterStatus, token]);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCategoryError(null);
    try {
      const res = await fetch(`${API_URL}/categories/admin`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const catList = Array.isArray(data.data) ? data.data : [];
        setCategories(catList);
        if (catList.length > 0 && !adminProductForm.category) {
          setAdminProductForm((prev) => ({ ...prev, category: catList[0]._id }));
        }
      } else {
        throw new Error(data.message || 'Failed to fetch categories.');
      }
    } catch (err) {
      setCategoryError(err.message);
    } finally {
      setLoadingCategories(false);
    }
  }, [API_URL, token, adminProductForm.category]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductError(null);
    try {
      const res = await fetch(`${API_URL}/products/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAdminProducts(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || 'Failed to fetch products.');
      }
    } catch (err) {
      setProductError(err.message);
    } finally {
      setLoadingProducts(false);
    }
  }, [API_URL, token]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    setOrderError(null);
    try {
      const res = await fetch(`${API_URL}/orders/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAdminOrders(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || 'Failed to fetch orders.');
      }
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setLoadingOrders(false);
    }
  }, [API_URL, token]);

  const fetchMeetpoints = useCallback(async () => {
    setLoadingMeetpoints(true);
    setMeetpointError(null);
    try {
      const res = await fetch(`${API_URL}/meetpoints/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setMeetpoints(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || 'Failed to fetch meetpoints.');
      }
    } catch (err) {
      setMeetpointError(err.message);
    } finally {
      setLoadingMeetpoints(false);
    }
  }, [API_URL, token]);

  const fetchSettlements = useCallback(async () => {
    setLoadingSettlements(true);
    setSettlementError(null);
    try {
      const res = await fetch(`${API_URL}/settlements/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSettlements(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || 'Failed to fetch settlements.');
      }
    } catch (err) {
      setSettlementError(err.message);
    } finally {
      setLoadingSettlements(false);
    }
  }, [API_URL, token]);

  const fetchBanners = useCallback(async () => {
    setLoadingBanners(true);
    setBannerError(null);
    try {
      const res = await fetch(`${API_URL}/banners/admin`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setBanners(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || 'Failed to fetch banners.');
      }
    } catch (err) {
      setBannerError(err.message);
    } finally {
      setLoadingBanners(false);
    }
  }, [API_URL, token]);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch(`${API_URL}/settings`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSettingsForm({
          siteName: data.data.siteName || 'IUST Ecom',
          siteDescription: data.data.siteDescription || '',
          contactEmail: data.data.contactEmail || '',
          contactPhone: data.data.contactPhone || '',
          address: data.data.address || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (activeTab === 'verifications' || activeTab === 'users') fetchUsers();
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'products') { fetchCategories(); fetchProducts(); }
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'meetpoints') fetchMeetpoints();
    if (activeTab === 'settlements') fetchSettlements();
    if (activeTab === 'banners') fetchBanners();
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab, fetchUsers, fetchCategories, fetchProducts, fetchOrders, fetchMeetpoints, fetchSettlements, fetchBanners, fetchSettings]);

  // --- Student Verification Handlers ---
  const handleApprove = async (user) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${user._id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Approval failed.');
      setPasswordModalData({ user: data.data, password: data.generatedPassword });
      fetchUsers();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleReject = async (user) => {
    if (!window.confirm(`Reject student ${user.name}? This will delete their uploaded ID document from Cloudinary.`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${user._id}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Rejection failed.');
      fetchUsers();
    } catch (err) {
      alert(`Rejection error: ${err.message}`);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently delete user ${user.name}? This will remove their record from MongoDB and delete any associated ID card asset from Cloudinary.`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${user._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to delete user.');
      fetchUsers();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleSaveEditUser = async (userId, updatedDetails) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedDetails)
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to update user details.');
    fetchUsers();
  };

  const handleCreateUser = async (userPayload) => {
    const res = await fetch(`${API_URL}/admin/users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(userPayload)
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to create user.');
    setPasswordModalData({ user: data.data, password: data.generatedPassword });
    fetchUsers();
  };

  const handleSendEmailCredentials = async (userId, password) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to send credentials email.');
    return data;
  };

  // --- Category Handlers ---
  const handleStartEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || '',
      order: category.order || 0,
      isActive: category.isActive !== undefined ? category.isActive : true
    });
    setCategoryImageFile(null);
    setCategoryImagePreview(category.image?.url || null);
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', order: 0, isActive: true });
    setCategoryImageFile(null);
    setCategoryImagePreview(null);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return alert('Category Name is required.');
    if (!editingCategory && !categoryImageFile) return alert('Category Image is required.');

    setSavingCategory(true);
    try {
      const data = new FormData();
      data.append('name', categoryForm.name.trim());
      data.append('order', categoryForm.order);
      data.append('isActive', categoryForm.isActive);
      if (categoryImageFile) data.append('image', categoryImageFile);

      const isUpdate = !!editingCategory;
      const url = isUpdate ? `${API_URL}/categories/${editingCategory._id}` : `${API_URL}/categories`;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: data });
      const result = await res.json();
      if (!res.ok || result.status !== 'success') throw new Error(result.message || 'Failed to save category.');

      handleCancelCategoryEdit();
      fetchCategories();
      alert(isUpdate ? 'Category updated successfully!' : 'Category created successfully!');
    } catch (err) {
      alert(`Category save error: ${err.message}`);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Permanently delete category "${category.name}"? This deletes the Mongoose document and purges its image from Cloudinary.`)) return;
    try {
      const res = await fetch(`${API_URL}/categories/${category._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to delete category.');
      fetchCategories();
    } catch (err) { alert(`Delete error: ${err.message}`); }
  };

  // --- Product Management Handlers ---
  const handleApproveProduct = async (product) => {
    try {
      const res = await fetch(`${API_URL}/products/admin/${product._id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchProducts();
    } catch (err) { alert(err.message); }
  };

  const handleRejectProduct = async (product) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      const res = await fetch(`${API_URL}/products/admin/${product._id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason })
      });
      if (res.ok) fetchProducts();
    } catch (err) { alert(err.message); }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const res = await fetch(`${API_URL}/products/admin/${product._id}/featured`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchProducts();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Permanently delete product "${product.name}"? This will purge all associated Cloudinary images.`)) return;
    try {
      const res = await fetch(`${API_URL}/products/admin/${product._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchProducts();
    } catch (err) { alert(err.message); }
  };

  const handleCreateAdminProduct = async (e) => {
    e.preventDefault();
    if (!adminProductForm.name.trim() || !adminProductForm.price || !adminProductForm.description.trim() || !adminProductForm.category) {
      return alert('Please fill in Name, Price, Description, and Category.');
    }
    if (adminProductFiles.length === 0) {
      return alert('Please select at least one product image.');
    }

    setSavingAdminProduct(true);
    try {
      const data = new FormData();
      data.append('name', adminProductForm.name.trim());
      data.append('price', adminProductForm.price);
      data.append('description', adminProductForm.description.trim());
      data.append('condition', adminProductForm.condition);
      data.append('category', adminProductForm.category);
      data.append('isFeatured', adminProductForm.isFeatured);

      const validSpecs = adminProductForm.specifications.filter((s) => s.key.trim() && s.value.trim());
      data.append('specifications', JSON.stringify(validSpecs));

      adminProductFiles.forEach((file) => data.append('images', file));

      const res = await fetch(`${API_URL}/products/admin/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });

      const result = await res.json();
      if (!res.ok || result.status !== 'success') throw new Error(result.message || 'Failed to create admin product.');

      alert('Admin Assured Product created successfully! It is automatically approved with green Assured badge.');
      setIsCreatingProduct(false);
      setAdminProductFiles([]);
      setAdminProductPreviews([]);
      fetchProducts();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSavingAdminProduct(false);
    }
  };

  // --- Meetpoint Handlers ---
  const handleSaveMeetpoint = async (e) => {
    e.preventDefault();
    if (!meetpointForm.name.trim() || !meetpointForm.landmark.trim()) return alert('Name and landmark are required.');
    try {
      const isUpdate = !!editingMeetpoint;
      const url = isUpdate ? `${API_URL}/meetpoints/admin/${editingMeetpoint._id}` : `${API_URL}/meetpoints/admin/create`;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(meetpointForm)
      });
      if (res.ok) {
        setMeetpointForm({ name: '', landmark: '', instructions: '', isActive: true });
        setEditingMeetpoint(null);
        fetchMeetpoints();
      }
    } catch (err) { alert(err.message); }
  };

  const handleDeleteMeetpoint = async (mpId) => {
    if (!window.confirm('Delete / deactivate this meetpoint?')) return;
    try {
      const res = await fetch(`${API_URL}/meetpoints/admin/${mpId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchMeetpoints();
    } catch (err) { alert(err.message); }
  };

  // --- Settlement Transfer Handler ---
  const handleTransferSettlement = async (settlement) => {
    const ref = prompt('Enter payout transfer reference / UTR Number:');
    if (!ref) return;
    try {
      const res = await fetch(`${API_URL}/settlements/admin/${settlement._id}/transfer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payoutReference: ref })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        alert('Settlement transferred! Seller wallet debited for payout and notification email dispatched.');
        fetchSettlements();
      } else {
        alert(data.message || 'Transfer failed.');
      }
    } catch (err) { alert(err.message); }
  };

  // --- Banner Handlers ---
  const handleBannerUpload = async (e) => {
    e.preventDefault();
    if (!desktopFile || !mobileFile) return alert('Please select Desktop (1920x600) and Mobile (1080x1350) images.');

    setUploadingBanner(true);
    try {
      const data = new FormData();
      data.append('title', bannerForm.title);
      data.append('subtitle', bannerForm.subtitle);
      data.append('linkUrl', bannerForm.linkUrl);
      data.append('order', bannerForm.order);
      data.append('isActive', bannerForm.isActive);
      data.append('desktopImage', desktopFile);
      data.append('mobileImage', mobileFile);

      const res = await fetch(`${API_URL}/banners`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
      const result = await res.json();
      if (!res.ok || result.status !== 'success') throw new Error(result.message || 'Upload failed.');

      setBannerForm({ title: '', subtitle: '', linkUrl: '', order: 0, isActive: true });
      setDesktopFile(null); setMobileFile(null); setDesktopPreview(null); setMobilePreview(null);
      fetchBanners();
      alert('Banner uploaded!');
    } catch (err) { alert(err.message); } finally { setUploadingBanner(false); }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm('Delete this banner and its Cloudinary assets?')) return;
    try {
      const res = await fetch(`${API_URL}/banners/${bannerId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchBanners();
    } catch (err) { alert(err.message); }
  };

  // --- Settings Handlers ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to save settings.');
      setSettingsMessage({ success: true, text: 'Footer settings updated!' });
    } catch (err) { setSettingsMessage({ success: false, text: err.message }); } finally { setSavingSettings(false); }
  };

  // Safely Filter Products
  const safeProducts = Array.isArray(adminProducts) ? adminProducts : [];
  const filteredProducts = safeProducts.filter((p) => {
    if (productFilter === 'pending') return p.status === 'pending';
    if (productFilter === 'approved') return p.status === 'approved';
    if (productFilter === 'rejected') return p.status === 'rejected';
    if (productFilter === 'admin') return p.isAdminProduct === true;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: isMobile ? '0.875rem 1rem' : '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="IUST Ecom Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              IUST Ecom Admin
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Control Center</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a href="/" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', padding: '0.4rem 0.875rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none' }}>Site</a>
          <button onClick={logoutUser} style={{ backgroundColor: '#ffffff', color: '#ef4444', border: '1px solid #fca5a5', padding: '0.4rem 0.875rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </header>

      {/* Main Container & Tab Navigation */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '1rem' : '2rem 1.5rem' }}>
        <div style={{ display: 'flex', backgroundColor: '#ffffff', padding: '0.375rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', overflowX: 'auto', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'verifications', label: '🪪 Verifications' },
            { id: 'users', label: '👤 Users' },
            { id: 'products', label: '📦 Products' },
            { id: 'orders', label: '🛍️ Orders' },
            { id: 'meetpoints', label: '📍 Meetpoints' },
            { id: 'settlements', label: '💰 Settlements' },
            { id: 'categories', label: '📁 Categories' },
            { id: 'banners', label: '🖼️ Banners' },
            { id: 'settings', label: '⚙️ Footer' }
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: '0.625rem 0.875rem', borderRadius: '10px', border: 'none', fontSize: '0.8125rem', fontWeight: activeTab === t.id ? 700 : 500, cursor: 'pointer', backgroundColor: activeTab === t.id ? '#0f172a' : 'transparent', color: activeTab === t.id ? '#ffffff' : '#475569', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: STUDENT VERIFICATION */}
        {activeTab === 'verifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.375rem', backgroundColor: '#ffffff', padding: '0.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button key={status} onClick={() => setFilterStatus(status)} style={{ padding: '0.45rem 0.875rem', borderRadius: '8px', border: 'none', fontSize: '0.8125rem', fontWeight: filterStatus === status ? 700 : 500, cursor: 'pointer', backgroundColor: filterStatus === status ? '#f1f5f9' : 'transparent', color: filterStatus === status ? '#0f172a' : '#64748b', textTransform: 'capitalize' }}>
                    {status}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsCreateModalOpen(true)} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.625rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                + Manually Create User
              </button>
            </div>

            {loadingUsers ? <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>Loading verification records...</div> : userError ? <div style={{ padding: '1rem', backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '8px' }}>⚠️ Error: {userError}</div> : users.length === 0 ? <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#ffffff', borderRadius: '16px', color: '#64748b' }}>No student verification records found.</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {users.map((u) => (
                  <div key={u._id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{u.name} ({u.course})</div>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>{u.email} | Status: <strong>{u.status}</strong></span>
                    </div>
                    {u.idCard?.url && (
                      <div onClick={() => setSelectedIdImage({ url: u.idCard.url, name: u.name, course: u.course })} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', backgroundColor: '#f1f5f9', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
                        <img src={u.idCard.url} alt="ID Document" style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>Inspect ID 🔍</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {u.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(u)} style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>Approve</button>
                          <button onClick={() => handleReject(u)} style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>Reject</button>
                        </>
                      )}
                      <button onClick={() => setEditingUser(u)} style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDeleteUser(u)} style={{ backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', borderRadius: '6px', padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>All Registered Users ({users.length})</h3>
              <button onClick={() => setIsCreateModalOpen(true)} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.625rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                + Create User
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {users.map((u) => (
                <div key={u._id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{u.name} ({u.role})</div>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>{u.email} | Course: {u.course}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setEditingUser(u)} style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDeleteUser(u)} style={{ backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.375rem', backgroundColor: '#ffffff', padding: '0.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                {[
                  { id: 'pending', label: '⏳ Pending Review' },
                  { id: 'approved', label: '✅ Approved' },
                  { id: 'rejected', label: '❌ Rejected' },
                  { id: 'admin', label: '🛡️ Admin Assured' }
                ].map((t) => (
                  <button key={t.id} onClick={() => setProductFilter(t.id)} style={{ padding: '0.45rem 0.875rem', borderRadius: '8px', border: 'none', fontSize: '0.8125rem', fontWeight: productFilter === t.id ? 700 : 500, cursor: 'pointer', backgroundColor: productFilter === t.id ? '#0f172a' : 'transparent', color: productFilter === t.id ? '#ffffff' : '#64748b' }}>
                    {t.label}
                  </button>
                ))}
              </div>
              <button onClick={() => { setEditingAdminProduct(null); setIsCreatingProduct(true); }} style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                + Create Admin Assured Product
              </button>
            </div>

            {loadingProducts ? <div>Loading products...</div> : filteredProducts.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', color: '#64748b' }}>No products found.</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredProducts.map((p) => (
                  <div key={p._id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={p.images && p.images.length > 0 ? p.images[0].url : 'https://via.placeholder.com/100'} alt={p.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{p.name}</h4>
                          {p.isAdminProduct && <span style={{ backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 800 }}>🛡️ Assured</span>}
                          {p.isFeatured && <span style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700 }}>⭐ Featured</span>}
                        </div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>₹{p.price?.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Seller: {p.seller?.name || 'Admin'} | Status: <strong>{p.status}</strong></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button onClick={() => setEditingAdminProduct(p)} style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>Edit</button>
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => handleApproveProduct(p)} style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.8125rem' }}>Approve</button>
                          <button onClick={() => handleRejectProduct(p)} style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.8125rem' }}>Reject</button>
                        </>
                      )}
                      {p.status === 'approved' && (
                        <button onClick={() => handleToggleFeatured(p)} style={{ backgroundColor: p.isFeatured ? '#fffbeb' : '#ffffff', color: p.isFeatured ? '#b45309' : '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.8125rem' }}>
                          {p.isFeatured ? '⭐ Unfeature' : '⭐ Feature'}
                        </button>
                      )}
                      <button onClick={() => handleDeleteProduct(p)} style={{ backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', borderRadius: '6px', padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.8125rem' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <ProductModal
              isOpen={isCreatingProduct || !!editingAdminProduct}
              product={editingAdminProduct}
              categories={categories}
              isAdmin={true}
              onClose={() => { setIsCreatingProduct(false); setEditingAdminProduct(null); }}
              onSuccess={() => { setIsCreatingProduct(false); setEditingAdminProduct(null); fetchProducts(); }}
            />
          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === 'orders' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>All Campus Orders ({adminOrders.length})</h3>
            {loadingOrders ? <div>Loading orders...</div> : orderError ? <div style={{ color: '#c53030' }}>⚠️ Error: {orderError}</div> : adminOrders.length === 0 ? <div style={{ color: '#64748b' }}>No orders placed yet.</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {adminOrders.map((o) => (
                  <div key={o._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Order #{o.orderNumber} - Buyer: {o.buyer?.name}</span>
                      <span style={{ color: '#16a34a' }}>₹{o.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px' }}>
                      Meetpoint: 📍 {o.meetpoint?.name} ({o.meetpoint?.landmark}) | Payment: {o.paymentStatus}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MEETPOINTS */}
        {activeTab === 'meetpoints' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
                {editingMeetpoint ? 'Edit Meetpoint Location' : 'Create New Campus Pickup Meetpoint'}
              </h3>
              <form onSubmit={handleSaveMeetpoint} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <input type="text" placeholder="Meetpoint Name *" value={meetpointForm.name} onChange={(e) => setMeetpointForm({ ...meetpointForm, name: e.target.value })} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <input type="text" placeholder="Landmark *" value={meetpointForm.landmark} onChange={(e) => setMeetpointForm({ ...meetpointForm, landmark: e.target.value })} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <input type="text" placeholder="Instructions (Optional)" value={meetpointForm.instructions} onChange={(e) => setMeetpointForm({ ...meetpointForm, instructions: e.target.value })} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <button type="submit" style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.75rem', fontWeight: 600 }}>Save Meetpoint</button>
              </form>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Configured Campus Meetpoints ({meetpoints.length})</h3>
              {loadingMeetpoints ? <div>Loading meetpoints...</div> : meetpoints.length === 0 ? <div style={{ color: '#64748b' }}>No meetpoints configured.</div> : (
                meetpoints.map((mp) => (
                  <div key={mp._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>📍 {mp.name}</div>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Landmark: {mp.landmark}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: mp.isActive ? '#f0fdf4' : '#f1f5f9', color: mp.isActive ? '#15803d' : '#64748b' }}>
                        {mp.isActive ? 'Active' : 'Disabled'}
                      </span>
                      <button onClick={() => handleDeleteMeetpoint(mp._id)} style={{ backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', borderRadius: '6px', padding: '0.35rem 0.625rem', fontWeight: 600, fontSize: '0.75rem' }}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: SETTLEMENTS */}
        {activeTab === 'settlements' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Seller Payout Settlements ({settlements.length})</h3>
            {loadingSettlements ? <div>Loading settlements...</div> : settlementError ? <div style={{ color: '#c53030' }}>⚠️ Error: {settlementError}</div> : settlements.length === 0 ? <div style={{ color: '#64748b' }}>No pending settlements.</div> : (
              settlements.map((s) => (
                <div key={s._id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem', backgroundColor: s.status === 'transferred' ? '#f8fafc' : '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Seller: {s.seller?.name} ({s.seller?.email})</div>
                      <div style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>Amount Due: ₹{s.amountDue?.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Order: #{s.order?.orderNumber} | Product: {s.product?.name}</div>
                    </div>
                    <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8125rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>Payout Destination:</div>
                      {s.paymentDetailsSnapshot?.upiId && <div><strong>UPI ID:</strong> {s.paymentDetailsSnapshot.upiId}</div>}
                      {s.paymentDetailsSnapshot?.accountNumber && <div><strong>Bank:</strong> {s.paymentDetailsSnapshot.accountNumber} ({s.paymentDetailsSnapshot.ifscCode})</div>}
                    </div>
                    <div>
                      {s.status === 'pending' ? (
                        <button onClick={() => handleTransferSettlement(s)} style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.625rem 1.25rem', fontWeight: 700, cursor: 'pointer' }}>
                          Mark Transferred 💰
                        </button>
                      ) : (
                        <span style={{ padding: '0.375rem 0.875rem', backgroundColor: '#f0fdf4', color: '#15803d', borderRadius: '9999px', fontWeight: 800, fontSize: '0.8125rem' }}>
                          ✓ Transferred on {new Date(s.transferredAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 7: CATEGORIES */}
        {activeTab === 'categories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}</h3>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Cloudinary Folder: <code>EcomIust/categories</code></span>
                </div>
                {editingCategory && <button onClick={handleCancelCategoryEdit} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600 }}>Cancel Edit</button>}
              </div>
              <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <input type="text" placeholder="Category Name *" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <input type="number" placeholder="Display Order" value={categoryForm.order} onChange={(e) => setCategoryForm({ ...categoryForm, order: e.target.value })} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 700 }}>🖼️ Category Image (Recommended: 512 × 512 px 1:1 Square) *</label>
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setCategoryImageFile(f); setCategoryImagePreview(URL.createObjectURL(f)); } }} style={{ width: '100%', marginTop: '0.5rem' }} />
                  {categoryImagePreview && <img src={categoryImagePreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', marginTop: '0.75rem', border: '2px solid #2563eb' }} />}
                </div>
                <button type="submit" disabled={savingCategory} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: 600 }}>{savingCategory ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}</button>
              </form>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.25rem', fontWeight: 700 }}>All Categories ({categories.length})</h3>
              {loadingCategories ? <div>Loading categories...</div> : categoryError ? <div style={{ color: '#c53030' }}>⚠️ Error: {categoryError}</div> : categories.length === 0 ? <div style={{ color: '#64748b' }}>No categories created yet.</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {categories.map((cat) => (
                    <div key={cat._id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <img src={cat.image?.url} alt={cat.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>{cat.name}</div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Order: {cat.order}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button onClick={() => handleStartEditCategory(cat)} style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.35rem 0.6rem', fontWeight: 600, fontSize: '0.75rem' }}>Edit</button>
                        <button onClick={() => handleDeleteCategory(cat)} style={{ backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', borderRadius: '6px', padding: '0.35rem 0.6rem', fontWeight: 600, fontSize: '0.75rem' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: BANNERS */}
        {activeTab === 'banners' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Upload New Banner</h3>
              <form onSubmit={handleBannerUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <input type="text" placeholder="Banner Title" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <input type="text" placeholder="Subtitle" value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 700 }}>💻 Desktop (1920×600 px)</label>
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setDesktopFile(f); setDesktopPreview(URL.createObjectURL(f)); } }} style={{ width: '100%', marginTop: '0.5rem' }} />
                    {desktopPreview && <img src={desktopPreview} alt="Desktop Preview" style={{ width: '100%', height: '60px', objectFit: 'cover', marginTop: '0.5rem', borderRadius: '6px' }} />}
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 700 }}>📱 Mobile (1080×1350 px)</label>
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setMobileFile(f); setMobilePreview(URL.createObjectURL(f)); } }} style={{ width: '100%', marginTop: '0.5rem' }} />
                    {mobilePreview && <img src={mobilePreview} alt="Mobile Preview" style={{ width: '40px', height: '60px', objectFit: 'cover', marginTop: '0.5rem', borderRadius: '6px' }} />}
                  </div>
                </div>
                <button type="submit" disabled={uploadingBanner} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: 600 }}>{uploadingBanner ? 'Uploading...' : 'Upload Banner'}</button>
              </form>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Configured Banners ({banners.length})</h3>
              {loadingBanners ? <div>Loading banners...</div> : bannerError ? <div style={{ color: '#c53030' }}>⚠️ Error: {bannerError}</div> : banners.length === 0 ? <div style={{ color: '#64748b' }}>No banners uploaded.</div> : (
                banners.map((b) => (
                  <div key={b._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={b.desktopImage?.url} alt="Desktop" style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{b.title || 'Untitled Banner'}</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.subtitle}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteBanner(b._id)} style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>Delete</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 9: FOOTER & SITE SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Edit Footer & Site Settings</h3>
            {settingsMessage && <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: settingsMessage.success ? '#f0fdf4' : '#fff5f5', color: settingsMessage.success ? '#15803d' : '#c53030' }}>{settingsMessage.text}</div>}
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Brand Name</label>
                <input type="text" value={settingsForm.siteName} onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Description</label>
                <textarea rows={3} value={settingsForm.siteDescription} onChange={(e) => setSettingsForm({ ...settingsForm, siteDescription: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
              </div>
              <button type="submit" disabled={savingSettings} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.875rem 1.5rem', fontWeight: 600 }}>{savingSettings ? 'Saving...' : 'Save Footer Settings'}</button>
            </form>
          </div>
        )}
      </main>

      {/* Modals */}
      <IdViewerModal isOpen={!!selectedIdImage} imageUrl={selectedIdImage?.url} studentName={selectedIdImage?.name} studentCourse={selectedIdImage?.course} onClose={() => setSelectedIdImage(null)} />
      <PasswordModal isOpen={!!passwordModalData} user={passwordModalData?.user} password={passwordModalData?.password} onClose={() => setPasswordModalData(null)} onSendEmail={handleSendEmailCredentials} />
      <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreateSuccess={handleCreateUser} />
      <EditUserModal isOpen={!!editingUser} user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveEditUser} />
    </div>
  );
};

export default AdminDashboard;
