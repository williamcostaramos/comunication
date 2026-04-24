import request from 'src/service/request'

export function ListarCobrancas (params) {
  return request({
    url: '/charges',
    method: 'get',
    params
  })
}

export function ConsultarCobranca (chargeId) {
  return request({
    url: `/charges/${chargeId}`,
    method: 'get'
  })
}

export function CriarCobranca (data) {
  return request({
    url: '/charges',
    method: 'post',
    data
  })
}

export function AtualizarCobranca (chargeId, data) {
  return request({
    url: `/charges/${chargeId}`,
    method: 'put',
    data
  })
}

export function RegistrarPagamento (chargeId, data) {
  return request({
    url: `/charges/${chargeId}/pay`,
    method: 'post',
    data
  })
}

export function DeletarCobranca (chargeId) {
  return request({
    url: `/charges/${chargeId}`,
    method: 'delete'
  })
}

export function ImportarCobrancasLote (data) {
  return request({
    url: '/charges/import',
    method: 'post',
    data,
    timeout: 120000
  })
}

// ===== CHARGE SEQUENCES =====

export function ListarChargeSequences (params) {
  return request({
    url: '/charge-sequences',
    method: 'get',
    params
  })
}

export function ConsultarChargeSequence (sequenceId) {
  return request({
    url: `/charge-sequences/${sequenceId}`,
    method: 'get'
  })
}

export function CriarChargeSequence (data) {
  return request({
    url: '/charge-sequences',
    method: 'post',
    data
  })
}

export function AtualizarChargeSequence (sequenceId, data) {
  return request({
    url: `/charge-sequences/${sequenceId}`,
    method: 'put',
    data
  })
}

export function DeletarChargeSequence (sequenceId) {
  return request({
    url: `/charge-sequences/${sequenceId}`,
    method: 'delete'
  })
}

export function IniciarChargeSequence (sequenceId) {
  return request({
    url: `/charge-sequences/${sequenceId}/start`,
    method: 'post',
    data: {}
  })
}

export function CancelarChargeSequence (sequenceId) {
  return request({
    url: `/charge-sequences/${sequenceId}/cancel`,
    method: 'post',
    data: {}
  })
}

export function AdicionarContatosChargeSequence (sequenceId, data) {
  return request({
    url: `/charge-sequences/${sequenceId}/contacts`,
    method: 'post',
    data
  })
}

export function ListarContatosChargeSequence (sequenceId) {
  return request({
    url: `/charge-sequences/${sequenceId}/contacts`,
    method: 'get'
  })
}

export function PararCobrancaContato (sequenceId, contactId, data) {
  return request({
    url: `/charge-sequences/${sequenceId}/contacts/${contactId}/stop`,
    method: 'post',
    data
  })
}

export function RemoverContatoChargeSequence (sequenceId, contactId) {
  return request({
    url: `/charge-sequences/${sequenceId}/contacts/${contactId}`,
    method: 'delete'
  })
}
