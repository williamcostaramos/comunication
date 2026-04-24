<template>
  <div>
    <q-card
      flat
      class="q-ma-sm"
    >
      <q-card-section>
        <div class="row text-h6">
          Sequência: {{ $route.params.sequencia.name }}
        </div>
        <div class="row text-caption">
          Início: {{ formatDate($route.params.sequencia.start) }} - Status: {{ $route.params.sequencia.status }}
        </div>
        <q-btn
          rounded
          class="absolute-top-right q-ma-md"
          icon="mdi-arrow-left"
          label="Listar Sequências"
          color="black"
          @click="$router.push({ name: 'chargeSequences' })"
        />
      </q-card-section>
    </q-card>
    <q-table
      class="my-sticky-dynamic q-ma-sm"
      title="Contatos"
      id="tabela-contatos-sequencia"
      :data="contatosSequencia"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
      separator="cell"
    >
      <template v-slot:top>
        <div class="row col-4 q-table__title items-center ">
          Contatos
        </div>
        <q-space />
        <q-btn
          rounded
          class="q-ml-md"
          color="black"
          icon="refresh"
          @click="listarContatosSequencia"
        >
          <q-tooltip>
            Atualizar Listagem
          </q-tooltip>
        </q-btn>
        <q-btn
          class="q-ml-md"
          color="primary"
          label="Incluir Contatos"
          icon="add"
          rounded
          v-if="$route.params.sequencia.status === 'pending' ||
            $route.params.sequencia.status === 'canceled'"
          @click="modalAddContatos = !modalAddContatos"
        />
      </template>
      <template v-slot:body-cell-profilePicUrl="props">
        <q-td>
          <q-avatar style="border: 1px solid #9e9e9ea1 !important">
            <q-icon
              name="mdi-account"
              size="1.5em"
              color="grey-5"
              v-if="!props.value"
            />
            <q-img
              :src="props.value"
              style="max-width: 150px"
            >
              <template v-slot:error>
                <q-icon
                  name="mdi-account"
                  size="1.5em"
                  color="grey-5"
                />
              </template>
            </q-img>
          </q-avatar>
        </q-td>
      </template>
      <template v-slot:body-cell-stopCharging="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            :color="props.value ? 'negative' : 'positive'"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            v-if="!props.row.stopCharging && ($route.params.sequencia.status === 'scheduled' || $route.params.sequencia.status === 'processing')"
            flat
            round
            icon="mdi-stop-circle-outline"
            color="negative"
            @click="pararCobranca(props.row)"
          >
            <q-tooltip>
              Parar Cobrança
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="$route.params.sequencia.status === 'pending' || $route.params.sequencia.status === 'canceled'"
            flat
            round
            icon="mdi-delete"
            @click="deletarContato(props.row)"
          >
            <q-tooltip>
              Remover Contato
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ contatosSequencia.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>

    <q-dialog
      persistent
      v-model="modalAddContatos"
    >
      <q-card style="min-width: 80vw; width: 80vw">
        <q-card-section class="q-pt-none q-pt-md">
          <fieldset class="rounded-all">
            <legend class="q-px-sm">Filtros (Data criação do contato)</legend>
            <div class="row q-gutter-md items-end">
              <div class="col-grow">
                <label>Início</label>
                <DatePick
                  dense
                  rounded
                  v-model="pesquisa.startDate"
                />
              </div>
              <div class="col-grow">
                <label>Final</label>
                <DatePick
                  dense
                  rounded
                  v-model="pesquisa.endDate"
                />
              </div>
              <div class="col-xs-12 col-sm-4 grow text-center">
                <q-select
                  label="Estado"
                  dense
                  rounded
                  outlined
                  v-model="pesquisa.ddds"
                  multiple
                  :options="estadosBR"
                  use-chips
                  option-value="sigla"
                  option-label="nome"
                  emit-value
                  map-options
                  dropdown-icon="add"
                >
                  <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                    <q-item
                      v-bind="itemProps"
                      v-on="itemEvents"
                    >
                      <q-item-section>
                        <q-item-label v-html="opt.nome"></q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-checkbox
                          :value="selected"
                          @input="toggleOption(opt)"
                        />
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="{ opt }">
                    <q-badge
                      dense
                      rounded
                      color="grey-3"
                      text-color="primary"
                      class="q-ma-xs text-body1"
                      :label="opt.nome"
                    >
                    </q-badge>
                  </template>
                </q-select>
              </div>
              <div class="col-xs-12 col-sm-4 grow text-center">
                <q-select
                  outlined
                  label="Etiqueta"
                  dense
                  rounded
                  v-model="pesquisa.tags"
                  multiple
                  :options="etiquetas"
                  use-chips
                  option-value="id"
                  option-label="tag"
                  emit-value
                  map-options
                  dropdown-icon="add"
                >
                  <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                    <q-item
                      v-bind="itemProps"
                      v-on="itemEvents"
                    >
                      <q-item-section>
                        <q-item-label v-html="opt.tag"></q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-checkbox
                          :value="selected"
                          @input="toggleOption(opt)"
                        />
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="{ opt }">
                    <q-chip
                      dense
                      rounded
                      color="white"
                      text-color="primary"
                      class="q-ma-xs text-body1"
                    >
                      <q-icon
                        :style="`color: ${opt.color}`"
                        name="mdi-pound-box-outline"
                        size="28px"
                        class="q-mr-sm"
                      />
                      {{ opt.tag }}
                    </q-chip>
                  </template>
                </q-select>
              </div>
              <div class="col-xs-12 col-sm-4 grow text-center">
                <q-input
                  style="width: 300px"
                  outlined
                  dense
                  rounded
                  v-model="pesquisa.searchParam"
                  clearable
                  placeholder="Filtrar Nome ou Telefone"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              <div class="col-grow text-right">
                <q-btn
                  class="q-mr-sm"
                  color="primary"
                  rounded
                  label="Gerar"
                  icon="refresh"
                  @click="listarAddContatos"
                />
              </div>
            </div>
          </fieldset>
        </q-card-section>
        <q-card-section>
          <q-table
            class="my-sticky-dynamic q-ma-sm"
            style="height: 50vh"
            title="Contatos"
            id="tabela-contatos-add"
            :data="contatosAdd"
            :columns="columnsAdd"
            :loading="loading"
            row-key="number"
            selection="multiple"
            :selected.sync="selected"
            :pagination.sync="paginationAdd"
            :rows-per-page-options="[0]"
            separator="cell"
          >
            <template v-slot:top>
              <div class="row col-4 q-table__title items-center ">
                Selecionar Contatos
              </div>
              <q-space />
              <q-btn
                rounded
                class="q-ml-md"
                color="negative"
                label="Cancelar"
                @click="modalAddContatos = false"
              />
              <q-btn
                rounded
                class="q-ml-md"
                color="positive"
                icon="save"
                label="Adicionar"
                @click="addContatos"
              />
            </template>
            <template v-slot:body-cell-profilePicUrl="props">
              <q-td>
                <q-avatar style="border: 1px solid #9e9e9ea1 !important">
                  <q-icon
                    name="mdi-account"
                    size="1.5em"
                    color="grey-5"
                    v-if="!props.value"
                  />
                  <q-img
                    :src="props.value"
                    style="max-width: 150px"
                  >
                    <template v-slot:error>
                      <q-icon
                        name="mdi-account"
                        size="1.5em"
                        color="grey-5"
                      />
                    </template>
                  </q-img>
                </q-avatar>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import DatePick from 'components/cDatePick.vue'
import { ListarEtiquetas } from 'src/service/etiquetas'
import { RelatorioContatos } from 'src/service/estatisticas'
import { estadoPorDdd, estadosBR } from 'src/utils/constants'
import { AdicionarContatosChargeSequence, ListarContatosChargeSequence, PararCobrancaContato } from 'src/service/charges'
import { format, parseISO, sub } from 'date-fns'

export default {
  name: 'ContatosSequenciaCobranca',
  components: {
    DatePick
  },
  data () {
    return {
      modalAddContatos: false,
      etiquetas: [],
      pesquisa: {
        startDate: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        ddds: [],
        tags: [],
        wallets: [],
        searchParam: ''
      },
      estadoPorDdd,
      estadosBR,
      contatosSequencia: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      paginationAdd: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'profilePicUrl', label: '', field: 'profilePicUrl', style: 'width: 50px', align: 'center' },
        { name: 'name', label: 'Nome', field: 'contact.name', align: 'left', style: 'width: 300px' },
        { name: 'number', label: 'WhatsApp', field: 'contact.number', align: 'center', style: 'width: 300px' },
        { name: 'sendCount', label: 'Enviadas', field: 'sendCount', align: 'center', style: 'width: 100px' },
        { name: 'lastSentAt', label: 'Último Envio', field: 'lastSentAt', align: 'center', format: (v) => v ? format(parseISO(v), 'dd/MM/yyyy HH:mm') : '-' },
        { name: 'stopCharging', label: 'Parado', field: 'stopCharging', align: 'center' },
        { name: 'reason', label: 'Motivo', field: 'reason', align: 'left' },
        { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
      ],
      columnsAdd: [
        { name: 'profilePicUrl', label: '', field: 'profilePicUrl', style: 'width: 50px', align: 'center' },
        { name: 'name', label: 'Nome', field: 'name', align: 'left', style: 'width: 300px' },
        { name: 'number', label: 'WhatsApp', field: 'number', align: 'center', style: 'width: 300px' }
      ],
      contatosAdd: [],
      selected: []
    }
  },
  methods: {
    formatDate (date, dateMask = 'dd/MM/yyyy HH:mm') {
      return format(parseISO(date), dateMask)
    },
    async listarAddContatos () {
      try {
        const { data } = await RelatorioContatos(this.pesquisa)
        this.contatosAdd = data.contacts
      } catch (err) {
        this.$notificarErro('Erro ao listar contatos', err)
      }
    },
    async listarEtiquetas () {
      try {
        const { data } = await ListarEtiquetas(true)
        this.etiquetas = data
      } catch (err) {
        this.$notificarErro('Erro ao listar etiquetas', err)
      }
    },
    async listarContatosSequencia () {
      this.loading = true
      try {
        const { data } = await ListarContatosChargeSequence(this.$route.params.chargeSequenceId)
        this.contatosSequencia = data
      } catch (err) {
        this.$notificarErro('Erro ao listar contatos', err)
      } finally {
        this.loading = false
      }
    },
    async addContatos () {
      try {
        await AdicionarContatosChargeSequence(this.$route.params.chargeSequenceId, { contacts: this.selected })
        this.listarContatosSequencia()
        this.modalAddContatos = false
        this.$notificarSucesso('Contatos adicionados com sucesso!')
      } catch (error) {
        this.$notificarErro('Erro ao adicionar contatos', error)
      }
    },
    deletarContato (contato) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente remover ${contato.contact.name} desta sequência?`,
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
        // TODO: Implementar deletar contato quando disponível na API
        this.$notificarSucesso('Contato removido')
        this.listarContatosSequencia()
      })
    },
    pararCobranca (contato) {
      this.$q.dialog({
        title: 'Parar Cobrança',
        message: 'Qual é o motivo da parada?',
        prompt: {
          model: '',
          type: 'text',
          label: 'Motivo (ex: Cobrança paga, Desistiu, etc)'
        },
        cancel: {
          label: 'Cancelar',
          color: 'negative',
          push: true
        },
        ok: {
          label: 'Parar',
          color: 'positive',
          push: true
        },
        persistent: true
      }).onOk((motivo) => {
        PararCobrancaContato(
          this.$route.params.chargeSequenceId,
          contato.id,
          { reason: motivo }
        )
          .then(() => {
            this.$notificarSucesso(`Cobrança parada para ${contato.contact.name}`)
            this.listarContatosSequencia()
          })
          .catch(err => {
            this.$notificarErro('Erro ao parar cobrança', err)
          })
      })
    }
  },
  mounted () {
    this.listarContatosSequencia()
    this.listarEtiquetas()
  }
}
</script>
