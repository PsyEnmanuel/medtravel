<template>
  <div class="mt-2">
    <div class="subtitle mb-1">Archivos en la nube</div>
    <div class="flex justify-between md:flex-nowrap mb-2">
      <div class="flex flex-nowrap w-full gap-2">
        <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
          :placeholder="$t('search')">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn v-if="state.selected.length" flat class="button h-full bg-primary text-white" icon-right="sym_o_remove"
          :label="$isDesktop ? 'Remover' : ''" no-caps @click="onDeleteRows" />
      </div>
      <div v-if="$isDesktop" class="grid grid-flow-col auto-cols-max gap-2">
        <q-btn class="bg-transparent" flat no-caps>{{ itemsRange.start }} - {{ itemsRange.end
          }} de {{ state.pagination.rowsNumber }}</q-btn>
        <q-btn class="bg-transparent" icon="sym_o_first_page" flat @click="tableRef.firstPage()"></q-btn>
        <q-btn class="bg-transparent" icon="sym_o_navigate_before" flat @click="tableRef.prevPage()"></q-btn>
        <q-btn class="bg-transparent" icon="sym_o_navigate_next" flat @click="tableRef.nextPage()"></q-btn>
        <q-btn class="bg-transparent" icon="sym_o_last_page" flat @click="tableRef.lastPage()"></q-btn>
      </div>
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
            <div v-if="props.row.type.toUpperCase() === 'IMAGE'" @click="state.selectedFile = props.row; state.dialogFile = true;">
              <q-img class="w-full object-contain" :src="props.row.url" spinner-color="white" />
            </div>
            <div v-else-if="props.row?.icon.toUpperCase() === 'PDF'" @click="state.selectedFile = props.row; state.dialogPDF = true;">
              <q-img src="~assets/pdf.png"></q-img>
            </div>
            <div v-else-if="props.row?.icon.toUpperCase() === 'WORD'" @click="downloadResource(props.row.url, props.row.description)">
              <q-img src="~assets/word.png"></q-img>
            </div>
            <div v-else-if="props.row?.icon.toUpperCase() === 'EXCEL'" @click="downloadResource(props.row.url, props.row.description)">
              <q-img src="~assets/excel.png"></q-img>
            </div>
            <div v-else-if="props.row?.icon.toUpperCase() === 'DCM'" @click="downloadResource(props.row.url, props.row.description)">
              <q-img src="~assets/dcm.png"></q-img>
            </div>
          </div>

        </q-td>
      </template>
      <template v-slot:body-cell-description="props">
        <q-td :props="props">
          <div class="flex flex-col gap-1">
            <span>{{ props.row.description }}</span>
            <span class="text-xs">Fecha del documento: <b>{{ props.row.file_date }}</b></span>
            <span class="text-xs" v-if="props.row?.language?.length">Idioma: <b>{{ props.row?.language.join(', ')
                }}</b></span>
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
            <q-btn flat class="button bg-default text-primary rounded-md" label="consultar" no-caps
              @click="$router.push(`/archivos/consultar/${[props.row.id]}`)" />
            <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
              @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
            <q-btn flat class="button bg-default text-primary rounded-md" label="Descargar" no-caps
              @click="downloadResource(props.row.url, props.row.description)" />
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
    <q-dialog v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
      :transition-duration="100">
      <q-card>
        <FileWrite @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit
          :width="$isDesktop ? '800px' : '100%'" />
      </q-card>
    </q-dialog>
    <q-dialog v-model="state.dialogPDF" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
      :transition-duration="$isDesktop ? 100 : 0">
      <q-card>
        <ReadPDF :item="state.selectedFile" :width="$isDesktop ? '800px' : '100%'" @close="state.dialogPDF = false" />
      </q-card>
    </q-dialog>
    <q-dialog v-model="state.dialogFile">
      <q-card style="overflow: auto !important;">
        <img :src="state.selectedFile.url" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { downloadResource } from 'src/helpers';
import FileWrite from './FileWrite.vue'
import { inject, onMounted, reactive, ref, watch } from 'vue';
import NoData from '../table/NoData.vue';
import { useI18n } from 'vue-i18n';
import { useFilter } from 'src/use/filter';
import { useQuasar } from 'quasar';
import { useTable } from 'src/use/table';
import { useUpdateStore } from 'src/stores/update';
import ReadPDF from '../ReadPDF.vue';
import CategorySelect from '../select/CategorySelect.vue';
import FileCard from './FileCard.vue';
const { t } = useI18n();
const $cats = inject('$cats')
const $api = inject('$api')
const $q = useQuasar()
const tableRef = ref()

const options = reactive({
  file_type: $cats.value.file_type
})

const props = defineProps({
  refId: {
    type: Number,
    required: false,
  },
  refKey: {
    type: String,
    required: false,
  },
})

const state = reactive({
  dialogUrl: true,
  selectedFile: null,
  loading: true,
  selectedId: 0,
  selected: [],
  search: '',
  search_key: 'orlike:description',
  pagination: {
    sortBy: 'description',
    descending: false,
    page: 1,
    rowsPerPage: 20,
  },
  url: 'file',
  query: {
    groupBy: ['t_file.id'],
    where: {
      c_status: 4,
      ref_id: props.refId,
      ref_key: props.refKey,
      'ne:file_type': 'FOTO PERFIL'
    }
  },
  columns: [
    {
      name: 'file',
      required: true,
      label: '',
      align: 'left',
      field: t('id'),
      classes: 'min-w-[128px] max-w-[128px]'
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

async function setCategory($event, row) {
  try {
    await $api.put(`file/${row.id}`, {
      $file_type_id: $event
    })
    $q.notify({
      type: 'success',
      message: 'Tipo de archivo actualizado'
    })
  } catch (error) {
    console.log(error);
  }
}

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_file, (data) => {
  tableRef.value.requestServerInteraction()
  tableRef.value.clearSelection()
}, { deep: true })

</script>