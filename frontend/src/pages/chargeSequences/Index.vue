<template>
  <div>
    <q-table
      flat
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Sequências de Cobrança"
      :data="sequenciasCobranca"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[2]"
    >
      <template v-slot:top-right>
        <q-btn
          class="q-mr-md"
          color="black"
          icon="refresh"
          rounded
          @click="listarSequenciasCobranca"
        >
          <q-tooltip>
            Atualizar Listagem
          </q-tooltip>
        </q-btn>
        <q-btn
          rounded
          color="primary"
          label="Adicionar"
          @click="sequenciaEdicao = {}; modalSequencia = true"
        />
      </template>
      <template v-slot:body-cell-isActive="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :color="props.value ? 'green' : 'red'"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td class="text-center">
          <q-badge
            :label="status[props.value] || props.value"
            :color="statusColors[props.value] || 'grey'"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="mdi-account-details-outline"
            @click="contatosSequencia(props.row)"
          >
            <q-tooltip>
              Lista de Contatos da Sequência
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            v-if="['pending', 'canceled'].includes(props.row.status)"
            icon="mdi-calendar-clock"
            @click="iniciarSequencia(props.row)"
          >
            <q-tooltip>
              Programar Envio
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            v-if="['scheduled', 'processing'].includes(props.row.status)"
            icon="mdi-close-box-multiple"
            @click="cancelarSequencia(props.row)"
          >
            <q-tooltip>
              Cancelar Sequência
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="edit"
            @click="editarSequencia(props.row)"
          >
            <q-tooltip>
              Editar Sequência
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarSequencia(props.row)"
          >
            <q-tooltip>
              Excluir Sequência
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <ModalSequenciaCobranca
      v-if="modalSequencia"
      :modalSequencia.sync="modalSequencia"
      :sequenciaEdicao.sync="sequenciaEdicao"
      @modal-sequencia:criada="sequenciaCriada"
      @modal-sequencia:editada="sequenciaEditada"
    />
  </div>
</template>

<script>
import { CancelarChargeSequence, DeletarChargeSequence, IniciarChargeSequence, ListarChargeSequences } from 'src/service/charges'
import ModalSequenciaCobranca from './ModalSequenciaCobranca'
import { format, parseISO } from 'date-fns'

export default {
  name: 'SequenciasCobranca',
  components: {
    ModalSequenciaCobranca
  },
  data () {
    return {
      sequenciaEdicao: {},
      modalSequencia: false,
      sequenciasCobranca: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'name', label: 'Sequência', field: 'name', align: 'left' },
        { name: 'start', label: 'Início', field: 'start', align: 'center', format: (v) => format(parseISO(v), 'dd/MM/yyyy HH:mm') },
        { name: 'status', label: 'Status', field: 'status', align: 'center' },
        { name: 'recurrenceType', label: 'Recorrência', field: 'recurrenceType', align: 'center' },
        { name: 'chargeSequenceContacts', label: 'Qtd. Contatos', field: row => row.chargeSequenceContacts?.length || 0, align: 'center' },
        { name: 'active', label: 'Ativa', field: 'active', align: 'center', format: val => val ? 'Sim' : 'Não' },
        { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
      ],
      status: {
        pending: 'Pendente',
        scheduled: 'Programada',
        processing: 'Processando',
        canceled: 'Cancelada',
        finished: 'Finalizada'
      },
      statusColors: {
        pending: 'warning',
        scheduled: 'info',
        processing: 'blue',
        canceled: 'negative',
        finished: 'positive'
      }
    }
  },
  methods: {
    async listarSequenciasCobranca () {
      this.loading = true
      try {
        const { data } = await ListarChargeSequences()
        this.sequenciasCobranca = data.chargeSequences || []
      } catch (err) {
        this.$notificarErro('Erro ao listar sequências de cobrança', err)
      } finally {
        this.loading = false
      }
    },
    sequenciaCriada (sequencia) {
      this.listarSequenciasCobranca()
    },
    sequenciaEditada (sequencia) {
      this.listarSequenciasCobranca()
    },
    editarSequencia (sequencia) {
      if (sequencia.status !== 'pending' && sequencia.status !== 'canceled') {
        this.$notificarErro('Só é permitido editar sequências que estejam pendentes ou canceladas.')
      }
      this.sequenciaEdicao = {
        ...sequencia,
        start: sequencia.start
      }
      this.modalSequencia = true
    },
    deletarSequencia (sequencia) {
      if (sequencia.status !== 'pending' && sequencia.status !== 'canceled' && sequencia.chargeSequenceContacts?.length) {
        this.$notificarErro('Só é permitido deletar sequências que estejam pendentes ou canceladas e não possuam contatos vinculados.')
      }
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a Sequência "${sequencia.name}"?`,
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarChargeSequence(sequencia.id)
          .then(res => {
            let novasSequencias = [...this.sequenciasCobranca]
            novasSequencias = novasSequencias.filter(f => f.id !== sequencia.id)
            this.sequenciasCobranca = [...novasSequencias]
            this.$notificarSucesso(`Sequência ${sequencia.name} deletada!`)
          })
          .catch(err => {
            this.$notificarErro('Erro ao deletar sequência', err)
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    contatosSequencia (sequencia) {
      this.$router.push({
        name: 'contatos-sequencia',
        params: {
          chargeSequenceId: sequencia.id,
          sequencia
        }
      })
    },
    cancelarSequencia (sequencia) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente cancelar a Sequência "${sequencia.name}"?`,
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        CancelarChargeSequence(sequencia.id)
          .then(res => {
            this.$notificarSucesso('Sequência cancelada.')
            this.listarSequenciasCobranca()
          }).catch(err => {
            this.$notificarErro('Não foi possível cancelar a sequência.', err)
          })
      })
    },
    iniciarSequencia (sequencia) {
      if (new Date(sequencia.start) < new Date()) {
        this.$notificarErro('Não é possível programar sequência com data menor que a atual')
      }

      if (!sequencia.chargeSequenceContacts || sequencia.chargeSequenceContacts.length === 0) {
        this.$notificarErro('Necessário ter contatos vinculados para programar a sequência.')
      }

      if (sequencia.status !== 'pending' && sequencia.status !== 'canceled') {
        this.$notificarErro('Só é permitido programar sequências que estejam pendentes ou canceladas.')
      }

      IniciarChargeSequence(sequencia.id).then(res => {
        this.$notificarSucesso('Sequência iniciada.')
        this.listarSequenciasCobranca()
      }).catch(err => {
        this.$notificarErro('Não foi possível iniciar a sequência.', err)
      })
    }
  },
  mounted () {
    this.listarSequenciasCobranca()
  }
}
</script>
