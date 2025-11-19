import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import '../css/RequestsPanel.css';

export default function RequestsPanel() {
  const navigate = useNavigate();

  // Filtros
  const [typeFilter, setTypeFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dados de exemplo (simulados)
  const [requests] = useState([
    {
      id: 1,
      date: '3/10/2025, 14:58',
      amount: 10000,
      type: 'Recarga',
      message: 'Solicitud de recarga',
      status: 'Exitosa',
    },
    {
      id: 2,
      date: '3/10/2025, 08:56',
      amount: 15000,
      type: 'Recarga',
      message: 'Recarga manual desde administrador',
      status: 'Exitosa',
    },
    {
      id: 3,
      date: '2/10/2025, 20:36',
      amount: 5000,
      type: 'Recarga',
      message: 'Rechazo automático',
      status: 'Rechazada',
    },
    {
      id: 4,
      date: '2/10/2025, 17:52',
      amount: 10000,
      type: 'Recarga',
      message: 'Comprobante incorrecto',
      status: 'Rechazada',
    },
    {
      id: 5,
      date: '2/10/2025, 13:27',
      amount: 5000,
      type: 'Recarga',
      message: 'Solicitud de recarga',
      status: 'Exitosa',
    },
    {
      id: 6,
      date: '1/10/2025, 16:22',
      amount: 8000,
      type: 'Retiros',
      message: 'Solicitud de retiro',
      status: 'Exitosa',
    },
    {
      id: 7,
      date: '1/10/2025, 10:15',
      amount: 12000,
      type: 'Bonificaciones',
      message: 'Bonificación de bienvenida',
      status: 'Exitosa',
    },
  ]);

  const handleBack = () => {
    navigate(-1);
  };

  // Filtrar solicitudes
  const filteredRequests = requests.filter((req) => {
    const typeMatch = typeFilter === 'Todas' || req.type === typeFilter;
    const statusMatch = statusFilter === 'Todas' || req.status === statusFilter;
    return typeMatch && statusMatch;
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
          <h2 className="ba-requests-title">📋 Panel de solicitudes</h2>
        </div>

        {/* Filtros */}
        <div className="ba-filter-section">
          <div className="ba-filter-row">
            <button
              className={`ba-filter-btn primary ${
                typeFilter === 'Todas' ? 'active' : ''
              }`}
              onClick={() => setTypeFilter('Todas')}
            >
              Todas
            </button>
            <button
              className={`ba-filter-btn secondary ${
                typeFilter === 'Cargas' ? 'active' : ''
              }`}
              onClick={() => setTypeFilter('Cargas')}
            >
              Cargas
            </button>
            <button
              className={`ba-filter-btn secondary ${
                typeFilter === 'Retiros' ? 'active' : ''
              }`}
              onClick={() => setTypeFilter('Retiros')}
            >
              Retiros
            </button>
            <button
              className={`ba-filter-btn secondary ${
                typeFilter === 'Bonificaciones' ? 'active' : ''
              }`}
              onClick={() => setTypeFilter('Bonificaciones')}
            >
              Bonificaciones
            </button>
          </div>

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
                statusFilter === 'Rechazadas' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('Rechazadas')}
            >
              Rechazadas
            </button>
            <button
              className={`ba-filter-btn secondary ${
                statusFilter === 'Aceptadas' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('Aceptadas')}
            >
              Aceptadas
            </button>
            <button
              className={`ba-filter-btn secondary ${
                statusFilter === 'Pendientes' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('Pendientes')}
            >
              Pendientes
            </button>
            <button
              className={`ba-filter-btn secondary ${
                statusFilter === 'Solicitadas' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('Solicitadas')}
            >
              Solicitadas
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="ba-requests-table-container">
          <table className="ba-requests-table">
            <thead>
              <tr>
                <th></th>
                <th>Fecha y Hora</th>
                <th>Monto</th>
                <th>Tipo</th>
                <th>Mensaje</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((req) => (
                <tr key={req.id}>
                  <td>
                    <span
                      className={`ba-status-indicator ${
                        req.status === 'Exitosa'
                          ? 'success'
                          : req.status === 'Rechazada'
                          ? 'rejected'
                          : 'pending'
                      }`}
                    ></span>
                  </td>
                  <td>{req.date}</td>
                  <td>$ {req.amount.toLocaleString('es-AR')}</td>
                  <td>{req.type}</td>
                  <td>{req.message}</td>
                  <td>
                    <span
                      className={`ba-status-badge ${
                        req.status === 'Exitosa' ? 'success' : 'rejected'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === 'Exitosa' && (
                      <button className="ba-action-btn success">Exitosa</button>
                    )}
                    {req.status === 'Rechazada' && (
                      <button className="ba-action-btn success">
                        Rechazada
                      </button>
                    )}
                    <button className="ba-action-btn danger">
                      Ir a reclamar
                    </button>
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
