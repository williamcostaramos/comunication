<template>
  <q-dialog
    persistent
    :value="modalEmpresa"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <div class="text-h6">{{ empresa.id ? 'Editar' : 'Cadastrar' }} Empresa</div>
      <q-card-section>
        <q-input
          class="row col"
          rounded
          outlined
          dense
          v-model="empresa.name"
          label="Nome da Empresa"
        />
      </q-card-section>
      <q-card-section>
        <div class="col-12">
          <q-select
            outlined
            rounded
            dense
            v-model="empresa.status"
            :options="optionsStatus"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Status"
          />
        </div>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          rounded
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          rounded
          label="Salvar"
          color="positive"
          @click="handleEmpresa"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {minLength, required} from 'vuelidate/lib/validators'

export default {
  name: 'ModalEmpresa',
  props: {
    modalEmpresa: {
      type: Boolean,
      default: false
    },
    empresaEdit: {
      type: Object,
      default: () => {
        return { id: null }
      }
    },
    status: {
      type: String,
      default: 'active'
    }

  },
  data () {
    return {
      optionsStatus: [{
        value: 'active',
        label: 'Ativo'
      }, {
        value: 'desactive',
        label: 'Desativo'
      }],
      empresa: {
        name: '',
        status: 'active',
        businessHours: ''
      }
    }
  },
  validations () {
    return {
      name: {
        required,
        minlength: minLength(3)
      },
      status: {
        required
      }
    }
  },
  methods: {
    abrirModal () {
      if (this.empresaEdit.id) {
        this.empresa = { ...this.empresaEdit }
      }
    },
    fecharModal () {
      this.$emit('update:modalEmpresa', false)
      this.empresa = {
        name: '',
        status: '',
        businessHours: ''
      }
      this.$v.empresa.$reset()
    },
    handleEmpresa () {
    }
  }
}
</script>

<style scoped lang="scss">

</style>
