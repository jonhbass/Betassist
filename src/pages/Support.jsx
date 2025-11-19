import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserSupport from '../components/UserSupport';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import '../css/Dashboard.css';

export default function Support() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div
      className="ba-dashboard"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <Topbar simpleMode={true} />

      <main
        className="ba-main"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          position: 'relative',
        }}
      >
        <button
          onClick={handleBack}
          style={{
            position: 'absolute',
            left: '2rem',
            top: '2rem',
            backgroundColor: '#ffcc00',
            color: '#000',
            border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            zIndex: 10,
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#e6b800')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#ffcc00')}
        >
          ← Volver
        </button>

        <div style={{ width: '100%', maxWidth: '900px' }}>
          <UserSupport />
        </div>
      </main>

      <Footer />
    </div>
  );
}
