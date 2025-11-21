# 🧪 Teste de Badges - AdminDashboard

## Problema

Os badges vermelhos não aparecem nos botões do sidebar admin.

## Passos para Testar

### 1. Abrir Console do Navegador (F12)

### 2. Criar Solicitação de Depósito Pendente

```javascript
// Adicionar depósito pendente
const deposits = JSON.parse(localStorage.getItem('DEPOSIT_REQUESTS') || '[]');
deposits.push({
  id: Date.now(),
  user: 'TestUser',
  date: new Date().toLocaleString('es-AR'),
  amount: 1000,
  cbu: '1234567890',
  holder: 'Test Holder',
  receipt: 'data:image/png;base64,test',
  status: 'Pendiente',
});
localStorage.setItem('DEPOSIT_REQUESTS', JSON.stringify(deposits));
console.log('✅ Depósito pendente adicionado!');
```

### 3. Criar Solicitação de Retirada Pendente

```javascript
// Adicionar retirada pendente
const withdraws = JSON.parse(localStorage.getItem('WITHDRAW_REQUESTS') || '[]');
withdraws.push({
  id: Date.now(),
  user: 'TestUser',
  date: new Date().toLocaleString('es-AR'),
  amount: 500,
  cbu: '0987654321',
  holder: 'Test Holder',
  status: 'Pendiente',
});
localStorage.setItem('WITHDRAW_REQUESTS', JSON.stringify(withdraws));
console.log('✅ Retirada pendente adicionada!');
```

### 4. Verificar Estado

```javascript
// Verificar depósitos
console.log(
  'DEPOSIT_REQUESTS:',
  JSON.parse(localStorage.getItem('DEPOSIT_REQUESTS') || '[]')
);

// Verificar retiradas
console.log(
  'WITHDRAW_REQUESTS:',
  JSON.parse(localStorage.getItem('WITHDRAW_REQUESTS') || '[]')
);
```

### 5. Limpar Tudo (se necessário)

```javascript
localStorage.removeItem('DEPOSIT_REQUESTS');
localStorage.removeItem('WITHDRAW_REQUESTS');
localStorage.removeItem('ADMIN_VIEWED_DEPOSITS');
localStorage.removeItem('ADMIN_VIEWED_WITHDRAWS');
console.log('✅ Tudo limpo!');
```

## O que Observar

1. **Console do navegador** deve mostrar:

   - `📊 Depósitos pendentes: X Total: Y`
   - `📊 Retiradas pendentes: X Total: Y`
   - `🔍 AdminSidebar props: { pendingDeposits: X, pendingWithdraws: Y, ... }`

2. **Sidebar** deve mostrar badges vermelhos pulsando nos botões:

   - 💰 Solicitações de Depósito (badge vermelho)
   - 💸 Solicitações de Retirada (badge vermelho)

3. **Badge desaparece** quando contador é 0

## Troubleshooting

Se os badges NÃO aparecem:

1. Verificar se `pendingDeposits > 0` no console
2. Verificar se os elementos `.ba-sidebar-badge` existem no DOM (inspecionar elemento)
3. Verificar se o CSS está sendo aplicado (color: #fff, background: #dc3545)
4. Recarregar a página (Ctrl+R)
