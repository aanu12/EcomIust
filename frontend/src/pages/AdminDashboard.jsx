import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import IdViewerModal from '../components/IdViewerModal';
import PasswordModal from '../components/PasswordModal';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';

const AdminDashboard = () => {
  const { token, logoutUser, API_URL } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedIdImage, setSelectedIdImage] = useState(null); // { url, name, course }
  const [passwordModalData, setPasswordModalData] = useState(null); // { user, password }
  const [editingUser, setEditingUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = filterStatus === 'all'
        ? `${API_URL}/admin/users`
        : `${API_URL}/admin/users?status=${filterStatus}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setUsers(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch users.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL, filterStatus, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Actions
  const handleApprove = async (user) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${user._id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Approval failed.');
      }

      setPasswordModalData({
        user: data.data,
        password: data.generatedPassword
      });
      fetchUsers();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleReject = async (user) => {
    if (!window.confirm(`Are you sure you want to reject ${user.name}? This will delete their uploaded ID from Cloudinary.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/users/${user._id}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Rejection failed.');
      }
      fetchUsers();
    } catch (err) {
      alert(`Rejection error: ${err.message}`);
    }
  };

  const handleSaveEditUser = async (userId, updatedDetails) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedDetails)
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to update user details.');
    }
    fetchUsers();
  };

  const handleCreateUser = async (userPayload) => {
    const res = await fetch(`${API_URL}/admin/users/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(userPayload)
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to create user.');
    }

    setPasswordModalData({
      user: data.data,
      password: data.generatedPassword
    });
    fetchUsers();
  };

  const handleSendEmailCredentials = async (userId, password) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to send credentials email.');
    }
    return data;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a' }}>
              Campus Marketplace Admin
            </h1>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Student Verification & User Management</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#334155', padding: '0.375rem 0.75rem', borderRadius: '6px' }}>
            Admin Session
          </span>
          <button
            onClick={logoutUser}
            style={{
              backgroundColor: '#ffffff',
              color: '#ef4444',
              border: '1px solid #fca5a5',
              padding: '0.45rem 0.875rem',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area - Strictly User Verification */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Action Controls Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Status Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: filterStatus === status ? 600 : 500,
                  cursor: 'pointer',
                  backgroundColor: filterStatus === status ? '#ffffff' : 'transparent',
                  color: filterStatus === status ? '#0f172a' : '#64748b',
                  boxShadow: filterStatus === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease'
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Add User Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <span>+</span> Manually Create User
          </button>
        </div>

        {/* User Table / Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
            Loading student verification records...
          </div>
        ) : error ? (
          <div style={{ padding: '1.5rem', backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '12px', color: '#c53030' }}>
            ⚠️ Error: {error}
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '16px' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📄</span>
            <h3 style={{ margin: 0, color: '#334155', fontWeight: 600 }}>No Verification Requests Found</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              There are currently no users matching filter "{filterStatus}".
            </p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>Student Detail</th>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>Course</th>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>ID Document</th>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const statusColors = {
                    pending: { bg: '#fffbeb', text: '#b45309', border: '#fef3c7' },
                    approved: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
                    rejected: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' }
                  };
                  const color = statusColors[user.status] || statusColors.pending;

                  return (
                    <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}>
                      {/* Name & Email */}
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>{user.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '2px' }}>{user.email}</div>
                      </td>

                      {/* Course */}
                      <td style={{ padding: '1.25rem', color: '#334155', fontWeight: 500 }}>
                        {user.course}
                      </td>

                      {/* ID Image Thumbnail */}
                      <td style={{ padding: '1.25rem' }}>
                        {user.idCard && user.idCard.url ? (
                          <div
                            onClick={() => setSelectedIdImage({ url: user.idCard.url, name: user.name, course: user.course })}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'pointer',
                              width: 'fit-content'
                            }}
                          >
                            <img
                              src={user.idCard.url}
                              alt="ID Document"
                              style={{
                                width: '48px',
                                height: '36px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}>View ID 🔍</span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>No ID Uploaded</span>
                        )}
                      </td>

                      {/* Verification Status Badge */}
                      <td style={{ padding: '1.25rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.625rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em',
                            backgroundColor: color.bg,
                            color: color.text,
                            border: `1px solid ${color.border}`
                          }}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(user)}
                                style={{
                                  backgroundColor: '#16a34a',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '0.375rem 0.75rem',
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(user)}
                                style={{
                                  backgroundColor: '#dc2626',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '0.375rem 0.75rem',
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setEditingUser(user)}
                            style={{
                              backgroundColor: '#ffffff',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '0.375rem 0.625rem',
                              fontWeight: 500,
                              fontSize: '0.8125rem',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Full Screen ID Lightbox Viewer */}
      <IdViewerModal
        isOpen={!!selectedIdImage}
        imageUrl={selectedIdImage?.url}
        studentName={selectedIdImage?.name}
        studentCourse={selectedIdImage?.course}
        onClose={() => setSelectedIdImage(null)}
      />

      {/* Generated Password Modal */}
      <PasswordModal
        isOpen={!!passwordModalData}
        user={passwordModalData?.user}
        password={passwordModalData?.password}
        onClose={() => setPasswordModalData(null)}
        onSendEmail={handleSendEmailCredentials}
      />

      {/* Manual Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={handleCreateUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveEditUser}
      />
    </div>
  );
};

export default AdminDashboard;
