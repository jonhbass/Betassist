/**
 * Script para popular dados de exemplo no histórico
 * Execute no console do navegador: populateExampleHistory()
 */

window.populateExampleHistory = function () {
  const authUser = sessionStorage.getItem('authUser') || 'tute4279';

  const exampleHistory = [
    // Bonificação de boas-vindas
    {
      id: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 dias atrás
      user: authUser,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleString(
        'es-AR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      ),
      amount: 12000,
      type: 'Bonificaciones',
      message: 'Bonificación de bienvenida',
      status: 'Exitosa',
      canClaim: false,
    },

    // Depósito bem-sucedido
    {
      id: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 dias atrás
      user: authUser,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleString(
        'es-AR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      ),
      amount: 5000,
      type: 'Recarga',
      message: 'Solicitud de recarga',
      status: 'Exitosa',
      canClaim: false,
    },

    // Depósito rejeitado
    {
      id: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 dias atrás
      user: authUser,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString(
        'es-AR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      ),
      amount: 10000,
      type: 'Recarga',
      message: 'Comprobante incorrecto',
      status: 'Rechazada',
      canClaim: true,
    },

    // Saque rejeitado automático
    {
      id: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 dias atrás
      user: authUser,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString(
        'es-AR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      ),
      amount: 5000,
      type: 'Retiros',
      message: 'Rechazo automático',
      status: 'Rechazada',
      canClaim: true,
    },

    // Saque bem-sucedido
    {
      id: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 dia atrás
      user: authUser,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString(
        'es-AR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      ),
      amount: 8000,
      type: 'Retiros',
      message: 'Solicitud de retiro',
      status: 'Exitosa',
      canClaim: false,
    },

    // Depósito manual do admin
    {
      id: Date.now() - 12 * 60 * 60 * 1000, // 12 horas atrás
      user: authUser,
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      amount: 15000,
      type: 'Recarga',
      message: 'Recarga manual desde administrador',
      status: 'Exitosa',
      canClaim: false,
    },
  ];

  // Mesclar com histórico existente (se houver)
  const currentHistory = JSON.parse(
    localStorage.getItem('USER_HISTORY') || '[]'
  );
  const mergedHistory = [...currentHistory, ...exampleHistory];

  localStorage.setItem('USER_HISTORY', JSON.stringify(mergedHistory));

  console.log('✅ Histórico de exemplo populado!');
  console.log(`📊 Total de transações: ${mergedHistory.length}`);
  console.log('🔍 Abra o modal "Historial" para visualizar');

  return mergedHistory;
};

// Instruções
console.log('💡 Para popular dados de exemplo, execute no console:');
console.log('   populateExampleHistory()');
