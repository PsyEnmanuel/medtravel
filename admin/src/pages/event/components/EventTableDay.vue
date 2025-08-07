<template>
    <div class="flex justify-between md:flex-nowrap mb-2">
        <div class="flex flex-nowrap w-full gap-2">
            <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
                :placeholder="$t('search')">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>
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
    <q-table table-class="text-xs" :grid="!$isDesktop" hide-pagination :rows="state.rows" :columns="state.columns"
        row-key="id" ref="tableRef" @request="onRequest" flat selection="multiple" v-model:pagination="state.pagination"
        v-model:selected="state.selected" :selected-rows-label="getSelectedString" :loading="state.loading"
        rows-per-page-label="Lineas" :wrap-cells="true">
        <template v-slot:no-data="{ icon, message, filter }">
            <div class="full-width row flex-center text-primary q-gutter-sm">
                <span>
                    {{ message }}
                </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
        </template>
        <template v-slot:body-cell-attendance_time="props">
            <q-td :props="props">
                <span>{{ props.row.attendance_time }} {{ props.row.attendance_time_format }}</span>
            </q-td>
        </template>
        <template v-slot:body-cell-action="props">
            <q-td :props="props">
                <q-btn flat class="button bg-default text-primary" size="sm" label="Editar" no-caps
                    @click="$emit('edit', props.row.id)" />
            </q-td>
        </template>

        <template v-slot:item="props">
            <div class="q-py-xs col-xs-12 col-sm-6 col-md-4" :style="props.selected ? 'transform: scale(0.95);' : ''">
                <div bordered flat class="card pb-2 relative flex flex-nowrap">
                    <div class="absolute right-3 top-2">
                        <q-checkbox dense v-model="props.selected" :label="props.row.name" />
                    </div>
                    <div class="pl-3 pr-8 w-full pt-2 flex flex-col overflow-hidden">
                        <span class="text-uppercase line-clamp-1 font-semibold">{{ props.row.description }}</span>
                        <span class="text-uppercase line-clamp-1 text-xxs">{{ props.row.ref }}</span>
                        <div class="flex justify-end gap-2 -mr-5 mt-1">
                            <q-btn flat class="button bg-default text-primary rounded-md" size="sm" label="Editar"
                                no-caps @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                        </div>
                    </div>

                </div>
            </div>
        </template>
        <template v-slot:bottom v-if="!$isDesktop">
            <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
        </template>
    </q-table>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue"
import { getEndOfDateTime, intlReadbleDate } from "src/helpers/date"
const props = defineProps({ date: Date, user: Object, width: String });
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
const tableRef = ref()
const $me = inject("$me")

const state = reactive({
    selectedId: 0,
    dialogWidth: 400,
    selected: [],
    search: '',
    search_key: 'orlike:t_event.code,t_event.insured,t_itinerary.provider_description,t_itinerary',
    pagination: {
        sortBy: 'attendance_datetime',
        descending: false,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'itinerary',
    query: {
        join: [{
            table: 't_event',
            relationA: 't_event.id',
            relationB: 't_itinerary.event_id',
        }],
        group_by: 't_itinerary.id',
        where: {
            high_profile: $me.high_profile ? null : 0,
            't_itinerary.c_status': [4],
            "gt:attendance_datetime": props?.date,
            "lt:attendance_datetime": getEndOfDateTime(props.date)
        },
    },
    columns: [
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: 'action',
            classes: 'w-[80px]'
        },
        {
            name: 'insured',
            required: true,
            label: 'Asegurado',
            align: 'left',
            field: 'insured',
        },
        {
            name: 'attendance_date',
            required: true,
            label: 'Fecha',
            align: 'left',
            field: 'attendance_readable',
        },
        {
            name: 'attendance_time',
            required: true,
            label: 'Hora',
            align: 'left',
            field: 'attendance_time',
        },
        {
            name: 'provider_description',
            required: true,
            label: 'Proveedor',
            align: 'left',
            field: 'provider_description',
        },
        {
            name: 'doctor_description',
            required: true,
            label: 'Médico',
            align: 'left',
            field: 'doctor_description',
        },
        {
            name: 'created_by',
            required: true,
            label: 'Creado por',
            align: 'left',
            field: 'created_by',
        },
        {
            name: 'request_date',
            required: true,
            label: 'Fecha de solicitud',
            align: 'left',
            field: 'request_date_format',
        },
    ],
    rows: [
    ]
})

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_provider, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>