import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import '../css/WithdrawChips.css';
import { getServerUrl } from '../utils/serverUrl';

// Limite diário máximo de retirada
const DAILY_WITHDRAW_LIMIT = 500000.0;

// Função para obter a data atual no formato YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Função para obter o limite disponível do usuário
const getDailyWithdrawData = (username) => {
  const key = `DAILY_WITHDRAW_${username}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    const data = JSON.parse(stored);
    // Verificar se é do dia atual
    if (data.date === getTodayDate()) {
      return data;
    }
  }
  // Se não existe ou é de outro dia, retorna limite completo
  return { date: getTodayDate(), usedAmount: 0 };
};

// Função para salvar o limite usado do usuário
const saveDailyWithdrawData = (username, usedAmount) => {
  const key = `DAILY_WITHDRAW_${username}`;
  const data = { date: getTodayDate(), usedAmount };
  localStorage.setItem(key, JSON.stringify(data));
};

export default function WithdrawChips() {
  const navigate = useNavigate();
  const [cbu, setCbu] = useState('');
  const [holder, setHolder] = useState('');
  const [amount, setAmount] = useState('');
  const [availableForWithdraw, setAvailableForWithdraw] =
    useState(DAILY_WITHDRAW_LIMIT);

  const authUser = sessionStorage.getItem('authUser') || 'Anônimo';

  // Carregar o limite disponível ao montar o componente
  useEffect(() => {
    const loadAvailableLimit = async () => {
      // Primeiro tenta carregar do servidor
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/users/${authUser}`);
        if (res.ok) {
          const userData = await res.json();
          if (
            userData.dailyWithdraw &&
            userData.dailyWithdraw.date === getTodayDate()
          ) {
            const available =
              DAILY_WITHDRAW_LIMIT - (userData.dailyWithdraw.usedAmount || 0);
            setAvailableForWithdraw(Math.max(0, available));
            return;
          }
        }
      } catch (err) {
        console.warn(
          'Não foi possível carregar limite do servidor, usando localStorage'
        );
      }

      // Fallback para localStorage
      const data = getDailyWithdrawData(authUser);
      const available = DAILY_WITHDRAW_LIMIT - data.usedAmount;
      setAvailableForWithdraw(Math.max(0, available));
    };

    loadAvailableLimit();
  }, [authUser]);

  // Função para permitir alfanuméricos (para CBU/Alias)
  const handleCbuChange = (e) => {
    const value = e.target.value;
    setCbu(value);
  };

  // Função para permitir apenas números, ponto e vírgula (para valores monetários)
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.,]/g, '');
    setAmount(value);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
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
      alert(
        `El monto supera tu límite disponible de hoy ($${availableForWithdraw.toLocaleString(
          'es-AR',
          { minimumFractionDigits: 2 }
        )})`
      );
      return;
    }

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

    // Enviar para o servidor
    const serverUrl = getServerUrl();
    try {
      const res = await fetch(`${serverUrl}/withdrawals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });
      if (!res.ok) throw new Error('Falha ao salvar retirada');
    } catch (err) {
      console.error('Erro ao salvar retirada no servidor:', err);
      // Fallback para localStorage
      const existingRequests = JSON.parse(
        localStorage.getItem('WITHDRAW_REQUESTS') || '[]'
      );
      existingRequests.push(newRequest);
      localStorage.setItem(
        'WITHDRAW_REQUESTS',
        JSON.stringify(existingRequests)
      );
    }

    // Atualizar o limite diário usado
    const currentData = getDailyWithdrawData(authUser);
    const newUsedAmount = currentData.usedAmount + withdrawAmount;
    saveDailyWithdrawData(authUser, newUsedAmount);

    // Atualizar também no servidor
    try {
      const serverUrl = getServerUrl();
      await fetch(`${serverUrl}/users/${authUser}/daily-withdraw`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: getTodayDate(),
          usedAmount: newUsedAmount,
        }),
      });
    } catch (err) {
      console.warn('Não foi possível salvar limite no servidor:', err);
    }

    // Atualizar estado local
    setAvailableForWithdraw(Math.max(0, DAILY_WITHDRAW_LIMIT - newUsedAmount));

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
                {DAILY_WITHDRAW_LIMIT.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                })}{' '}
                diarios
              </span>
              . Hoy te quedan{' '}
              <span
                className="ba-balance-available"
                style={{
                  color: availableForWithdraw <= 0 ? '#ef4444' : '#22c55e',
                }}
              >
                ${' '}
                {availableForWithdraw.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </p>
          </div>

          <form className="ba-withdraw-form" onSubmit={handleSubmit}>
            <div className="ba-form-group">
              <label>CBU/Alias:</label>
              <input
                type="text"
                className="ba-form-input"
                placeholder="CBU o Alias"
                value={cbu}
                onChange={handleCbuChange}
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
                onChange={handleAmountChange}
                inputMode="decimal"
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
