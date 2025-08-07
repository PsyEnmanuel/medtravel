<template>
  <input class="hidden" id="fileElem" ref="myFilesAnalytic" type="file" multiple @change="handleFiles" />
  <label
    class="flex flex-col justify-center items-center bg-white rounded-2xl w-full p-8 border-2 border-dashed hover:border-primary fill-primary-light hover:fill-primary cursor-pointer"
    for="fileElem">
    <svg aria-hidden="true" style="height: 32px;" class="mb-2">
      <use href="#icon-file-upload" />
    </svg>
    <p class="text-lg">Click aquí para subir análisis</p>
    <div class="text-sm max-w-[300px] text-center mt-2">
      <b>Se aceptan:&nbsp;</b>solo análisis en formato <b>PDF</b>
    </div>
  </label>
</template>

<script setup lang="ts">
import { useUpload } from 'src/use/upload'
import { ref } from 'vue';

const { uploadFiles } = useUpload()
const myFilesAnalytic = ref()
const props = defineProps({
  table: String,
  insured: Object
});

async function handleFiles() {
  const files = []
  for (let i = 0; i < myFilesAnalytic.value.files.length; i++) {
    const file = myFilesAnalytic.value.files[i];
    files.push(file)
  }
  uploadFiles({
    ref_key: props.table,
    insured: props.insured,
    ref_id: 0,
    files,
    url: 'file/analytic',
  });
}
</script>