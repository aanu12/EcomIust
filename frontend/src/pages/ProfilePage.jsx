import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';

const ProfilePage = () => {
  const { token, API_URL, user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal / Sheet States
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Forms State
  const [paymentForm, setPaymentForm] = useState({ upiId: '', bankAccountName: '', accountNumber: '', ifscCode: '' });
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState(null);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/profile`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setProfileData(data.data);
        const pDetails = data.data.paymentDetails || {};
        setPaymentForm({
          upiId: pDetails.upiId || '',
          bankAccountName: pDetails.bankAccountName || '',
          accountNumber: pDetails.accountNumber || '',
          ifscCode: pDetails.ifscCode || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSavePaymentDetails = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    setPaymentMsg(null);
    try {
      const res = await fetch(`${API_URL}/profile/payment-details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(paymentForm)
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to save payout info.');
      setPaymentMsg({ success: true, text: 'Payout info updated!' });
      fetchProfile();
      setTimeout(() => setShowPayoutModal(false), 1500);
    } catch (err) {
      setPaymentMsg({ success: false, text: err.message });
    } finally {
      setSavingPayment(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ success: false, text: 'New passwords do not match.' });
      return;
    }
    setChangingPassword(true);
    setPasswordMsg(null);
    try {
      const res = await fetch(`${API_URL}/profile/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(passwordForm)
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to update password.');
      setPasswordMsg({ success: true, text: 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err) {
      setPasswordMsg({ success: false, text: err.message });
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f2f2f7', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, maxWidth: '400px', margin: '4rem auto', textAlign: 'center', padding: '1.5rem' }}>
          <h3>Sign in required</h3>
          <Link to="/login" style={{ backgroundColor: '#007aff', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const walletBalance = profileData?.walletBalance || 0;
  const transactions = profileData?.transactions || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f2f2f7', color: '#000000', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ maxWidth: '600px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem', boxSizing: 'border-box' }}>
        {/* iOS Large Profile Header */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#007aff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, margin: '0 auto 1rem auto', textTransform: 'uppercase' }}>
            {user.name ? user.name[0] : 'U'}
          </div>
          <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.375rem', fontWeight: 700, color: '#000000', letterSpacing: '-0.02em' }}>
            {user.name}
          </h2>
          <div style={{ fontSize: '0.875rem', color: '#8e8e93', marginBottom: '0.5rem' }}>{user.email}</div>
          <span style={{ backgroundColor: '#e5e5ea', color: '#1c1c1e', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
            {user.course}
          </span>
        </div>

        {/* Grouped iOS Settings List 1: Account Features */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '1.25rem' }}>
          {/* Row 1: Wallet */}
          <div onClick={() => setShowWalletModal(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', cursor: 'pointer', borderBottom: '1px solid #e5e5ea' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#34c759', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem' }}>💰</div>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#000000' }}>Wallet Balance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#34c759' }}>₹{walletBalance.toLocaleString('en-IN')}</span>
              <span style={{ fontSize: '1.25rem', color: '#c7c7cc', fontWeight: 600 }}>›</span>
            </div>
          </div>

          {/* Row 2: My Listings */}
          <div onClick={() => navigate('/my-listings')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', cursor: 'pointer', borderBottom: '1px solid #e5e5ea' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#007aff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem' }}>📦</div>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#000000' }}>My Listings</span>
            </div>
            <span style={{ fontSize: '1.25rem', color: '#c7c7cc', fontWeight: 600 }}>›</span>
          </div>

          {/* Row 3: My Orders */}
          <div onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#af52de', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem' }}>🛍️</div>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#000000' }}>My Purchase Orders</span>
            </div>
            <span style={{ fontSize: '1.25rem', color: '#c7c7cc', fontWeight: 600 }}>›</span>
          </div>
        </div>

        {/* Grouped iOS Settings List 2: Settings & Security */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '1.5rem' }}>
          {/* Row 4: Settlement / Payout Details */}
          <div onClick={() => setShowPayoutModal(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', cursor: 'pointer', borderBottom: '1px solid #e5e5ea' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ff9500', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem' }}>💳</div>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#000000' }}>Seller Payout Details</span>
            </div>
            <span style={{ fontSize: '1.25rem', color: '#c7c7cc', fontWeight: 600 }}>›</span>
          </div>

          {/* Row 5: Change Password */}
          <div onClick={() => setShowPasswordModal(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#5856d6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem' }}>🔒</div>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#000000' }}>Change Password</span>
            </div>
            <span style={{ fontSize: '1.25rem', color: '#c7c7cc', fontWeight: 600 }}>›</span>
          </div>
        </div>

        {/* Sign Out Button */}
        <div onClick={logoutUser} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1rem', textAlign: 'center', color: '#ff3b30', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          Sign Out
        </div>
      </main>

      {/* iOS Modal / Sheet 1: Wallet Ledger */}
      {showWalletModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', width: '100%', maxWidth: '550px', padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>💰 Wallet Ledger</h3>
              <button onClick={() => setShowWalletModal(false)} style={{ border: 'none', background: '#e5e5ea', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>
            <div style={{ backgroundColor: '#f2f2f7', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: '#8e8e93', textTransform: 'uppercase', fontWeight: 600 }}>Current Balance</span>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#34c759', marginTop: '0.25rem' }}>₹{walletBalance.toLocaleString('en-IN')}</div>
            </div>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase' }}>Transactions ({transactions.length})</h4>
            {transactions.length === 0 ? <div style={{ color: '#8e8e93', fontSize: '0.875rem' }}>No transactions recorded.</div> : (
              transactions.map((tx) => (
                <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e5e5ea', fontSize: '0.875rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{tx.description}</div>
                    <span style={{ fontSize: '0.75rem', color: '#8e8e93' }}>{new Date(tx.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: tx.type === 'credit' ? '#34c759' : '#ff3b30' }}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* iOS Modal / Sheet 2: Payout Info */}
      {showPayoutModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', width: '100%', maxWidth: '550px', padding: '1.5rem', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>💳 Seller Payout Details</h3>
              <button onClick={() => setShowPayoutModal(false)} style={{ border: 'none', background: '#e5e5ea', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>
            {paymentMsg && <div style={{ padding: '0.625rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: paymentMsg.success ? '#e4f9e8' : '#ffe5e5', color: paymentMsg.success ? '#15803d' : '#b91c1c', fontSize: '0.8125rem' }}>{paymentMsg.text}</div>}
            <form onSubmit={handleSavePaymentDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#8e8e93', marginBottom: '0.25rem' }}>UPI ID (Recommended)</label>
                <input type="text" placeholder="e.g. 9876543210@paytm" value={paymentForm.upiId} onChange={(e) => setPaymentForm({ ...paymentForm, upiId: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #c7c7cc', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ borderTop: '1px solid #e5e5ea', paddingTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 700 }}>Bank Account Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input type="text" placeholder="Account Holder Name" value={paymentForm.bankAccountName} onChange={(e) => setPaymentForm({ ...paymentForm, bankAccountName: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #c7c7cc', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                  <input type="text" placeholder="Account Number" value={paymentForm.accountNumber} onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #c7c7cc', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                  <input type="text" placeholder="IFSC Code" value={paymentForm.ifscCode} onChange={(e) => setPaymentForm({ ...paymentForm, ifscCode: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #c7c7cc', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
                </div>
              </div>
              <button type="submit" disabled={savingPayment} style={{ backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: 600, fontSize: '1rem', marginTop: '0.5rem', cursor: 'pointer' }}>
                {savingPayment ? 'Saving...' : 'Save Payout Details'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* iOS Modal / Sheet 3: Password Update */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', width: '100%', maxWidth: '550px', padding: '1.5rem', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>🔒 Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} style={{ border: 'none', background: '#e5e5ea', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>
            {passwordMsg && <div style={{ padding: '0.625rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: passwordMsg.success ? '#e4f9e8' : '#ffe5e5', color: passwordMsg.success ? '#15803d' : '#b91c1c', fontSize: '0.8125rem' }}>{passwordMsg.text}</div>}
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <input type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #c7c7cc', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
              <input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #c7c7cc', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
              <input type="password" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #c7c7cc', fontSize: '0.9375rem', boxSizing: 'border-box' }} />
              <button type="submit" disabled={changingPassword} style={{ backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: 600, fontSize: '1rem', marginTop: '0.5rem', cursor: 'pointer' }}>
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfilePage;
