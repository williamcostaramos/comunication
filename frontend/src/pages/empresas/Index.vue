<template>
  <div>
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Empresas"
      :data="empresasList"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="initialPagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          label="Adicionar"
          rounded
          @click="abriModalEmpresa()"
        />
      </template>
      <template v-slot:body-cell-isActive="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            :color="props.value ? 'positive' : 'negative'"
          />
        </q-td>
      </template>
      <template>
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="edit"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
          />
        </q-td>
      </template>
    </q-table>
    <modal-empresa
      :modal-empresa.sync="modalEmpresa"
      :empresa-edit="empresaSelecionada"
    />
  </div>
</template>

<script>
import { format } from 'date-fns'
import ModalEmpresa from 'pages/empresas/ModalEmpresa.vue'
import { listaEmpresas } from 'src/service/empresas'

export default {
  name: 'IndexEmpresas',
  components: { ModalEmpresa },
  data () {
    return {
      columns: [{
        name: 'id',
        label: '#',
        field: 'id',
        align: 'left'
      }, {
        name: 'Nome',
        label: 'Nome',
        field: 'name',
        align: 'left',
        sortable: true
      }, {
        name: 'status',
        label: 'Status',
        field: 'status',
        align: 'left',
        format: val => val === 'active' ? 'ativo' : 'desativo'
      }, {
        name: 'Data Cadastro',
        label: 'Data Cadastro',
        field: 'createdAt',
        align: 'left',
        format: val => `${format(new Date(val), 'dd/MM/yyyy')}`
      }, {
        name: 'Data Atualizacao',
        label: 'Data Atualização',
        field: 'updatedAt',
        align: 'left',
        format: val => `${format(new Date(val), 'dd/MM/yyyy HH:mm:ss')}`
      }
      ],
      initialPagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 3
      },
      loading: true,
      empresaSelecionada: {},
      modalEmpresa: false,
      empresaEdit: {},
      empresasList: [],
      hours: []
    }
  },
  methods: {
    async loadData () {
      try {
        const data = await listaEmpresas()
        if (data.data) {
          this.empresasList = data.data
        }
      } catch (e) {
        console.log(e)
      }
      this.loading = false
    },
    async criarEmpresa () {

    },
    async abriModalEmpresa () {
      this.modalEmpresa = true
    }
  },
  mounted () {
    this.loadData()
  }

}
</script>

<style scoped lang="scss">

</style>
