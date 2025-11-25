import React, { useState, useEffect } from 'react';
import { getServerUrl } from '../utils/serverUrl';
import { ensureSocket } from '../utils/socket';

export default function HistoryModalContent({ onOpenSupport }) {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('Todas');
  const authUser = sessionStorage.getItem('authUser');

  useEffect(() => {
    const loadHistory = async () => {
      if (!authUser) return;
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/users/${authUser}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history || []);
        }
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    };

    loadHistory();

    const handleUpdate = (data) => {
      if (
        data.username &&
        data.username.toLowerCase() === authUser.toLowerCase()
      ) {
        if (data.history) setHistory(data.history);
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

  const handleClaim = () => {
    if (onOpenSupport) {
      onOpenSupport();
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filter === 'Todas') return true;
    return item.type === filter;
  });

  // Ordenar por data (mais recente primeiro)
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const idA = Number(a.id);
    const idB = Number(b.id);
    if (!isNaN(idA) && !isNaN(idB)) {
      return idB - idA;
    }
    // Fallback: tentar ordenar por data string se ID falhar
    try {
      const parseDate = (str) => {
        if (!str) return 0;
        const [datePart, timePart] = str.split(', ');
        const [day, month, year] = datePart.split('/');
        const [hour, minute, second] = (timePart || '00:00:00').split(':');
        return new Date(year, month - 1, day, hour, minute, second).getTime();
      };
      return parseDate(b.date) - parseDate(a.date);
    } catch (e) {
      return 0;
    }
  });

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#ffc107' }}>
        📊 Historial de Transacciones
      </h3>

      {/* Filtros */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setFilter('Todas')}
          style={{
            padding: '8px 16px',
            background: filter === 'Todas' ? '#ffc107' : '#2a2a3e',
            color: filter === 'Todas' ? '#000' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('Recarga')}
          style={{
            padding: '8px 16px',
            background: filter === 'Recarga' ? '#ffc107' : '#2a2a3e',
            color: filter === 'Recarga' ? '#000' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Recargas
        </button>
        <button
          onClick={() => setFilter('Retiros')}
          style={{
            padding: '8px 16px',
            background: filter === 'Retiros' ? '#ffc107' : '#2a2a3e',
            color: filter === 'Retiros' ? '#000' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Retiros
        </button>
        <button
          onClick={() => setFilter('Bonificaciones')}
          style={{
            padding: '8px 16px',
            background: filter === 'Bonificaciones' ? '#ffc107' : '#2a2a3e',
            color: filter === 'Bonificaciones' ? '#000' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Bonificaciones
        </button>
      </div>

      {/* Tabela */}
      {sortedHistory.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
          No hay transacciones registradas
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              minWidth: '600px',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #444' }}>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    color: '#ffc107',
                  }}
                >
                  Fecha y Hora
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    color: '#ffc107',
                  }}
                >
                  Monto
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    color: '#ffc107',
                  }}
                >
                  Tipo
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    color: '#ffc107',
                  }}
                >
                  Mensaje
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    color: '#ffc107',
                  }}
                >
                  Estado
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    color: '#ffc107',
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '12px', color: '#fff' }}>
                    {item.date}
                  </td>
                  <td
                    style={{
                      padding: '12px',
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                  >
                    $ {item.amount.toLocaleString('es-AR')}
                  </td>
                  <td style={{ padding: '12px', color: '#fff' }}>
                    {item.type}
                  </td>
                  <td
                    style={{ padding: '12px', color: '#aaa', fontSize: '14px' }}
                  >
                    {item.message || '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background:
                          item.status === 'Exitosa' ? '#4caf50' : '#f44336',
                        color: '#fff',
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {item.canClaim ? (
                      <button
                        onClick={() => handleClaim(item)}
                        style={{
                          padding: '6px 12px',
                          background: '#f44336',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
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
        </div>
      )}
    </div>
  );
}
