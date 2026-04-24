# 💰 Feature de Cobrança (Charges)

## Visão Geral

A feature de cobrança permite registrar, gerenciar e acompanhar cobranças associadas a contatos ou tickets. Cada cobrança pode ter múltiplos pagamentos registrados e acompanha o histórico completo de transações.

## Estrutura

### Model: Charge

```typescript
interface Charge {
  id: number;
  description: string;           // Descrição da cobrança
  amount: number;                // Valor total da cobrança
  contractNumber?: string;       // Número do contrato
  dueDate?: Date;                // Data de vencimento
  status: string;                // Status: pending | overdue | paid | canceled
  fileUrl?: string;              // URL do arquivo anexado (PDF, documento)
  notes?: string;                // Observações adicionais
  paymentHistory: Array<{        // Histórico de pagamentos
    amount: number;
    date: Date;
    method: string;              // cash | credit_card | debit_card | bank_transfer | other
    reference?: string;
  }>;
  contactId?: number;            // Associação com Contato
  ticketId?: number;             // Associação com Ticket
  tenantId: string | number;     // ID do tenant
  createdAt: Date;
  updatedAt: Date;
}
```

## Endpoints da API

### 1. Listar Cobranças

```http
GET /charges
```

**Query Parameters:**
- `searchParam` (optional): Busca por descrição, número de contrato ou notas
- `pageNumber` (optional): Número da página (padrão: 1)
- `contactId` (optional): Filtrar por ID do contato
- `ticketId` (optional): Filtrar por ID do ticket
- `status` (optional): Filtrar por status (pending, overdue, paid, canceled)

**Response:**
```json
{
  "charges": [
    {
      "id": 1,
      "description": "Débito de serviço",
      "amount": 500.00,
      "status": "pending",
      "dueDate": "2026-04-12",
      "contact": {
        "id": 1,
        "name": "João Silva",
        "number": "5511999999999"
      },
      "createdAt": "2026-03-12T10:00:00Z"
    }
  ],
  "count": 10,
  "hasMore": true
}
```

---

### 2. Criar Cobrança

```http
POST /charges
Content-Type: application/json

{
  "description": "Débito de serviço prestado",
  "amount": 500.00,
  "contractNumber": "CONTRACT-2026-001",
  "dueDate": "2026-04-12T00:00:00Z",
  "fileUrl": "https://cdn.example.com/contrato.pdf",
  "notes": "Pagável em 30 dias",
  "contactId": 1,
  "ticketId": null
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "description": "Débito de serviço prestado",
  "amount": 500.00,
  "contractNumber": "CONTRACT-2026-001",
  "dueDate": "2026-04-12T00:00:00Z",
  "status": "pending",
  "fileUrl": "https://cdn.example.com/contrato.pdf",
  "notes": "Pagável em 30 dias",
  "paymentHistory": [],
  "contactId": 1,
  "ticketId": null,
  "createdAt": "2026-03-12T10:00:00Z",
  "updatedAt": "2026-03-12T10:00:00Z"
}
```

**Validações:**
- `description`: Obrigatório, mínimo 3 caracteres
- `amount`: Obrigatório, deve ser positivo
- Pelo menos `contactId` ou `ticketId` deve ser fornecido

---

### 3. Visualizar Cobrança

```http
GET /charges/:chargeId
```

**Response:**
```json
{
  "id": 1,
  "description": "Débito de serviço prestado",
  "amount": 500.00,
  "contractNumber": "CONTRACT-2026-001",
  "status": "pending",
  "contact": {
    "id": 1,
    "name": "João Silva",
    "number": "5511999999999",
    "email": "joao@example.com"
  },
  "ticket": null,
  "paymentHistory": [],
  "createdAt": "2026-03-12T10:00:00Z",
  "updatedAt": "2026-03-12T10:00:00Z"
}
```

---

### 4. Atualizar Cobrança

```http
PUT /charges/:chargeId
Content-Type: application/json

{
  "description": "Débito atualizado",
  "amount": 550.00,
  "status": "overdue",
  "notes": "Vencida em 30/03/2026"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "description": "Débito atualizado",
  "amount": 550.00,
  "status": "overdue",
  "contractNumber": "CONTRACT-2026-001",
  "dueDate": "2026-04-12T00:00:00Z",
  "notes": "Vencida em 30/03/2026",
  "fileUrl": "https://cdn.example.com/contrato.pdf",
  "paymentHistory": [],
  "contactId": 1,
  "ticketId": null,
  "createdAt": "2026-03-12T10:00:00Z",
  "updatedAt": "2026-03-12T12:30:00Z"
}
```

**Status Válidos:** `pending`, `overdue`, `paid`, `canceled`

---

### 5. Registrar Pagamento

```http
POST /charges/:chargeId/pay
Content-Type: application/json

{
  "amount": 250.00,
  "method": "bank_transfer",
  "reference": "TRF-2026-001"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "description": "Débito de serviço prestado",
  "amount": 500.00,
  "status": "pending",
  "paymentHistory": [
    {
      "amount": 250.00,
      "date": "2026-03-12T12:45:00Z",
      "method": "bank_transfer",
      "reference": "TRF-2026-001"
    }
  ],
  "createdAt": "2026-03-12T10:00:00Z",
  "updatedAt": "2026-03-12T12:45:00Z"
}
```

**Métodos de Pagamento Válidos:**
- `cash`
- `credit_card`
- `debit_card`
- `bank_transfer`
- `other`

**Lógica:**
- Quando o total pago é igual ao valor da cobrança, o status muda para `paid`
- Pode-se registrar múltiplos pagamentos parciais
- Não é possível pagar uma cobrança já marcada como paga ou cancelada

---

### 6. Deletar Cobrança

```http
DELETE /charges/:chargeId
```

**Response:** `200 OK`
```json
{
  "message": "Charge deleted"
}
```

---

## Eventos de Socket

A feature emite eventos em tempo real usando Socket.io no padrão `tenantId:charge`:

### Criação
```json
{
  "action": "create",
  "charge": { /* objeto completo da cobrança */ }
}
```

### Atualização
```json
{
  "action": "update",
  "charge": { /* objeto completo da cobrança */ }
}
```

### Pagamento
```json
{
  "action": "pay",
  "charge": { /* objeto completo da cobrança */ }
}
```

### Exclusão
```json
{
  "action": "delete",
  "chargeId": 1
}
```

**Exemplo de listener no frontend:**
```javascript
const socket = io();
socket.on(`${tenantId}:charge`, (data) => {
  console.log(`Charge ${data.action}:`, data.charge);
});
```

---

## Serviços (Business Logic)

O projeto segue a arquitetura em camadas:

### CreateChargeService
Responsável por:
- Validação de dados com Yup
- Verificação de existência de Contact/Ticket
- Criação da cobrança com status padrão "pending"

### ListChargesService
Responsável por:
- Listagem com paginação (20 itens por página)
- Filtros por contactId, ticketId, status
- Busca por texto em descrição, contractNumber e notes
- Ordenação por data de criação (descendente)

### ShowChargeService
Responsável por:
- Recuperação detalhada de uma cobrança
- Incluir dados do Contact e Ticket relacionados
- Lançar erro 404 se não encontrada

### UpdateChargeService
Responsável por:
- Validação de campos atualizáveis
- Validação de status válidos
- Atualização seletiva de campos

### PayChargeService
Responsável por:
- Validação do método de pagamento
- Registro do pagamento no histórico
- Cálculo automático do novo status
- Rejeitar pagamentos em cobranças finalizadas

### DeleteChargeService
Responsável por:
- Exclusão lógica da cobrança
- Validação de existência

---

## Controller

O `ChargeController` atua como handler thin:
- Extrai dados da requisição
- Valida autenticação via middleware `isAuth`
- Chama serviço apropriado
- Emite evento de socket
- Retorna resposta JSON

---

## Exemplo de Uso Completo

### 1. Criar Cobrança
```bash
curl -X POST http://localhost:3100/charges \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Serviço de consultoria",
    "amount": 1500.00,
    "contractNumber": "CONS-2026-001",
    "dueDate": "2026-04-15T23:59:59Z",
    "contactId": 5,
    "notes": "Pagável em 30 dias da emissão"
  }'
```

### 2. Listar Cobranças Pendentes
```bash
curl -X GET "http://localhost:3100/charges?status=pending&pageNumber=1" \
  -H "Authorization: Bearer TOKEN"
```

### 3. Registrar Pagamento Parcial
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

### 4. Atualizar Status para Vencida
```bash
curl -X PUT http://localhost:3100/charges/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "overdue",
    "notes": "Vencimento: 15/04/2026"
  }'
```

---

## Tratamento de Erros

Todos os erros seguem o padrão `AppError`:

```json
{
  "error": "Error message",
  "status": 400
}
```

**Erros Comuns:**
- `400`: Validação falhou (descrição/valor inválido)
- `400`: Either contactId or ticketId must be provided
- `404`: Contact not found
- `404`: Ticket not found
- `404`: Charge not found
- `400`: Cannot pay a canceled charge
- `400`: Charge is already paid

---

## Migrations

Para aplicar as migrations:
```bash
npm run db:migrate
```

Para desfazer:
```bash
npx sequelize db:migrate:undo
```

---

## Padrões Utilizados

✅ **Clean Architecture** - Separação clara entre controllers, services e models  
✅ **Single Responsibility** - Cada service tem uma responsabilidade  
✅ **Yup Validation** - Validação robusta de dados de entrada  
✅ **AppError** - Tratamento centralizado de erros  
✅ **Socket Events** - Notificações em tempo real  
✅ **TypeScript** - Type safety completo  
✅ **Paginação** - Suporte a listagens grandes  
✅ **Relacionamentos** - Links com Contact e Ticket  

---

## Testes

```bash
npm test -- ChargeServices
```

Os testes cobrem:
- Criação com dados válidos
- Validação de campos obrigatórios
- Validação de valores positivos
- Verificação de contactId/ticketId obrigatório
