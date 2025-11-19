import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import '../css/RequestsPanel.css';

export default function DepositRequests() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dados de exemplo (simulados)
  const [requests] = useState([
    {
      id: 1,
      user: 'tute4279',
      date: '19/11/2025, 14:30',
      amount: 10000,
      cbu: '0000133100000000537023',
      holder: 'Carlos Silva',
      status: 'Pendiente',
    },
    {
      id: 2,
      user: 'joao123',
      date: '19/11/2025, 12:15',
      amount: 15000,
      cbu: '0000133100000000123456',
      holder: 'João Santos',
      status: 'Pendiente',
    },
    {
      id: 3,
      user: 'maria456',
      date: '18/11/2025, 18:45',
      amount: 8000,
      cbu: '0000133100000000789012',
      holder: 'Maria Oliveira',
      status: 'Aprobada',
    },
    {
      id: 4,
      user: 'pedro789',
      date: '18/11/2025, 16:20',
      amount: 12000,
      cbu: '0000133100000000345678',
      holder: 'Pedro Martinez',
      status: 'Rechazada',
    },
  ]);

  const handleBack = () => {
    navigate('/admin');
  };

  const handleApprove = (req) => {
    alert(`Solicitud de ${req.user} aprobada (simulado)`);
  };

  const handleReject = (req) => {
    alert(`Solicitud de ${req.user} rechazada (simulado)`);
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
      </main>

      <Footer />
    </div>
  );
}
