import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import '../css/RequestsPanel.css';

export default function WithdrawRequests() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [requests, setRequests] = useState([]);

  // Carregar solicitações do localStorage
  useEffect(() => {
    const loadRequests = () => {
      try {
        const stored = localStorage.getItem('WITHDRAW_REQUESTS');
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
        `¿Aprobar retiro de ${req.user} por $${req.amount.toLocaleString(
          'es-AR'
        )}?`
      )
    ) {
      // Atualizar status da solicitação
      const updatedRequests = requests.map((r) =>
        r.id === req.id ? { ...r, status: 'Aprobada' } : r
      );
      setRequests(updatedRequests);
      localStorage.setItem(
        'WITHDRAW_REQUESTS',
        JSON.stringify(updatedRequests)
      );

      // Subtrair saldo do usuário
      try {
        const usersData = localStorage.getItem('USERS');
        if (usersData) {
          const users = JSON.parse(usersData);
          const updatedUsers = users.map((user) => {
            if (user.username === req.user) {
              const currentBalance = user.balance || 0;
              const newBalance = Math.max(0, currentBalance - req.amount);
              console.log(
                `💸 Retirada aprovada: ${req.user} - Saldo anterior: $${currentBalance} → Novo saldo: $${newBalance}`
              );
              return { ...user, balance: newBalance };
            }
            return user;
          });
          localStorage.setItem('USERS', JSON.stringify(updatedUsers));
        }
      } catch (error) {
        console.error('Erro ao atualizar saldo do usuário:', error);
      }

      // Criar notificação de retirada aprovada
      const notifications = JSON.parse(
        localStorage.getItem('WITHDRAW_NOTIFICATIONS') || '[]'
      );
      const newNotification = {
        id: Date.now(),
        user: req.user,
        amount: req.amount,
        date: new Date().toLocaleString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        read: false,
        type: 'withdraw-approved',
      };
      notifications.push(newNotification);
      localStorage.setItem(
        'WITHDRAW_NOTIFICATIONS',
        JSON.stringify(notifications)
      );

      alert(`✅ Retiro de ${req.user} aprobado y saldo actualizado`);
    }
  };

  const handleReject = (req) => {
    if (
      window.confirm(
        `¿Rechazar retiro de ${req.user} por $${req.amount.toLocaleString(
          'es-AR'
        )}?`
      )
    ) {
      const updatedRequests = requests.map((r) =>
        r.id === req.id ? { ...r, status: 'Rechazada' } : r
      );
      setRequests(updatedRequests);
      localStorage.setItem(
        'WITHDRAW_REQUESTS',
        JSON.stringify(updatedRequests)
      );
      alert(`❌ Retiro de ${req.user} rechazado`);
    }
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
          <h2 className="ba-requests-title">💸 Solicitações de Retirada</h2>
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
                <th>CBU/CVU</th>
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
