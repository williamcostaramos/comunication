import request from 'src/service/request'

export function MostrarHorariosAtendiemento () {
  return request({
    url: '/tenants/business-hours/',
    method: 'get'
  })
}

export function AtualizarHorariosAtendiemento (data) {
  return request({
    url: '/tenants/business-hours/',
    method: 'put',
    data
  })
}

export function AtualizarMensagemHorariosAtendiemento (data) {
  return request({
    url: '/tenants/message-business-hours/',
    method: 'put',
    data
  })
}

export function criarEmpresa (data) {
  return request({
    url: 'tenants/',
    method: 'post',
    data
  })
}

export function listaEmpresas () {
  return request({
    url: 'tenants',
    method: 'get'
  })
}
