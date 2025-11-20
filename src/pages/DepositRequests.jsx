import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import '../css/RequestsPanel.css';

export default function DepositRequests() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [requests, setRequests] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Carregar solicitações do localStorage
  useEffect(() => {
    const loadRequests = () => {
      try {
        const stored = localStorage.getItem('DEPOSIT_REQUESTS');
        if (stored) {
          const parsed = JSON.parse(stored);
          setRequests(Array.isArray(parsed) ? parsed : []);
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.error('Erro ao carregar solicitações:', error);
        setRequests([]);
      }
    };

    loadRequests();

    // Atualizar a cada 5 segundos para pegar novas solicitações
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    navigate('/admin');
  };

  const handleApprove = (req) => {
    if (
      window.confirm(
        `¿Aprobar solicitud de ${req.user} por $${req.amount.toLocaleString(
          'es-AR'
        )}?`
      )
    ) {
      const updatedRequests = requests.map((r) =>
        r.id === req.id ? { ...r, status: 'Aprobada' } : r
      );
      setRequests(updatedRequests);
      localStorage.setItem('DEPOSIT_REQUESTS', JSON.stringify(updatedRequests));
      alert(`✅ Solicitud de ${req.user} aprobada`);
    }
  };

  const handleReject = (req) => {
    if (
      window.confirm(
        `¿Rechazar solicitud de ${req.user} por $${req.amount.toLocaleString(
          'es-AR'
        )}?`
      )
    ) {
      const updatedRequests = requests.map((r) =>
        r.id === req.id ? { ...r, status: 'Rechazada' } : r
      );
      setRequests(updatedRequests);
      localStorage.setItem('DEPOSIT_REQUESTS', JSON.stringify(updatedRequests));
      alert(`❌ Solicitud de ${req.user} rechazada`);
    }
  };

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
  };

  // Filtrar solicitudes
  const filteredRequests = requests.filter((req) => {
    return statusFilter === 'Todas' || req.status === statusFilter;
  });

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="ba-requests-panel-page">
      <Topbar simpleMode={true} />

      <main className="ba-requests-panel-main">
        <div className="ba-requests-header">
          <button className="ba-btn-back" onClick={handleBack}>
            ← Volver
          </button>
          <h2 className="ba-requests-title">💰 Solicitações de Depósito</h2>
        </div>

        {/* Filtros */}
        <div className="ba-filter-section">
          <div className="ba-filter-row">
            <button
              className={`ba-filter-btn primary ${
                statusFilter === 'Todas' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('Todas')}
            >
              Todas
            </button>
            <button
              className={`ba-filter-btn secondary ${
                statusFilter === 'Pendiente' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('Pendiente')}
            >
              Pendientes
            </button>
            <button
              className={`ba-filter-btn secondary ${
                statusFilter === 'Aprobada' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('Aprobada')}
            >
              Aprobadas
            </button>
            <button
              className={`ba-filter-btn secondary ${
                statusFilter === 'Rechazada' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('Rechazada')}
            >
              Rechazadas
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="ba-requests-table-container">
          <table className="ba-requests-table">
            <thead>
              <tr>
                <th></th>
                <th>Usuario</th>
                <th>Fecha y Hora</th>
                <th>Monto</th>
                <th>CBU</th>
                <th>Titular</th>
                <th>Comprobante</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((req) => (
                <tr key={req.id}>
                  <td>
                    <span
                      className={`ba-status-indicator ${
                        req.status === 'Aprobada'
                          ? 'success'
                          : req.status === 'Rechazada'
                          ? 'rejected'
                          : 'pending'
                      }`}
                    ></span>
                  </td>
                  <td>{req.user}</td>
                  <td>{req.date}</td>
                  <td>$ {req.amount.toLocaleString('es-AR')}</td>
                  <td>{req.cbu}</td>
                  <td>{req.holder}</td>
                  <td>
                    {req.receipt ? (
                      <button
                        className="ba-action-btn primary"
                        onClick={() => handleViewReceipt(req.receipt)}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        📎 Ver
                      </button>
                    ) : (
                      <span style={{ color: '#888' }}>-</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`ba-status-badge ${
                        req.status === 'Aprobada'
                          ? 'success'
                          : req.status === 'Rechazada'
                          ? 'rejected'
                          : 'pending'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === 'Pendiente' && (
                      <>
                        <button
                          className="ba-action-btn success"
                          onClick={() => handleApprove(req)}
                        >
                          Aprobar
                        </button>
                        <button
                          className="ba-action-btn danger"
                          onClick={() => handleReject(req)}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {req.status !== 'Pendiente' && (
                      <span style={{ color: '#888' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginação */}
          <div className="ba-pagination">
            <div className="ba-items-per-page">
              <select
                className="ba-items-select"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="ba-pagination-controls">
              <button
                className="ba-pagination-btn"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                ⟨⟨
              </button>
              <button
                className="ba-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ⟨
              </button>
              <span className="ba-pagination-info">
                página {currentPage} de {totalPages}
              </span>
              <button
                className="ba-pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ⟩
              </button>
              <button
                className="ba-pagination-btn"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                ⟩⟩
              </button>
            </div>

            <div style={{ width: '100px' }}></div>
          </div>
        </div>

        {/* Modal de visualização de comprovante */}
        {selectedReceipt && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
            }}
            onClick={() => setSelectedReceipt(null)}
          >
            <div
              style={{
                position: 'relative',
                maxWidth: '90%',
                maxHeight: '90%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '0',
                  background: '#ffc107',
                  border: 'none',
                  color: '#000',
                  fontSize: '24px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ×
              </button>
              <img
                src={selectedReceipt}
                alt="Comprobante"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                }}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
