<template>
  <q-dialog
    persistent
    :value="modalSequencia"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      class="q-pa-sm"
      style="min-width: 70vw;"
    >
      <q-card-section class="q-pa-none q-px-md">
        <div class="text-h6 text-bold">{{ sequenciaEdicao.id ? 'Editar' : 'Criar' }} Sequência de Cobrança</div>
        <div class="row">
          As mensagens sempre serão enviadas em horário comercial (8h às 20h).
        </div>
      </q-card-section>
      <q-card-section class="q-pb-none">
        <div class="row q-gutter-sm">
          <q-input
            outlined
            dense
            rounded
            style="width: 500px"
            v-model="sequencia.name"
            label="Nome da Sequência"
            @blur="$v.sequencia.name.$touch"
            :error="$v.sequencia.name.$error"
            error-message="Obrigatório"
          />
          <q-datetime-picker
            style="width: 200px"
            dense
            rounded
            hide-bottom-space
            outlined
            stack-label
            bottom-slots
            label="Data/Hora início"
            mode="datetime"
            color="primary"
            format24h
            v-model="sequencia.start"
            @blur="$v.sequencia.start.$touch"
            :error="$v.sequencia.start.$error"
            error-message="Não pode ser inferior ao dia atual"
          />
          <q-select
            rounded
            dense
            outlined
            emit-value
            map-options
            label="Enviar por"
            color="primary"
            v-model="sequencia.sessionId"
            :options="cSessions"
            :input-debounce="700"
            option-value="id"
            option-label="name"
            input-style="width: 280px; max-width: 280px;"
            @blur="$v.sequencia.sessionId.$touch"
            :error="$v.sequencia.sessionId.$error"
            error-message="Obrigatório"
            style="width: 250px"
          />
          <q-input
            rounded
            outlined
            dense
            style="width: 160px"
            v-model="sequencia.delay"
            input-class="text-right"
            suffix="ms"
            label="Delay"
            error-message="Obrigatório"
          />
        </div>
      </q-card-section>

      <q-card-section class="q-pb-none">
        <div class="row q-gutter-sm">
          <q-select
            rounded
            outlined
            dense
            emit-value
            map-options
            label="Tipo de Recorrência"
            color="primary"
            v-model="sequencia.recurrenceType"
            :options="recurrenceTypes"
            option-value="value"
            option-label="label"
            style="width: 200px"
          />
          <q-input
            v-if="sequencia.recurrenceType !== 'indefinite'"
            rounded
            outlined
            dense
            type="number"
            style="width: 160px"
            v-model.number="sequencia.recurrenceInterval"
            :label="`Intervalo (${getIntervalUnit()})`"
            input-class="text-right"
          />
          <q-file
            v-if="!sequencia.mediaUrl"
            dense
            rounded
            :loading="loading"
            label="Mídia (opcional)"
            ref="PickerFileMessage"
            v-model="arquivos"
            class="col-grow"
            bg-color="blue-grey-1"
            input-style="max-height: 30vh"
            outlined
            clearable
            autogrow
            append
            :max-files="1"
            counter
            :max-file-size="10485760"
            accept=".jpg, .png, image/jpeg, .pdf, .doc, .docx, .mp4, .xls, .xlsx, .jpeg, .zip, .ppt, .pptx, image/*"
            @rejected="onRejectedFiles"
            style="width: 350px"
          />
          <q-input
            v-if="sequencia.mediaUrl"
            readonly
            rounded
            label="Mídia"
            :value="cArquivoName"
            class="col-grow"
            bg-color="blue-grey-1"
            input-style="max-height: 30vh"
            outlined
            autogrow
            append
            counter
            style="width: 350px"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="close"
                @click="sequencia.mediaUrl = null; arquivos = []"
              />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <label class="text-heading text-bold">Mensagem de Cobrança</label>
        <q-input
          outlined
          dense
          rounded
          type="textarea"
          bottom-slots
          v-model="sequencia.message"
          label="Escrever mensagem"
          counter
          maxlength="1000"
          @blur="$v.sequencia.message.$touch"
          :error="$v.sequencia.message.$error"
          error-message="Obrigatório"
          style="width: 100%; min-height: 150px"
        />
        <div class="text-caption text-grey q-mt-sm" v-pre>
          Use <code>{{name}}</code> para inserir o nome do contato na mensagem
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md text-primary">
        <q-btn
          flat
          label="Cancelar"
          color="negative"
          @click="fecharModal"
        />
        <q-btn
          flat
          label="Salvar"
          color="primary"
          :loading="loading"
          @click="salvarSequencia"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import { CriarChargeSequence, AtualizarChargeSequence } from 'src/service/charges'

const isValidDate = (value) => {
  const date = new Date(value)
  return date >= new Date()
}

export default {
  name: 'ModalSequenciaCobranca',
  props: {
    modalSequencia: {
      type: Boolean,
      default: false
    },
    sequenciaEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      loading: false,
      arquivos: [],
      sequencia: {
        name: null,
        start: null,
        message: null,
        mediaUrl: null,
        sessionId: null,
        delay: 20000,
        recurrenceType: 'monthly',
        recurrenceInterval: 1
      },
      recurrenceTypes: [
        { label: 'Diário', value: 'daily' },
        { label: 'Semanal', value: 'weekly' },
        { label: 'Mensal', value: 'monthly' },
        { label: 'Indefinido', value: 'indefinite' }
      ]
    }
  },
  validations: {
    sequencia: {
      name: { required },
      start: { required, isValidDate },
      message: { required },
      sessionId: { required }
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cSessions () {
      return this.whatsapps.filter(w => w.type === 'whatsapp' && !w.isDeleted)
    },
    cArquivoName () {
      if (!this.sequencia.mediaUrl) return ''
      const split = this.sequencia.mediaUrl.split('/')
      const name = split[split.length - 1]
      return name
    }
  },
  methods: {
    getIntervalUnit () {
      switch (this.sequencia.recurrenceType) {
        case 'daily':
          return 'dias'
        case 'weekly':
          return 'semanas'
        case 'monthly':
          return 'meses'
        default:
          return 'dias'
      }
    },
    onRejectedFiles (rejectedEntries) {
      this.$notificarErro('Arquivo rejeitado. Verifique o tamanho ou formato.')
    },
    abrirModal () {
      if (this.sequenciaEdicao && this.sequenciaEdicao.id) {
        this.sequencia = {
          ...this.sequenciaEdicao,
          start: this.sequenciaEdicao.start
        }
      } else {
        this.sequencia = {
          name: null,
          start: null,
          message: null,
          mediaUrl: null,
          sessionId: null,
          delay: 20000,
          recurrenceType: 'monthly',
          recurrenceInterval: 1
        }
      }
    },
    fecharModal () {
      this.$v.$reset()
      this.$emit('update:modalSequencia', false)
    },
    async salvarSequencia () {
      this.$v.$touch()
      if (this.$v.$invalid) {
        this.$notificarErro('Verifique os campos obrigatórios.')
        return
      }

      this.loading = true

      try {
        console.log('Dados da sequência a serem salvos:', this.sequencia)
        const formData = new FormData()
        formData.append('name', this.sequencia.name)
        formData.append('start', this.sequencia.start)
        formData.append('message', this.sequencia.message)
        formData.append('sessionId', Number(this.sequencia.sessionId))
        formData.append('delay', Number(this.sequencia.delay))
        formData.append('recurrenceType', this.sequencia.recurrenceType)
        if (this.sequencia.recurrenceInterval) {
          formData.append('recurrenceInterval', Number(this.sequencia.recurrenceInterval))
        }

        if (this.arquivos && this.arquivos.type) {
          formData.append('medias', this.arquivos)
        }

        if (this.sequenciaEdicao && this.sequenciaEdicao.id) {
          await AtualizarChargeSequence(this.sequenciaEdicao.id, formData)
          this.$notificarSucesso('Sequência atualizada com sucesso!')
          this.$emit('modal-sequencia:editada', this.sequencia)
        } else {
          await CriarChargeSequence(this.sequencia)
          this.$notificarSucesso('Sequência criada com sucesso!')
          this.$emit('modal-sequencia:criada', this.sequencia)
        }

        this.fecharModal()
      } catch (err) {
        this.$notificarErro('Erro ao salvar sequência', err)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
