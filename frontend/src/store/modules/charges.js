import * as ChargesService from 'src/service/charges'

const charges = {
  state: {
    charges: [],
    currentCharge: null,
    pagination: {
      page: 1,
      count: 0,
      hasMore: false
    },
    filters: {
      searchParam: '',
      status: null,
      contactId: null,
      ticketId: null
    },
    loading: false
  },
  mutations: {
    SET_CHARGES (state, payload) {
      // Ensure payload is always an array
      state.charges = Array.isArray(payload) ? payload : []
    },
    ADD_CHARGE (state, payload) {
      state.charges.unshift(payload)
    },
    UPDATE_CHARGE (state, payload) {
      const index = state.charges.findIndex(c => c.id === payload.id)
      if (index !== -1) {
        state.charges.splice(index, 1, payload)
      }
    },
    DELETE_CHARGE (state, chargeId) {
      const index = state.charges.findIndex(c => c.id === chargeId)
      if (index !== -1) {
        state.charges.splice(index, 1)
      }
    },
    SET_CURRENT_CHARGE (state, payload) {
      state.currentCharge = payload
    },
    SET_PAGINATION (state, payload) {
      state.pagination = payload
    },
    SET_FILTERS (state, payload) {
      state.filters = { ...state.filters, ...payload }
    },
    SET_LOADING (state, flag) {
      state.loading = flag
    },
    RESET_CHARGES (state) {
      state.charges = []
      state.currentCharge = null
      state.pagination = { page: 1, count: 0, hasMore: false }
    }
  },
  actions: {
    async carregarCobrancas ({ commit, state }, pageNumber = 1) {
      try {
        commit('SET_LOADING', true)
        const params = {
          pageNumber,
          ...state.filters
        }
        const response = await ChargesService.ListarCobrancas(params)
        // Ensure charges is always an array
        const charges = Array.isArray(response.data.charges)
          ? response.data.charges
          : Array.isArray(response.data)
            ? response.data
            : []
        commit('SET_CHARGES', charges)
        commit('SET_PAGINATION', {
          page: pageNumber,
          count: response.data.count || charges.length || 0,
          hasMore: response.data.hasMore || false
        })
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async carregarCobranca ({ commit }, chargeId) {
      const response = await ChargesService.ConsultarCobranca(chargeId)
      commit('SET_CURRENT_CHARGE', response.data)
      return response.data
    },
    async criarCobranca ({ commit }, data) {
      const response = await ChargesService.CriarCobranca(data)
      commit('ADD_CHARGE', response.data)
      return response.data
    },
    async atualizarCobranca ({ commit }, { chargeId, data }) {
      const response = await ChargesService.AtualizarCobranca(chargeId, data)
      commit('UPDATE_CHARGE', response.data)
      commit('SET_CURRENT_CHARGE', response.data)
      return response.data
    },
    async registrarPagamento ({ commit }, { chargeId, data }) {
      const response = await ChargesService.RegistrarPagamento(chargeId, data)
      commit('UPDATE_CHARGE', response.data)
      commit('SET_CURRENT_CHARGE', response.data)
      return response.data
    },
    async deletarCobranca ({ commit }, chargeId) {
      await ChargesService.DeletarCobranca(chargeId)
      commit('DELETE_CHARGE', chargeId)
    },
    definirFiltros ({ commit, dispatch }, filters) {
      commit('SET_FILTERS', filters)
      dispatch('carregarCobrancas', 1)
    },
    resetarCobrancas ({ commit }) {
      commit('RESET_CHARGES')
    }
  },
  getters: {
    todosCobrancas: state => state.charges,
    cobrancaAtual: state => state.currentCharge,
    carregandoCobrancas: state => state.loading,
    paginacao: state => state.pagination,
    totalCobrancas: state => state.pagination.count,
    temMais: state => state.pagination.hasMore,
    filtrosCobrancas: state => state.filters,
    cobrancasPendentes: state => state.charges.filter(c => c.status === 'pending'),
    cobrancasVencidas: state => state.charges.filter(c => c.status === 'overdue'),
    cobrancasPagas: state => state.charges.filter(c => c.status === 'paid'),
    totalPendente: state => {
      return state.charges
        .filter(c => c.status === 'pending' || c.status === 'overdue')
        .reduce((sum, c) => sum + c.amount, 0)
    }
  }
}

export default charges
