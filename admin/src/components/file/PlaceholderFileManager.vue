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
  <q-table :grid="!$isDesktop" hide-pagination :rows="state.rows" :columns="state.columns" row-key="id" ref="tableRef"
    @request="onRequest" flat selection="multiple" v-model:pagination="state.pagination"
    v-model:selected="state.selected" :selected-rows-label="getSelectedString" :loading="state.loading"
    rows-per-page-label="Lineas" :wrap-cells="true">
    <template v-slot:no-data="{ icon, message, filter }">
      <NoData :icon="icon" :message="message" :filter="filter" />
    </template>
    <template v-slot:body-cell-file="props">
      <q-td :props="props">

        <div class="cursor-pointer">
          <div @click="state.selectedFile = props.row; state.dialogFile = true;">
            <q-img class="w-full object-contain" :src="props.row.url" spinner-color="white" />
          </div>
        </div>

      </q-td>
    </template>
    <template v-slot:body-cell-description="props">
      <q-td :props="props">
        <div class="flex flex-col gap-1">
          <q-input dense outlined v-model="props.row.description" :label="$t('description') + '*'" :rules="[requiredInput]"
            hide-bottom-space type="textarea" :rows="3"></q-input>
        </div>
      </q-td>
    </template>
    <template v-slot:body-cell-file_type="props">
      <q-td :props="props">
        <CategorySelect class="mb-2" :model-value="props.row.file_type" refKey="file_type"
          @setCategory="setCategory($event, props.row)" @clearCategory="props.row.$file_type_id = null" add />
      </q-td>
    </template>

    <template v-slot:body-cell-action="props">
      <q-td :props="props">
        <div class="flex gap-2">
          <q-btn flat class="button bg-default text-primary rounded-md" label="Remover" no-caps
            @click="removeRow(props.row)" />
        </div>
      </q-td>
    </template>

    <template v-slot:item="props">
      <div class="q-py-xs col-xs-12" :style="props.selected ? 'transform: scale(0.95);' : ''">
        <FileCard :item="props.row" @close="state.dialogWrite = false" />
      </div>
    </template>

    <template v-slot:bottom v-if="!$isDesktop">
      <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
    </template>
  </q-table>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CategorySelect from '../select/CategorySelect.vue';
const { t } = useI18n();

const myFiles = ref()
const isDragging = ref(false)
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
const $emits = defineEmits(['update'])

const state = reactive({
  columns: [
    {
      name: 'file',
      required: true,
      label: '',
      align: 'left',
      field: t('id'),
      classes: 'w-[128px]'
    },
    {
      name: 'description',
      required: true,
      label: t('description'),
      align: 'left',
      field: 'description',
      sortable: true,
    },
    {
      name: 'file_type',
      required: true,
      label: t('file_type'),
      align: 'left',
      field: 'file_type',
      sortable: true,
    },
    {
      name: 'action',
      required: true,
      label: '',
      align: 'left',
      field: t('id'),
      classes: 'w-[100px]'
    },
  ],
  rows: []
})

function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(event) {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  for (let i = 0; i < myFiles.value.files.length; i++) {
    const file = myFiles.value.files[i];
    file.$file_type_id = 187
    file.file_type = 'GENERAL'
    file.description = file.name
    file.id = i + 1
    file.url = URL.createObjectURL(file);
  }
  state.rows = files
  $emits("update", state.rows)
}

function handleFiles() {
  const files = []
  for (let i = 0; i < myFiles.value.files.length; i++) {
    const file = myFiles.value.files[i];
    file.url = URL.createObjectURL(file);
    file.$file_type_id = 187
    file.file_type = 'GENERAL'
    file.description = file.name
    file.id = i + 1
    files.push(file)
  }
  state.rows = files;
  $emits("update", state.rows)

}
function removeRow(row) {
  const index = state.rows.findIndex(i => i.id === row.id);
  if (index !== -1) {
    state.rows.splice(index, 1)
  }
  $emits("update", state.rows)
}

</script>