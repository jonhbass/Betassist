import React, { useState, useEffect } from 'react';
import { getServerUrl } from '../utils/serverUrl';
import { ensureSocket } from '../utils/socket';

const STATUS_MAP = {
  Rechazadas: ['rechazada', 'rechazado'],
  Aceptadas: ['exitosa', 'aprobada', 'aprobado', 'aceptada', 'aceptado'],
  Pendientes: ['pendiente', 'pending'],
  Solicitadas: ['solicitada', 'solicitado', 'solicitud'],
};

// Mapeamento de tipos para aceitar variações
const TYPE_MAP = {
  Recargas: ['recarga', 'recargas', 'deposito', 'depósito'],
  Retiros: ['retiro', 'retiros', 'saque', 'saques', 'withdrawal'],
  Bonificaciones: ['bonificacion', 'bonificaciones', 'bonus', 'bono'],
};

const normalizeText = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const matchesStatusFilter = (status, selectedFilter) => {
  if (selectedFilter === 'Todas') return true;
  const normalizedStatus = normalizeText(status);
  const allowedValues = STATUS_MAP[selectedFilter] || [];
  return allowedValues.some((token) => normalizedStatus === token);
};

const matchesTypeFilter = (type, selectedFilter) => {
  if (selectedFilter === 'Todas') return true;
  const normalizedType = normalizeText(type);
  const allowedValues = TYPE_MAP[selectedFilter] || [];
  return allowedValues.some((token) => normalizedType === token);
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

export default function HistoryModalContent({ onOpenSupport }) {
  const [history, setHistory] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Todas');
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
    const statusMatch = matchesStatusFilter(item.status, statusFilter);
    return statusMatch;
  });

  // Ordenar por data (mais recente primeiro)
  const sortedHistory = [...filteredHistory].sort(
    (a, b) => getSortableTimestamp(b) - getSortableTimestamp(a)
  );

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#ffc107' }}>
        📊 Historial de Transacciones
      </h3>

      {/* Filtros por Status */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setStatusFilter('Todas')}
          style={{
            padding: '8px 16px',
            background: statusFilter === 'Todas' ? '#ffc107' : '#2a2a3e',
            color: statusFilter === 'Todas' ? '#000' : '#fff',
            border:
              statusFilter === 'Todas'
                ? '2px solid #ffc107'
                : '2px solid transparent',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Todas
        </button>
        <button
          onClick={() => setStatusFilter('Rechazadas')}
          style={{
            padding: '8px 16px',
            background: statusFilter === 'Rechazadas' ? '#ffc107' : '#2a2a3e',
            color: statusFilter === 'Rechazadas' ? '#000' : '#fff',
            border:
              statusFilter === 'Rechazadas'
                ? '2px solid #ffc107'
                : '2px solid transparent',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Rechazadas
        </button>
        <button
          onClick={() => setStatusFilter('Aceptadas')}
          style={{
            padding: '8px 16px',
            background: statusFilter === 'Aceptadas' ? '#ffc107' : '#2a2a3e',
            color: statusFilter === 'Aceptadas' ? '#000' : '#fff',
            border:
              statusFilter === 'Aceptadas'
                ? '2px solid #ffc107'
                : '2px solid transparent',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Aceptadas
        </button>
        <button
          onClick={() => setStatusFilter('Pendientes')}
          style={{
            padding: '8px 16px',
            background: statusFilter === 'Pendientes' ? '#ffc107' : '#2a2a3e',
            color: statusFilter === 'Pendientes' ? '#000' : '#fff',
            border:
              statusFilter === 'Pendientes'
                ? '2px solid #ffc107'
                : '2px solid transparent',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Pendientes
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
