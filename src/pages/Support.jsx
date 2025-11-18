import React from 'react';
import UserSupport from '../components/UserSupport';
import '../css/Dashboard.css';

export default function Support() {
  return (
    <div className="ba-dashboard">
      <main className="ba-main" style={{ paddingTop: 24 }}>
        <UserSupport />
      </main>
    </div>
  );
}
