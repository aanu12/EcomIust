import React, { useState, useEffect } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    fetch(`${apiUrl}/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus({ loading: false, data, error: null }))
      .catch((err) => setBackendStatus({ loading: false, data: null, error: err.message }));
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ color: '#2b6cb0', margin: 0 }}>🎓 Campus Marketplace</h1>
        <p style={{ color: '#4a5568', marginTop: '0.5rem' }}>
          University-Student-Only E-Commerce Platform
        </p>
      </header>

      <main>
        <section style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>Backend Connectivity Check</h2>
          {backendStatus.loading && <p>Checking backend health API...</p>}
          {backendStatus.error && (
            <div style={{ color: '#c53030', background: '#fff5f5', padding: '1rem', borderRadius: '6px' }}>
              ❌ Connection status: Failed ({backendStatus.error})
            </div>
          )}
          {backendStatus.data && (
            <div style={{ color: '#276749', background: '#f0fff4', padding: '1rem', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>✅ API Connected!</p>
              <pre style={{ background: '#edf2f7', padding: '0.75rem', borderRadius: '4px', overflowX: 'auto', fontSize: '0.875rem' }}>
                {JSON.stringify(backendStatus.data, null, 2)}
              </pre>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
