import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { getServerUrl } from '../utils/serverUrl';
import { ensureSocket } from '../utils/socket';
import '../css/RequestsPanel.css';

const STATUS_MAP = {
  Rechazadas: ['rechazada', 'rechazado'],
  Aceptadas: ['exitosa', 'aprobada', 'aprobado', 'aceptada', 'aceptado'],
  Pendientes: ['pendiente', 'pending'],
  Solicitadas: ['solicitada', 'solicitado', 'solicitud'],
};

const normalizeText = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const matchesStatusFilter = (status, selectedFilter) => {
  if (selectedFilter === 'Todas') return true;
  const normalizedStatus = normalizeText(status);
  const allowedValues = STATUS_MAP[selectedFilter] || [];
  return allowedValues.some((token) => normalizedStatus === token);
};

const getSortableTimestamp = (entry) => {
  const numericId = Number(entry?.id);
  if (!Number.isNaN(numericId) && numericId > 0) {
    return numericId;
  }

  const dateText = entry?.date || '';
  if (!dateText) return 0;

  try {
    const [datePart = '', timePart = ''] = dateText.split(',');
    const [day = '01', month = '01', year = '1970'] = datePart
      .trim()
      .split('/');
    const [hour = '00', minute = '00', second = '00'] = timePart
      .trim()
      .split(':');

    const isoString = `${year.padStart(4, '0')}-${month.padStart(
      2,
      '0'
    )}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(
      2,
      '0'
    )}:${second.padStart(2, '0')}`;
    return new Date(isoString).getTime() || 0;
  } catch (error) {
    void error;
    return 0;
  }
};

export default function RequestsPanel() {
  const navigate = useNavigate();
  const authUser = sessionStorage.getItem('authUser');

  // Filtros
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [requests, setRequests] = useState([]); // histórico (aprovadas / rejeitadas)
  const [pendingRequests, setPendingRequests] = useState([]); // pendentes atuais (deposits + withdrawals)

  // Carregar histórico do servidor
  useEffect(() => {
    const loadHistoryAndPending = async () => {
      if (!authUser) return;
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/users/${authUser}`);
        if (res.ok) {
          const data = await res.json();
          setRequests(data.history || []);
        }
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }

      // Carregar solicitações pendentes (deposits + withdrawals) separadamente
      try {
        const serverUrl = getServerUrl();
        const [depRes, witRes] = await Promise.all([
          fetch(`${serverUrl}/deposits`),
          fetch(`${serverUrl}/withdrawals`),
        ]);
        let pending = [];
        if (depRes.ok) {
          const deposits = await depRes.json();
          pending.push(
            ...deposits
              .filter(
                (d) =>
                  d.user &&
                  d.user.toLowerCase() === authUser.toLowerCase() &&
                  normalizeText(d.status) === 'pendiente'
              )
              .map((d) => ({
                id: d.id,
                type: 'Recarga',
                amount: Number(d.amount) || 0,
                date: d.date || new Date(d.id).toLocaleString('es-AR'),
                status: 'Pendiente',
                message: 'Solicitud de recarga pendiente',
                canClaim: false,
              }))
          );
        }
        if (witRes.ok) {
          const withdrawals = await witRes.json();
          pending.push(
            ...withdrawals
              .filter(
                (w) =>
                  w.user &&
                  w.user.toLowerCase() === authUser.toLowerCase() &&
                  normalizeText(w.status) === 'pendiente'
              )
              .map((w) => ({
                id: w.id,
                type: 'Retiro',
                amount: Number(w.amount) || 0,
                date: w.date || new Date(w.id).toLocaleString('es-AR'),
                status: 'Pendiente',
                message: 'Solicitud de retiro pendiente',
                canClaim: false,
              }))
          );
        }
        setPendingRequests(pending);
      } catch (e) {
        console.error('Erro ao carregar pendentes:', e);
        setPendingRequests([]);
      }
    };

    loadHistoryAndPending();

    const handleUpdate = async (data) => {
      if (
        data.username &&
        data.username.toLowerCase() === authUser.toLowerCase()
      ) {
        if (data.history) setRequests(data.history);
        // Recarregar pendentes quando há atualização do usuário
        try {
          const serverUrl = getServerUrl();
          const [depRes, witRes] = await Promise.all([
            fetch(`${serverUrl}/deposits`),
            fetch(`${serverUrl}/withdrawals`),
          ]);
          let pending = [];
          if (depRes.ok) {
            const deposits = await depRes.json();
            pending.push(
              ...deposits
                .filter(
                  (d) =>
                    d.user &&
                    d.user.toLowerCase() === authUser.toLowerCase() &&
                    normalizeText(d.status) === 'pendiente'
                )
                .map((d) => ({
                  id: d.id,
                  type: 'Recarga',
                  amount: Number(d.amount) || 0,
                  date: d.date || new Date(d.id).toLocaleString('es-AR'),
                  status: 'Pendiente',
                  message: 'Solicitud de recarga pendiente',
                  canClaim: false,
                }))
            );
          }
          if (witRes.ok) {
            const withdrawals = await witRes.json();
            pending.push(
              ...withdrawals
                .filter(
                  (w) =>
                    w.user &&
                    w.user.toLowerCase() === authUser.toLowerCase() &&
                    normalizeText(w.status) === 'pendiente'
                )
                .map((w) => ({
                  id: w.id,
                  type: 'Retiro',
                  amount: Number(w.amount) || 0,
                  date: w.date || new Date(w.id).toLocaleString('es-AR'),
                  status: 'Pendiente',
                  message: 'Solicitud de retiro pendiente',
                  canClaim: false,
                }))
            );
          }
          setPendingRequests(pending);
        } catch (e) {
          console.error('Erro ao atualizar pendentes:', e);
        }
      }
    };

    ensureSocket().then((socket) => {
      if (socket) {
        socket.on('user:update', handleUpdate);
      }
    });

    return () => {
      ensureSocket().then((socket) => {
        if (socket) {
          socket.off('user:update', handleUpdate);
        }
      });
    };
  }, [authUser]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleClaim = () => {
    navigate('/support');
  };

  // Filtrar e ordenar solicitações (mais recentes primeiro)
  // Combina histórico com pendentes (mantendo ids distintos)
  const combinedRequests = [...requests, ...pendingRequests];

  const filteredRequests = combinedRequests.filter((req) => {
    const statusMatch = matchesStatusFilter(req.status, statusFilter);
    return statusMatch;
  });

  const sortedRequests = [...filteredRequests].sort(
    (a, b) => getSortableTimestamp(b) - getSortableTimestamp(a)
  );

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);

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
          <h2 className="ba-requests-title">📊 Historial de Transacciones</h2>
        </div>

        {/* Filtros por Status */}
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
          </div>
        </div>

        {/* Tabela */}
        <div className="ba-requests-table-container">
          {currentItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#888',
                fontSize: '16px',
              }}
            >
              No hay transacciones registradas
            </div>
          ) : (
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
                          req.status === 'Exitosa'
                            ? 'success'
                            : req.status === 'Pendiente'
                            ? 'pending'
                            : 'rejected'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.canClaim ? (
                        <button
                          className="ba-action-btn danger"
                          onClick={handleClaim}
                        >
                          Ir a reclamar
                        </button>
                      ) : (
                        <span style={{ color: '#888' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Paginação */}
          {currentItems.length > 0 && (
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
