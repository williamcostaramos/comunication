# 📋 Implementação - Feature de Cobrança

## ✅ O Que Foi Implementado

A feature de **Cobrança (Charges)** foi completamente desenvolvida seguindo a arquitetura e padrões do projeto.

### 1. **Model & Database**
- ✅ [Charge.ts](src/models/Charge.ts) - Modelo TypeScript com sequelize-typescript
- ✅ [20260312000000-create-charges.ts](src/database/migrations/20260312000000-create-charges.ts) - Migration completa
- ✅ Registrado em [database/index.ts](src/database/index.ts)
- ✅ Relacionamentos com Contact, Ticket e Tenant

### 2. **Services (Business Logic)**
- ✅ [CreateChargeService.ts](src/services/ChargeServices/CreateChargeService.ts)
- ✅ [ListChargesService.ts](src/services/ChargeServices/ListChargesService.ts) - Com paginação e filtros
- ✅ [ShowChargeService.ts](src/services/ChargeServices/ShowChargeService.ts)
- ✅ [UpdateChargeService.ts](src/services/ChargeServices/UpdateChargeService.ts)
- ✅ [DeleteChargeService.ts](src/services/ChargeServices/DeleteChargeService.ts)
- ✅ [PayChargeService.ts](src/services/ChargeServices/PayChargeService.ts) - Registra pagamentos

### 3. **Controller**
- ✅ [ChargeController.ts](src/controllers/ChargeController.ts) - 6 ações: index, store, show, update, pay, remove

### 4. **Routes**
- ✅ [chargeRoutes.ts](src/routes/chargeRoutes.ts) - Endpoints protegidos com autenticação
- ✅ Registrado em [routes/index.ts](src/routes/index.ts)

### 5. **Validação & Erro Handling**
- ✅ Yup schemas em cada service
- ✅ AppError lançado em casos de erro
- ✅ Status HTTP apropriados (201, 200, 404, 400)

### 6. **Real-time Notifications**
- ✅ Socket.io events em padrão `tenantId:charge`
- ✅ Actions: create, update, pay, delete
- ✅ Integrado em cada controller action

### 7. **Testes**
- ✅ [CreateChargeService.test.ts](src/__tests__/unit/services/ChargeServices/CreateChargeService.test.ts)

### 8. **Documentação**
- ✅ [CHARGE_API.md](docs/CHARGE_API.md) - Documentação completa com exemplos

---

## 🚀 Como Usar

### Criar uma Cobrança
```bash
curl -X POST http://localhost:3100/charges \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Serviço de consultoria",
    "amount": 1500.00,
    "contractNumber": "CONS-2026-001",
    "dueDate": "2026-04-15T23:59:59Z",
    "contactId": 5
  }'
```

### Listar Cobranças
```bash
curl -X GET "http://localhost:3100/charges?status=pending&pageNumber=1" \
  -H "Authorization: Bearer TOKEN"
```

### Registrar Pagamento
```bash
curl -X POST http://localhost:3100/charges/1/pay \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 750.00,
    "method": "bank_transfer",
    "reference": "TRF-123456"
  }'
```

---

## 📊 Campos da Cobrança

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `description` | string | ✅ | Descrição da cobrança (min 3 chars) |
| `amount` | decimal | ✅ | Valor total (deve ser > 0) |
| `contractNumber` | string | ❌ | Número do contrato |
| `dueDate` | date | ❌ | Data de vencimento |
| `status` | enum | ✅ | pending, overdue, paid, canceled |
| `fileUrl` | string | ❌ | URL do arquivo (PDF, documento) |
| `notes` | text | ❌ | Observações adicionais |
| `paymentHistory` | json | ✅ | Array de pagamentos registrados |
| `contactId` | int (FK) | ⚠️ | ID do contato (contactId ou ticketId obrigatório) |
| `ticketId` | int (FK) | ⚠️ | ID do ticket (contactId ou ticketId obrigatório) |
| `tenantId` | string/int | ✅ | ID do tenant |
| `createdAt` | timestamp | ✅ | Data de criação |
| `updatedAt` | timestamp | ✅ | Data de atualização |

---

## 🔄 Fluxo de Status

```
┌─────────┐
│ pending │ ◄────────────────┐
└────┬────┘                  │
     │                       │
  Pagar o  pagamento?       Cancelar?
  ├─ Parcial ──────────────┤
  └─ Total ──────────► PAID
  
  OVERDUE ◄── Vencer data ──┐
     │                      │
     └──────────────────────┘
     
  CANCELED (Estado Final)
  PAID (Estado Final)
```

---

## 📱 Socket Events

**Listener Frontend:**
```javascript
const socket = io();
socket.on(`${tenantId}:charge`, (data) => {
  if (data.action === 'create') {
    console.log('Nova cobrança:', data.charge);
  } else if (data.action === 'pay') {
    console.log('Pagamento registrado:', data.charge);
  }
});
```

---

## 🏗️ Padrões Utilizados

✅ **Clean Architecture** - Separação de responsabilidades  
✅ **Service Layer Pattern** - Lógica centralizada em services  
✅ **Single Responsibility** - Um service = Um uso  
✅ **Yup Validation** - Validação robusta  
✅ **AppError** - Tratamento centralizado de erros  
✅ **Socket.io Events** - Real-time updates  
✅ **TypeScript** - Type safety completo  
✅ **Paginação** - Suporte a grandes volumes  
✅ **Relacionamentos** - FK com Contact, Ticket, Tenant  

---

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Rodar testes da feature Charge
npm test -- ChargeServices

# Rodar com coverage
npm test -- --coverage
```

---

## 🔢 Endpoints Resumo

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/charges` | Listar cobranças (com filtros) |
| POST | `/charges` | Criar cobrança |
| GET | `/charges/:chargeId` | Visualizar cobrança |
| PUT | `/charges/:chargeId` | Atualizar cobrança |
| POST | `/charges/:chargeId/pay` | Registrar pagamento |
| DELETE | `/charges/:chargeId` | Deletar cobrança |

---

## 📝 Próximos Passos (Sugestões)

1. **Relatórios & Analytics**
   - Gráficos de cobranças por período
   - Total coletado vs pendente
   - Inadimplência

2. **Automação**
   - Jobs para marcar como vencida
   - Notificações automáticas de cobrança
   - Lembretes recorrentes

3. **Integração com Pagamento**
   - Stripe, GerenciadorDigital, etc.
   - Webhook para confirmação de pagamento

4. **Export & Import**
   - Exportar cobranças para Excel
   - Importar lotes de cobranças

5. **Dashboard**
   - Widget de cobranças pendentes
   - Histórico de pagamentos

---

## ✨ Destaques

🎯 **Zero erros de compilação** - `npm run build` ✅  
🔒 **Totalmente tipado** - TypeScript strict mode  
🛡️ **Validação robusta** - Yup schemas  
📡 **Real-time** - Socket.io integrado  
📊 **Relacionamentos** - Linked com Contact e Ticket  
🔐 **Autenticação** - isAuth middleware em todas rotas  
📚 **Documentação completa** - CHARGE_API.md com exemplos  

---

## 📧 Suporte

Para dúvidas sobre a implementação, consulte:
- [CHARGE_API.md](docs/CHARGE_API.md) - Documentação API
- [ChargeController.ts](src/controllers/ChargeController.ts) - Implementação
- [ChargeServices/](src/services/ChargeServices/) - Lógica de negócio
