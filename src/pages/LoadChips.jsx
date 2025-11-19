import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import '../css/LoadChips.css';

const DEFAULT_CBU = '0000133100000000537023';

export default function LoadChips() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [holder, setHolder] = useState('');
  const [cbu, setCbu] = useState(DEFAULT_CBU);

  useEffect(() => {
    // Carregar CBU do localStorage ou usar padrão
    const storedCbu = localStorage.getItem('DEPOSIT_CBU');
    if (storedCbu) {
      setCbu(storedCbu);
    }
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to submit request would go here
    alert('Solicitud enviada (simulado)');
    navigate('/home');
  };

  return (
    <div className="ba-load-chips-page">
      <Topbar simpleMode={true} />

      <main className="ba-load-chips-main">
        <div className="ba-load-header">
          <button className="ba-btn-back" onClick={handleBack}>
            ← Volver
          </button>
          <h2 className="ba-load-title">
            <span role="img" aria-label="icon">
              🪙
            </span>{' '}
            Solicitud de carga de fichas
          </h2>
        </div>

        <div className="ba-load-card">
          <span className="ba-important">¡IMPORTANTE!</span>
          <p>
            Para realizar la carga de fichas debes realizar una transferencia al
            siguiente CBU:
          </p>

          <div className="ba-cbu-box">📄 {cbu}</div>

          <p className="ba-load-instructions">
            Luego debes informar el importe que transferiste a continuación, el
            titular de la cuenta y adjuntar el comprobante de la transacción.
          </p>

          <form className="ba-load-form" onSubmit={handleSubmit}>
            <div className="ba-form-group">
              <label>Monto:</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="ba-form-input"
                placeholder="Ejemplo: 1000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="ba-form-group">
              <label>Ingresar titular:</label>
              <input
                type="text"
                className="ba-form-input"
                placeholder="Nombre del titular"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
              />
            </div>

            <button type="button" className="ba-btn-attach">
              Adjuntar comprobante
            </button>

            <p className="ba-warning-text">
              Recuerda revisar que el CBU informado sea el correcto para evitar
              demoras a la hora de confirmar la carga.
            </p>

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
