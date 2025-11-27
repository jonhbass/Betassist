import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import '../css/LoadChips.css';
import { getServerUrl } from '../utils/serverUrl';

export default function LoadChips() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [holder, setHolder] = useState('');
  const [cbu, setCbu] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');

  // Função para permitir apenas números, ponto e vírgula (para valores monetários)
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.,]/g, '');
    setAmount(value);
  };

  useEffect(() => {
    // Carregar CBU do servidor ou localStorage
    const loadCbu = async () => {
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/config`);
        if (res.ok) {
          const data = await res.json();
          if (data.cbu) {
            setCbu(data.cbu);
            // Atualizar cache local
            localStorage.setItem('DEPOSIT_CBU', data.cbu);
            return;
          }
        }
        // Fallback para localStorage se falhar ou não tiver no server
        const storedCbu = localStorage.getItem('DEPOSIT_CBU');
        setCbu(storedCbu || '');
      } catch (err) {
        console.error('Failed to load CBU', err);
        const storedCbu = localStorage.getItem('DEPOSIT_CBU');
        setCbu(storedCbu || '');
      }
    };
    loadCbu();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, seleccione solo imágenes');
        return;
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe tener un máximo de 5MB');
        return;
      }

      setReceiptFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!amount || parseFloat(amount) <= 0) {
      alert('Por favor, ingrese un monto válido');
      return;
    }

    if (!holder.trim()) {
      alert('Por favor, ingrese el nombre del titular');
      return;
    }

    if (!receiptFile) {
      alert('Por favor, adjunte el comprobante de transferencia');
      return;
    }

    // Obter usuário logado
    const authUser = sessionStorage.getItem('authUser') || 'Anônimo';

    let finalReceiptUrl = receiptPreview; // Fallback para base64

    // Tentar enviar para o backend (se disponível)
    const serverUrl = getServerUrl();

    try {
      const response = await fetch(`${serverUrl}/upload-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: receiptPreview,
          username: authUser,
          amount: parseFloat(amount),
          holder: holder,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        finalReceiptUrl = data.receiptUrl;
        console.log('✅ Upload processado:', data.message);
      } else {
        console.warn('⚠️ Backend não respondeu, usando localStorage');
      }
    } catch (error) {
      console.warn('⚠️ Servidor offline, usando localStorage:', error.message);
    }

    // Criar objeto da solicitação
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
      amount: parseFloat(amount),
      cbu: cbu, // CBU de destino (do sistema) para onde o usuário transferiu
      holder: holder,
      receipt: finalReceiptUrl, // URL do Cloudinary ou base64
      status: 'Pendiente',
    };

    // Enviar solicitação para o servidor
    try {
      const res = await fetch(`${serverUrl}/deposits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });
      if (!res.ok) throw new Error('Falha ao salvar depósito');
    } catch (err) {
      console.error('Erro ao salvar depósito no servidor:', err);
      // Fallback para localStorage
      const existingRequests = JSON.parse(
        localStorage.getItem('DEPOSIT_REQUESTS') || '[]'
      );
      existingRequests.push(newRequest);
      localStorage.setItem(
        'DEPOSIT_REQUESTS',
        JSON.stringify(existingRequests)
      );
    }

    alert(
      '✅ Solicitud enviada con éxito! Será revisada por un administrador.'
    );
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
                type="text"
                className="ba-form-input"
                placeholder="Ejemplo: 1000.00"
                value={amount}
                onChange={handleAmountChange}
                inputMode="decimal"
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

            <div className="ba-form-group">
              <label>Comprobante de transferencia:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload" className="ba-btn-attach">
                {receiptFile
                  ? '✓ ' + receiptFile.name
                  : '📎 Adjuntar comprobante'}
              </label>
              {receiptPreview && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={receiptPreview}
                    alt="Preview"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      border: '2px solid #ffc107',
                    }}
                  />
                </div>
              )}
            </div>

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
