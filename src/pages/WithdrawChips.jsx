import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import '../css/WithdrawChips.css';

export default function WithdrawChips() {
  const navigate = useNavigate();
  const [cbu, setCbu] = useState('');
  const [holder, setHolder] = useState('');
  const [amount, setAmount] = useState('');

  // Simulação de saldo disponível
  const currentBalance = 500000.0;
  const availableForWithdraw = 500000.0;

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validações
    if (!cbu.trim() || !holder.trim() || !amount) {
      alert('Por favor, complete todos los campos');
      return;
    }

    const withdrawAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ''));

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert('Por favor, ingrese un monto válido');
      return;
    }

    if (withdrawAmount > availableForWithdraw) {
      alert('Valor superior al saldo disponible');
      return;
    }

    // Obter usuário logado
    const authUser = sessionStorage.getItem('authUser') || 'Anônimo';

    // Criar objeto da solicitação de retirada
    const newRequest = {
      id: Date.now(),
      user: authUser,
      date: new Date().toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      amount: withdrawAmount,
      cbu: cbu.trim(),
      holder: holder.trim(),
      status: 'Pendiente',
    };

    // Recuperar solicitações existentes
    const existingRequests = JSON.parse(
      localStorage.getItem('WITHDRAW_REQUESTS') || '[]'
    );

    // Adicionar nova solicitação
    existingRequests.push(newRequest);

    // Salvar no localStorage
    localStorage.setItem('WITHDRAW_REQUESTS', JSON.stringify(existingRequests));

    alert('✅ Solicitud de retiro enviada con éxito');
    navigate('/home');
  };

  return (
    <div className="ba-withdraw-chips-page">
      <Topbar simpleMode={true} />

      <main className="ba-withdraw-chips-main">
        <div className="ba-withdraw-header">
          <button className="ba-btn-back" onClick={handleBack}>
            ← Volver
          </button>
          <h2 className="ba-withdraw-title">
            <span role="img" aria-label="icon">
              💸
            </span>{' '}
            Solicitud de retiro de fichas
          </h2>
        </div>

        <div className="ba-withdraw-card">
          <span className="ba-important">¡IMPORTANTE!</span>
          <p className="ba-withdraw-instructions">
            Para realizar el retiro de fichas debes ingresar tu CBU, titular y
            el importe. Una vez enviada la solicitud, tu agente la confirmará y
            realizará la transferencia al CBU informado.
          </p>

          <div className="ba-balance-info">
            <p>
              Podés retirar hasta{' '}
              <span className="ba-balance-amount">
                ${' '}
                {currentBalance.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                })}{' '}
                diarios
              </span>
              . Hoy te quedan{' '}
              <span className="ba-balance-available">
                ${' '}
                {availableForWithdraw.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </p>
          </div>

          <form className="ba-withdraw-form" onSubmit={handleSubmit}>
            <div className="ba-form-group">
              <label>CBU/CVU:</label>
              <input
                type="text"
                className="ba-form-input"
                placeholder="CBU/CVU (máximo 22 dígitos)"
                value={cbu}
                onChange={(e) => setCbu(e.target.value)}
                maxLength={22}
              />
            </div>

            <div className="ba-form-group">
              <label>Ingresa titular:</label>
              <input
                type="text"
                className="ba-form-input"
                placeholder="Nombre de titular"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
              />
            </div>

            <div className="ba-form-group">
              <label>Ingresa importe a retirar:</label>
              <input
                type="text"
                className="ba-form-input"
                placeholder="$10.000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <button type="submit" className="ba-btn-submit">
              Enviar solicitud
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
