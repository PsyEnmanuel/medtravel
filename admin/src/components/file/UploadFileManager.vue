<template>
  <div
    class="flex flex-col justify-center items-center bg-white rounded-2xl w-full p-4 text-center border-2 border-dashed hover:border-sky-300 cursor-pointer"
    :class="{ 'bg-sky-100': isDragging }" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop">
    <input class="hidden w-full h-full" :id="`fileElem-${file_type}`" ref="myFiles" type="file" multiple
      @change="handleFiles" />
    <label class="w-full h-full flex justify-center items-center flex-col" :for="`fileElem-${file_type}`">
      <q-icon class="mb-2" :name="icon" size="48px" color="primary"></q-icon>
      <p class="text-lg">{{ text }}</p>
      <div v-if="avaliable_file_text" class="text-sm max-w-[300px] text-center mt-2" v-html="avaliable_text"></div>
    </label>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { useUpload } from 'src/use/upload'
const { uploadFiles } = useUpload()
import { ref } from 'vue';
const $q = useQuasar()
const myFiles = ref()
const isDragging = ref(false)
const $emit = defineEmits(['close'])
const props = defineProps({
  ref_id: Number,
  table: String,
  file_type: {
    type: String,
    default: `GENERAL`
  },
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
    default: `<b>Se aceptan:&nbsp;</b>Imágenes, videos, documentos (PDF, WORD, EXCEL Y DICOM)`
  }
});

function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

async function onDrop(event) {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  await uploadFiles({
    ref_key: props.table,
    ref_id: props.ref_id,
    file_type: props.file_type,
    files
  })

  $q.notify({
    type: 'success',
    message: 'Archivo subido'
  })

  $emit('close')
}

async function handleFiles() {
  const files = []
  for (let i = 0; i < myFiles.value.files.length; i++) {
    const file = myFiles.value.files[i];
    files.push(file)
  }

  await uploadFiles({
    ref_key: props.table,
    ref_id: props.ref_id,
    file_type: props.file_type,
    files
  });

  $q.notify({
    type: 'success',
    message: 'Archivo subido'
  })

  $emit('close')

}
</script>