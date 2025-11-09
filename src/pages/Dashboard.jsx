
import React from 'react';
import '../css/Dashboard.css'; // se quiser estilizar separado

function Dashboard() {
  return (
  <div className="dashboard-container">
    <h1>Bem-vindo ao BetAssint 🎯</h1>
    <p>Seu painel principal está pronto para receber funcionalidades.</p>

  <div className="dashboard-cards">
  <div className="card">
    <h2>Saldo</h2>
    <p>R$ 1.250,00</p>
    </div>
    <div className="card">
      <h2>Últimas apostas</h2>
    <ul>
      <li>Palmeiras x Flamengo — Vitória: R$ 150</li>
      <li>Grêmio x Santos — Derrota: -R$ 50</li>
    </ul>
  </div>
  </div>
  </div>
  );
}

export default Dashboard;