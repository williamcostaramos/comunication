const contatos = {
  state: {
    contatos: [],
    loading: false
  },
  mutations: {
    SET_LOADING (state, loading) {
      state.loading = loading
    },
    LOAD_CONTACTS (state, payload) {
      const contacts = payload
      const newContacts = []
      contacts.forEach(contact => {
        const contactIndex = state.contatos.findIndex(c => c.id === contact.id)
        if (contactIndex !== -1) {
          state.contatos[contactIndex] = contact
        } else {
          newContacts.push(contact)
        }
      })
      state.contatos = [...state.contatos, ...newContacts]
    },
    UPDATE_CONTACTS (state, payload) {
      const contact = payload
      const contactIndex = state.contatos.findIndex(c => c.id === contact.id)
      if (contactIndex !== -1) {
        state.contatos[contactIndex] = contact
      } else {
        state.contatos = [contact, ...state.contatos]
      }
    },
    DELETE_CONTACT (state, payload) {
      const contactId = payload
      const contactIndex = state.contatos.findIndex(c => c.id === contactId)
      if (contactIndex !== -1) {
        state.contatos.splice(contactIndex, 1)
      }
      state.contatos = [...state.contatos]
    },
    RESET_CONTACT (state) {
      state.contatos = []
    }
  },
  getters: {
    todosContatos: state => state.contatos
  },
  actions: {
    async carregarContatos ({ commit }, searchTerm = '') {
      try {
        const { ListarContatos } = await import('src/service/contatos')
        commit('SET_LOADING', true)
        const params = searchTerm ? { search: searchTerm } : {}
        const response = await ListarContatos(params)
        const contatos = Array.isArray(response.data) ? response.data : response.data.data || response.data.contacts || []
        commit('LOAD_CONTACTS', contatos)
      } catch (error) {
        console.error('Erro ao carregar contatos:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}

export default contatos
