<template>
  <div class="grid grid-cols-3 gap-2 mb-1">
    <InsuranceSelect @setInsurance="setInsurance($event, row)" @clearInsurance="clearInsurance(row)"
      :model-value="state.item.insurance_description" />
  </div>
  <div
    class="flex flex-col justify-center items-center bg-white rounded-2xl w-full p-4 text-center border-2 border-dashed hover:border-sky-300 cursor-pointer"
    :class="{ 'bg-sky-100': isDragging }" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop">
    <input class="hidden" :id="`fileElem`" ref="myFiles" type="file" multiple @change="handleFiles" />
    <label class="w-full h-full flex flex-col items-center justify-center" :for="`fileElem`">
      <q-icon class="mb-2" :name="icon" size="48px" color="primary"></q-icon>
      <p class="text-lg">{{ text }}</p>
      <div v-if="avaliable_file_text" class="text-sm max-w-[300px] text-center mt-2" v-html="avaliable_text"></div>
    </label>
  </div>
  <div v-if="state.data.length" class="mt-1">
    <TablePolicy :data="state.data" />
  </div>
</template>

<script setup>
import InsuranceSelect from 'src/components/select/InsuranceSelect.vue';
import { useUpload } from 'src/use/upload'
import { inject, onMounted, reactive, ref } from 'vue';
import TablePolicy from './table-policy.vue';

const { uploadFiles } = useUpload()
const myFiles = ref()
const isDragging = ref(false)
const $api = inject("$api");

const props = defineProps({
  ref_id: Number,
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

const state = reactive({
  data: [],
  item: {
    insurance_id: 35,
    insurance_description: 'AETNA'
  }
})

function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

async function onDrop(event) {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  state.data = await uploadFiles({
    url: 'file/migration/policy',
    files,
    insurance_id: state.item.insurance_id,
    insurance: state.item.insurance_description,
  })
}

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

async function handleFiles() {
  const files = []
  for (let i = 0; i < myFiles.value.files.length; i++) {
    const file = myFiles.value.files[i];
    files.push(file)
  }
  state.data = await uploadFiles({
    url: 'file/migration/policy',
    files,
    insurance_id: state.item.insurance_id,
    insurance: state.item.insurance_description,
  });

}
</script>