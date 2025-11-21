# 📊 Sistema de Histórico de Transações - StarWin

## ✨ Funcionalidades Implementadas

### 1. **Campo de Mensagem nas Solicitações** (Admin)

Os administradores agora podem adicionar mensagens personalizadas ao aprovar/rejeitar solicitações:

- **Depósitos** (`/admin/deposit-requests`):

  - Campo de input "Mensaje" na tabela
  - Mensagem salva junto com aprovação/rejeição
  - Aparece no histórico do usuário

- **Retiradas** (`/admin/withdraw-requests`):
  - Mesmo comportamento dos depósitos
  - Mensagens customizáveis por transação

#### Exemplos de Mensagens:

- ✅ Aprovação: `"Solicitud de recarga"`, `"Recarga manual desde administrador"`
- ❌ Rejeição: `"Comprobante incorrecto"`, `"Rechazo automático"`

---

### 2. **Histórico de Transações** (Usuário)

#### Como acessar:

- Clique no botão **"Historial"** (🧾) na sidebar
- Abre um modal com todas as transações do usuário

#### Informações exibidas:

| Campo            | Descrição                              |
| ---------------- | -------------------------------------- |
| **Fecha y Hora** | Data/hora da transação                 |
| **Monto**        | Valor em pesos argentinos              |
| **Tipo**         | Recarga / Retiros / Bonificaciones     |
| **Mensaje**      | Mensagem do admin (ou padrão)          |
| **Estado**       | Exitosa (verde) / Rechazada (vermelho) |
| **Acciones**     | Botão "Ir a reclamar" se aplicável     |

#### Filtros disponíveis:

- 🔘 **Todas** - Mostra todas as transações
- 💰 **Recargas** - Apenas depósitos
- 💸 **Retiros** - Apenas saques
- 🎁 **Bonificaciones** - Apenas bônus

---

### 3. **Botão "Ir a reclamar"**

Aparece automaticamente para transações **rechazadas** (rejeitadas):

- ❌ Depósito rejeitado → usuário pode reclamar
- ❌ Retirada rejeitada → usuário pode reclamar

#### Comportamento:

1. Usuário clica em **"Ir a reclamar"**
2. Modal de histórico fecha
3. Redireciona para **/support** (chat de suporte)
4. Usuário pode conversar com admin sobre a rejeição

---

## 🔧 Estrutura Técnica

### localStorage Keys:

```javascript
USER_HISTORY; // Array de todas as transações
DEPOSIT_REQUESTS; // Solicitações de depósito (agora com adminMessage)
WITHDRAW_REQUESTS; // Solicitações de retirada (agora com adminMessage)
```

### Formato de Transação:

```javascript
{
  id: 1729872000000,           // Timestamp único
  user: "tute4279",             // Username
  date: "03/10/2025, 14:58",    // Formatado es-AR
  amount: 10000,                // Valor numérico
  type: "Recarga",              // Recarga | Retiros | Bonificaciones
  message: "Solicitud de recarga", // Mensagem do admin
  status: "Exitosa",            // Exitosa | Rechazada
  canClaim: false               // true se pode reclamar
}
```

---

## 📝 Como Usar (Admin)

### Aprovar Depósito com Mensagem:

1. Acesse **Admin Dashboard** → **Solicitações de Depósito**
2. Localize a solicitação pendente
3. Digite mensagem no campo **"Mensaje"** (opcional)
4. Clique em **"Aprobar"**
5. ✅ Usuário recebe saldo + entrada no histórico

### Rejeitar com Mensagem:

1. Digite mensagem explicativa (ex: `"Comprobante incorrecto"`)
2. Clique em **"Rechazar"**
3. ❌ Transação rejeitada + botão "Ir a reclamar" habilitado

---

## 🎁 Bonificações

Use o utilitário para adicionar bônus:

```javascript
import { addBonusToHistory } from '../utils/historyUtils';

// Adicionar $12.000 de bônus de boas-vindas
addBonusToHistory('tute4279', 12000, 'Bonificación de bienvenida');
```

Aparecerá no histórico do usuário como:

- Tipo: **Bonificaciones**
- Status: **Exitosa**
- Sem botão de reclamar

---

## 🚀 Melhorias Futuras

- [ ] Exportar histórico em PDF
- [ ] Filtro por data
- [ ] Paginação do histórico
- [ ] Notificações push para transações
- [ ] Histórico de reclamações resolvidas

---

## 🐛 Troubleshooting

**Histórico vazio?**

- Transações são salvas apenas após aprovação/rejeição pelo admin
- Bonificações devem ser adicionadas manualmente via código

**Botão "Ir a reclamar" não aparece?**

- Só aparece para transações com `canClaim: true`
- Apenas transações rejeitadas têm este flag

**Mensagem não salva?**

- Campo é opcional - se vazio, usa mensagem padrão
- Mensagem só é salva quando admin aprova/rejeita

---

**Desenvolvido para StarWin 🎯**
