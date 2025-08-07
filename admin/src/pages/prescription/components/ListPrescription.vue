<template>
    <div class="flex flex-nowrap items-stretch my-1">
        <q-input class="mr-2 w-full" dense outlined debounce="300" v-model="state.search" :placeholder="$t('search')">
            <template v-slot:append>
                <q-icon name="search" />
            </template>
        </q-input>
        <div class="grid grid-flow-col auto-cols-max gap-1">
            <q-btn v-if="state.selected.length" flat class="button-icon bg-red-300" icon-right="sym_o_remove" no-caps
                @click="onDeleteRows" />
            <q-btn class="bg-transparent text-xs px-2" flat no-caps>{{ itemsRange.start }} - {{ itemsRange.end
            }} de {{ state.pagination.rowsNumber }}</q-btn>
            <q-btn class="bg-transparent px-0" icon="sym_o_navigate_before" flat @click="tableRef.prevPage()"></q-btn>
            <q-btn class="bg-transparent px-0" icon="sym_o_navigate_next" flat @click="tableRef.nextPage()"></q-btn>
        </div>
    </div>
    <q-table grid hide-pagination hide-header :rows="state.rows" row-key="id" ref="tableRef" @request="onRequest" flat
        selection="multiple" v-model:pagination="state.pagination" :loading="state.loading"
        v-model:selected="state.selected" :selected-rows-label="getSelectedString" rows-per-page-label="Lineas"
        :rows-per-page-options="[10, 20, 50, 100]" :wrap-cells="true" no-data-label="No hay prescripciones">

        <template v-slot:no-data="{ icon, message, filter }">
            <NoData :icon="icon" :message="message" :filter="filter" />
        </template>

        <template v-slot:item="props">
            <div class="card px-3 py-2 col-xs-12 mb-1">
                <div class="flex justify-between w-full items-start text-xs">
                    <div class="flex items-start">
                        <q-checkbox class="mr-2" size="sm" dense v-model="props.selected" />
                        <div class="flex flex-col">
                            <span class="line-clamp-1 font-bold">{{ props.row.prescription_type }}</span>
                            <span class="line-clamp-1">{{ props.row.prescription_date_format }}</span>
                            <div class="text-xs mb-1">{{ props.row.doctor_description }}</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <q-btn class="button-icon bg-add" text-color="font" rounded flat size="sm"
                            icon="sym_o_content_paste_search"
                            @click="state.selectedId = props.row.id; state.dialogRead = true" />
                        <q-btn class="button-icon bg-edit" text-color="font" rounded flat size="sm"
                            icon="sym_o_edit_note" @click="state.selectedId = props.row.id; state.dialogWrite = true" />
                    </div>
                </div>
                <div class="whitespace-pre-wrap break-words" v-html="props.row.content">
                </div>
                <!-- <CardPrescription :row="props.row" :insured="insured" /> -->
            </div>
        </template>
    </q-table>



    <q-dialog class="q-pa-none left-0" v-model="state.dialogRead" :position="$isDesktop ? 'right' : 'standard'"
        full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <ReadPrescription @close="state.dialogRead = false" :id="state.selectedId"
                :width="$isDesktop ? '1200px' : '100%'" />
        </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'"
        full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <WritePrescription @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit />
        </q-card>
    </q-dialog>

</template>

<script setup>
import ReadPrescription from "./ReadPrescription.vue"
import WritePrescription from "./WritePrescription.vue"
import { useUpdateStore } from "src/stores/update";
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useTable } from "src/use/table"
import NoData from "src/components/table/NoData.vue";
import CardPrescription from "./CardPrescription.vue";
const $isDesktop = inject('$isDesktop');
const props = defineProps({ id: Number, isEdit: Boolean, id: Number })
const tableRef = ref()
console.log(props.id);
const state = reactive({
    updateChart: false,
    dialogChart: false,
    items: [],
    total: 0,
    diagnosis: [],
    loading: true,
    selectedId: 0,
    selected: [],
    search: '',
    search_key: 'orlike:prescription_date',
    pagination: {
        sortBy: 'prescription_date',
        descending: true,
        page: 1,
        rowsPerPage: 5,
    },
    url: 'prescription',
    query: {
        order: {
            prescription_date: 'DESC'
        },
        groupBy: ['t_prescription.id'],
        where: {
            c_status: 4,
            insured_id: props.id
        }
    },
    rows: [
    ]
})

const { onRequest, getSelectedString, onDeleteRows, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_prescription, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>