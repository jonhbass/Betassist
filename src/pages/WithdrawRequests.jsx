import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import '../css/RequestsPanel.css';
import { getServerUrl } from '../utils/serverUrl';

export default function WithdrawRequests() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [requests, setRequests] = useState([]);
  const [adminMessages, setAdminMessages] = useState({});

  // Carregar solicitações do servidor
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/withdrawals`);
        if (res.ok) {
          const data = await res.json();
          setRequests(Array.isArray(data) ? data : []);
        } else {
          // Fallback para localStorage
          const stored = localStorage.getItem('WITHDRAW_REQUESTS');
          if (stored) {
            const parsed = JSON.parse(stored);
            setRequests(Array.isArray(parsed) ? parsed : []);
          } else {
            setRequests([]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar solicitações:', error);
        // Fallback para localStorage
        const stored = localStorage.getItem('WITHDRAW_REQUESTS');
        if (stored) {
          const parsed = JSON.parse(stored);
          setRequests(Array.isArray(parsed) ? parsed : []);
        } else {
          setRequests([]);
        }
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

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminUsername');
    navigate('/login');
  };

  const handleApprove = async (req) => {
    const adminMessage = adminMessages[req.id] || 'Solicitud de retiro';

    if (
      window.confirm(
        `¿Aprobar retiro de ${req.user} por $${req.amount.toLocaleString(
          'es-AR'
        )}?`
      )
    ) {
      // Atualizar status da solicitação
      const updatedReq = { ...req, status: 'Aprobada', adminMessage };
      const updatedRequests = requests.map((r) =>
        r.id === req.id ? updatedReq : r
      );
      setRequests(updatedRequests);

      // Persistir no servidor
      const serverUrl = getServerUrl();
      try {
        await fetch(`${serverUrl}/withdrawals/${req.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Aprobada', adminMessage }),
        });
      } catch (e) {
        console.error('Erro ao atualizar retirada no servidor', e);
      }
      // Fallback localStorage
      localStorage.setItem(
        'WITHDRAW_REQUESTS',
        JSON.stringify(updatedRequests)
      );

      // Adicionar ao histórico do usuário
      const history = JSON.parse(localStorage.getItem('USER_HISTORY') || '[]');
      history.push({
        id: Date.now(),
        user: req.user,
        date: new Date().toLocaleString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        amount: req.amount,
        type: 'Retiros',
        message: adminMessage,
        status: 'Exitosa',
        canClaim: false,
      });
      localStorage.setItem('USER_HISTORY', JSON.stringify(history));

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
                `💸 Retiro aprobado: ${req.user} - Saldo anterior: $${currentBalance} → Nuevo saldo: $${newBalance}`
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

      // Atualizar limite diário de retirada do usuário
      try {
        await fetch(`${serverUrl}/users/${req.user}/daily-withdraw`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: req.amount,
            action: 'add',
          }),
        });
      } catch (err) {
        console.warn('Não foi possível atualizar limite diário:', err);
      }

      // Removido: criação local de notificação (servidor já emite notification:new)

      alert(`✅ Retiro de ${req.user} aprobado y saldo actualizado`);
    }
  };

  const handleReject = async (req) => {
    const adminMessage = adminMessages[req.id] || 'Rechazo automático';

    if (
      window.confirm(
        `¿Rechazar retiro de ${req.user} por $${req.amount.toLocaleString(
          'es-AR'
        )}?`
      )
    ) {
      const updatedReq = { ...req, status: 'Rechazada', adminMessage };
      const updatedRequests = requests.map((r) =>
        r.id === req.id ? updatedReq : r
      );
      setRequests(updatedRequests);

      // Persistir no servidor
      const serverUrl = getServerUrl();
      try {
        await fetch(`${serverUrl}/withdrawals/${req.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Rechazada', adminMessage }),
        });
      } catch (e) {
        console.error('Erro ao atualizar retirada no servidor', e);
      }
      // Fallback localStorage
      localStorage.setItem(
        'WITHDRAW_REQUESTS',
        JSON.stringify(updatedRequests)
      );

      // Adicionar ao histórico do usuário
      const history = JSON.parse(localStorage.getItem('USER_HISTORY') || '[]');
      history.push({
        id: Date.now(),
        user: req.user,
        date: new Date().toLocaleString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        amount: req.amount,
        type: 'Retiros',
        message: adminMessage,
        status: 'Rechazada',
        canClaim: true,
      });
      localStorage.setItem('USER_HISTORY', JSON.stringify(history));

      // Removido: criação local de notificação de rejeição (servidor já emite)

      alert(`❌ Retiro de ${req.user} rechazado`);
    }
  };

  // Filtrar solicitudes
  const filteredRequests = requests
    .filter((req) => {
      return statusFilter === 'Todas' || req.status === statusFilter;
    })
    .sort((a, b) => b.id - a.id); // Ordenar por mais recentes primeiro

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

  const handleClearHistory = () => {
    const processedCount = requests.filter(
      (r) => r.status === 'Aprobada' || r.status === 'Rechazada'
    ).length;

    if (processedCount === 0) {
      alert('No hay solicitudes procesadas para limpiar');
      return;
    }

    if (
      window.confirm(
        `¿Eliminar ${processedCount} solicitud(es) procesada(s) del historial?\n\nLos saldos de los usuarios NO serán afectados.`
      )
    ) {
      // Manter apenas solicitações pendentes
      const pendingRequests = requests.filter((r) => r.status === 'Pendiente');
      setRequests(pendingRequests);
      localStorage.setItem(
        'WITHDRAW_REQUESTS',
        JSON.stringify(pendingRequests)
      );
      setCurrentPage(1);
      alert(`✅ ${processedCount} solicitud(es) eliminada(s) del historial`);
    }
  };

  return (
    <div className="ba-requests-panel-page">
      <Topbar adminMode={true} onLogout={handleLogout} />

      <main className="ba-requests-panel-main">
        <div className="ba-requests-header">
          <button className="ba-btn-back" onClick={handleBack}>
            ← Volver
          </button>
          <h2 className="ba-requests-title">💸 Solicitudes de Retiro</h2>
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
            <button
              className="ba-filter-btn"
              onClick={handleClearHistory}
              style={{
                marginLeft: 'auto',
                backgroundColor: '#dc2626',
                color: 'white',
              }}
              title="Eliminar solicitudes procesadas (Aprobadas/Rechazadas)"
            >
              🗑️ Limpiar Historial
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
                <th>Mensaje</th>
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
                    {req.status === 'Pendiente' ? (
                      <input
                        type="text"
                        placeholder="Mensaje (opcional)"
                        value={adminMessages[req.id] || ''}
                        onChange={(e) =>
                          setAdminMessages({
                            ...adminMessages,
                            [req.id]: e.target.value,
                          })
                        }
                        style={{
                          width: '150px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          border: '1px solid #444',
                          borderRadius: '4px',
                          background: '#1a1a2e',
                          color: '#fff',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '12px', color: '#aaa' }}>
                        {req.adminMessage || '-'}
                      </span>
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
      </main>

      <Footer />
    </div>
  );
}
