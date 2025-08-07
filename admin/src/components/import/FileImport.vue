<template>
  <div class="p-4">

    <div class="flex justify-between items-start gap-2 py-2">
      <div class="mb-2">
        <p class="text-2xl text-info">Importación <b class="font-bold text-brand">{{ $t(table) }}</b></p>
      </div>
      <q-btn flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
    </div>


    <div class="flex flex-nowrap gap-2">

      <div class="min-w-[400px]">
        <div
          class="flex flex-col mb-2 justify-center items-center bg-white rounded-2xl w-full p-4 text-center border-2 border-dashed hover:border-sky-300 cursor-pointer"
          :class="{ 'bg-sky-100': isDragging }" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop">
          <input class="hidden" :id="`fileElem`" ref="myFiles" type="file" multiple @change="handleFiles" />
          <label class="w-full h-full flex flex-col items-center justify-center" :for="`fileElem`">
            <q-icon class="mb-2" :name="icon" size="48px" color="primary"></q-icon>
            <p class="text-lg">{{ text }}</p>
            <div v-if="avaliable_file_text" class="text-sm max-w-[300px] text-center mt-2" v-html="avaliable_text">
            </div>
          </label>
        </div>
      </div>

      <div class="flex w-full gap-2 overflow-hidden">
        <div class="w-full">
          <div>
            <div class="subtitle">Información de importación</div>
            <div v-for="rule in state.tables[table].rules" :key="rule">
              <div>{{ rule }}</div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse border border-gray-300">
              <tr>
                <th class="text-center border min-w-[100px] px-2" v-for="(row, key) in state.tables[table].columnsKeys"
                  :key="row">{{ key
                  }}
                </th>
              </tr>
              <tr>
                <td class="text-center border min-w-[100px] px-2" v-for="(row, key) in state.tables[table].columnsKeys"
                  :key="row">{{ row
                  }}
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>

    </div>

    <div class="flex gap-2 my-2">
      <InsuranceSelect @setInsurance="setInsurance($event, row)" @clearInsurance="clearInsurance(row)"
        :model-value="state.item.insurance_description" />
        <!-- <div>
          <div class="subtitle text-xs">{{ $t('policy_type') }}</div>
          <q-option-group class="flex gap-1" size="xs" v-model="state.item.$policy_type_id" toggle-color="secondary"
            toggle-text-color="text-font" :options="$cats.policy_type" type="radio" />
        </div> -->
    </div>

    <div class="flex flex-nowrap items-start gap-2 border-right w-full">
      <div class="p-1 bg-gray-200">Cantidad Registros Nuevos</div>
      <div class="p-1 text-right ">{{ state.data.length }}</div>
    </div>
    <div class="mt-1" v-if="state.data.length">
      <TableProvider v-if="table === 't_provider'" :data="state.data" @close="$emit('close')" />
      <TableDoctor v-if="table === 't_doctor'" :data="state.data" @close="$emit('close')" />
      <TablePolicy v-if="table === 't_policy'" :data="state.data" @close="$emit('close')" />
    </div>
  </div>
</template>

<script setup>
import { useUpload } from 'src/use/upload'
import { inject, reactive, ref } from 'vue';
import TableProvider from './TableProvider.vue';
import { mapColumnsToLetters } from 'src/helpers';
import TableDoctor from './TableDoctor.vue';
import TablePolicy from './TablePolicy.vue';
import InsuranceSelect from '../select/InsuranceSelect.vue';
import { useQuasar } from 'quasar';

const { uploadFiles } = useUpload()
const $q = useQuasar()
const $api = inject("$api");
const $cats = inject("$cats");
const myFiles = ref()
const isDragging = ref(false)

const props = defineProps({
  table: String,
  icon: {
    type: String,
    default: `fa-duotone fa-solid fa-upload`
  },
  avaliable_file_text: {
    type: Boolean,
    default: true
  },
  text: {
    type: String,
    default: `Click aquí para subir archivos`
  },
  avaliable_text: {
    type: String,
    default: `<b>Se acepta: &nbsp; </b>documentos (EXCEL)`
  }
});
// const emits = defineEmits(['close'])
const state = reactive({
  data: [],
  tables: {
    t_policy: {
      columnsKeys: mapColumnsToLetters(["POLIZA", "CONTRATANTE", "NOMBRE TITULAR", "TIPO ASEGURADO", "PARENTESCO", "NOMBRE ASEGURADO", "CODIGO ASEGURANDO", "CEDULA/PASAPORTE", "SEXO", "FECHA DE NACIMIENTO", "EDAD", "EMAIL", "PLAN DE SEGURO", "TIPO DE PLAN DE SEGURO", "FRECUENCIA", "ÁREA", "PÓLIZA MODALIDAD", "DEDUCIBLE", "FECHA DE INICIO DE VALIDEZ", "FECHA LIMITE DE RENOVACION"]),
      rules: [
        '1. Se toma en cuenta el # de poliza para evitar duplicados.',
        '2. Solo se importara la primera hoja del excel.',
        '3. Las lineas del documento excel, deben seguir el siguiente orden para ser importadas.',
      ],
    },
    t_provider: {
      columnsKeys: mapColumnsToLetters(["description", "provider_type", "ambassador", "RNC/ID", "phone", "webpage", "address", "city", "state", "zipcode", "country", "combinado", "link_gps"]),
      rules: [
        '1. Se toma en cuenta el nombre del proveedor para evitar duplicados.',
        '2. Solo se importara la primera hoja del excel.',
        '3. Las lineas del documento excel, deben seguir el siguiente orden para ser importadas.',
      ],
    },
    t_doctor: {
      columnsKeys: mapColumnsToLetters(["name", "last_name", "NOMBRE COMPLETO", "email", "languages", "exequartur", "TIPO ATENCIÓN", "gender", "bio", "provider_ids", "ESPECIALIDAD", "subspecialities_ids"]),
      rules: [
        '1. Se toma en cuenta el nombre del médico para evitar duplicados.',
        '2. Solo se importara la primera hoja del excel.',
        '3. Las lineas del documento excel, deben seguir el siguiente orden para ser importadas.',
      ],
    },
  },
  item: {
    insurance_id: null,
    insurance_description: null
  }
})

async function setInsurance(id) {
  try {

    const insurance = await $api.get(`insurance/${id}`)

    state.item.insurance_id = insurance.id;
    state.item.insurance_description = insurance.description;

  } catch (error) {
    console.log(error);
  }
}

function clearInsurance() {
  try {
    state.item.insurance_id = null;
    state.item.insurance_description = null;
  } catch (error) {
    console.log(error);
  }
}

function validateImport() {
  if (props.table === 't_policy') {
    if (!state.item.insurance_id) {
      $q.notify({
        type: 'warning',
        message: 'Para continuar debe elegir un seguro medico'
      })
      return false
    }
  }
  return true
}

function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

async function onDrop(event) {
  $q.loading.show()
  isDragging.value = false
  if (!validateImport()) {
    myFiles.value.value = null
    return;
  }
  const files = Array.from(event.dataTransfer.files)
  state.data = await uploadFiles({
    url: `file/migration/${props.table}`,
    files,
    insurance_id: state.item.insurance_id,
    insurance: state.item.insurance_description,
    // $policy_type_id: state.item.$policy_type_id,
    // policy_type: state.item.policy_type,
  })
  myFiles.value.value = null
  if (!state.data.length) {
    $q.notify({
      type: 'warning',
      message: 'No hay records'
    })
  }
  $q.loading.hide()
}

async function handleFiles() {
  $q.loading.show()
  if (!validateImport()) {
    myFiles.value.value = null
    return;
  }
  const files = []
  for (let i = 0; i < myFiles.value.files.length; i++) {
    const file = myFiles.value.files[i];
    files.push(file)
  }
  state.data = await uploadFiles({
    url: `file/migration/${props.table}`,
    files,
    insurance_id: state.item.insurance_id,
    insurance: state.item.insurance_description,
    // $policy_type_id: state.item.$policy_type_id,
    // policy_type: state.item.policy_type,
  });
  myFiles.value.value = null
  if (!state.data.length) {
    $q.notify({
      type: 'warning',
      message: 'No hay records'
    })
  }
  $q.loading.hide()
}
</script>