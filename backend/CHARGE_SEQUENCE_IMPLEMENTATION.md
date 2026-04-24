# Sistema de Cobranças Recorrentes - Documentação Técnica

## Visão Geral

O sistema de **Charge Sequence** funciona de forma similar ao de campanhas, mas com a capacidade de enviar mensagens de cobrança **continuamente** até que um contato seja marcado para parar de receber.

## Arquitetura

### Modelos

#### ChargeSequence
Representa uma sequência de cobrança com configurações de envio:
- `name`: Nome da sequência
- `message`: Mensagem de cobrança a ser enviada
- `start`: Data/Hora de início
- `status`: pending, scheduled, processing, canceled, finished
- `recurrenceType`: Tipo de recorrência (daily, weekly, monthly, indefinite)
- `recurrenceInterval`: Número de dias/semanas/meses entre envios
- `mediaUrl`: Mídia opcional (comprovante, documento, etc)
- `delay`: Delay entre mensagens para um mesmo contato
- `active`: Se está ativa ou não
- `sessionId`: Sessão WhatsApp a usar
- `tenantId`: Tenant owner
- `userId`: Usuário que criou

#### ChargeSequenceContact
Rastreia o status de cada contato na sequência:
- `chargeSequenceId`: ID da sequência
- `contactId`: ID do contato
- `chargeId`: ID da cobrança relacionada (opcional)
- `stopCharging`: **Flag para parar de cobrar este contato**
- `reason`: Motivo da parada (pago, desistiu, etc)
- `sendCount`: Quantas vezes foi enviado
- `lastSentAt`: Última vez que recebeu mensagem
- `lastAckAt`: Última atualização de ACK

## Fluxo de Funcionamento

### 1️⃣ Criar Sequência de Cobrança

```
POST /charge-sequences
{
  "name": "Cobrança Mensal",
  "start": "2026-04-01T09:00:00Z",
  "message": "Prezado {{name}}, sua cobrança no valor de R$ 100,00 venceu. Favor realizar o pagamento.",
  "sessionId": 1,
  "delay": 20000,
  "recurrenceType": "monthly",
  "recurrenceInterval": 1
}
```

Status inicial: `pending`

### 2️⃣ Adicionar Contatos

```
POST /charge-sequences/{chargeSequenceId}/contacts
{
  "contacts": [
    { "id": 1, "chargeId": 100 },
    { "id": 2, "chargeId": 101 }
  ]
}
```

Cria registros em `ChargeSequenceContact` com `stopCharging: false`

### 3️⃣ Iniciar Sequência

```
POST /charge-sequences/{chargeSequenceId}/start
```

**O que acontece:**
1. Busca todos os contatos com `stopCharging: false`
2. Para cada contato, calcula a próxima data de envio respeitando:
   - Intervalo de horário (8h às 20h)
   - `recurrenceType` e `recurrenceInterval`
3. Adiciona à fila com job `SendMessageWhatsappChargeSequence`
4. Muda status para `scheduled` e depois `processing`

### 4️⃣ Envio Contínuo (Job)

O job `SendMessageWhatsappChargeSequence`:
- Executa periodicamente conforme configurado
- **Antes de enviar**, verifica se `stopCharging: false`
- Se `stopCharging: true`, pula o envio
- Incrementa `sendCount`
- Atualiza `lastSentAt`
- Usa retry automático (15 tentativas, 10 min entre tentativas)

### 5️⃣ Parar Cobrança de um Contato

```
POST /charge-sequences/{chargeSequenceId}/contacts/{contactId}/stop
{
  "reason": "Cobrança Paga"
}
```

**O que acontece:**
- Define `stopCharging: true`
- Salva o motivo em `reason`
- Próximas tentativas de envio serão puladas automaticamente

## Tipos de Recorrência

### Daily (Diário)
- Envia a cada `recurrenceInterval` dias
- Exemplo: `recurrenceInterval: 3` = a cada 3 dias

### Weekly (Semanal)
- Envia a cada `recurrenceInterval` semanas
- Exemplo: `recurrenceInterval: 2` = a cada 2 semanas

### Monthly (Mensal)
- Envia a cada `recurrenceInterval` meses
- Exemplo: `recurrenceInterval: 1` = mensalmente

### Indefinite (Indefinido)
- Envia a cada `recurrenceInterval` dias (padrão 3 se não informado)
- Até que seja marcado para parar

## Casos de Uso

### 1. Cobrança Recorrente Mensal
```
POST /charge-sequences
{
  "name": "Mensalidade",
  "start": "2026-04-01T09:00:00Z",
  "message": "Vencimento do seu contrato",
  "recurrenceType": "monthly",
  "recurrenceInterval": 1
}
```

### 2. Cobranças Crescentes (Escalação)
```
Dia 1: Envio inicial (stopCharging: false)
Dia 4: Reenvio (reccurenceInterval: 3)
Dia 7: 3º envio
Dia 10+: Continua enviando até ser marcado para parar
```

### 3. Cobrança Semanal até Pagamento
```
POST /charge-sequences
{
  "name": "Débito Semanal",
  "recurrenceType": "weekly",
  "recurrenceInterval": 1  // A cada semana
}

// Quando pago:
POST /charge-sequences/{id}/contacts/{contactId}/stop
{ "reason": "Débito realizado" }
```

## Endpoints

### CRUD Básico
- `GET /charge-sequences` - Listar
- `POST /charge-sequences` - Criar
- `PUT /charge-sequences/{id}` - Atualizar configurações
- `DELETE /charge-sequences/{id}` - Deletar

### Controle de Execução
- `POST /charge-sequences/{id}/start` - Iniciar envios
- `POST /charge-sequences/{id}/cancel` - Cancelar tudo

### Gerenciamento de Contatos
- `POST /charge-sequences/{id}/contacts` - Adicionar contatos
- `POST /charge-sequences/{id}/contacts/{contactId}/stop` - Parar cobrança de um contato

## Status da Sequência

- `pending` → Criada, aguardando início
- `scheduled` → Agendada para enviar
- `processing` → Enviando mensagens
- `canceled` → Cancelada pelo usuário
- `finished` → Todos os contatos tiveram `stopCharging: true`

## Resumo das Diferenças vs Campaign

| Aspecto | Campaign | Charge Sequence |
|---------|----------|-----------------|
| Envios | Uma única vez por contato | Contínuo/Repetido |
| Mensagens | 3 mensagens aleatórias | Uma mensagem |
| Parar | Automático ao terminar | Manual com flag |
| Recorrência | Não tem | Diária/Semanal/Mensal/Indefinida |
| Use Cases | Promoções, avisos | Cobranças, lembretes |

