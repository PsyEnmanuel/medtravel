<template>
    <div class="flex justify-between md:flex-nowrap mb-2">
        <div class="flex flex-nowrap w-full gap-2">
            <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
                :placeholder="$t('search')">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>
            <q-btn flat class="button h-full" icon="add" :label="$isDesktop && $t('add')"
                @click="state.dialogCreate = true" />
            <q-btn v-if="state.selected.length" flat class="button h-full bg-primary text-white"
                icon-right="sym_o_remove" :label="$isDesktop ? 'Remover' : ''" no-caps @click="onDeleteRows" />
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
    <!-- <div class="flex justify-between md:flex-nowrap mb-1">
        <div class="flex md:flex-nowrap w-full gap-2">
            <q-input dense outlined v-model="state.query.where.attendance_datetime.from" mask="##-##-####">
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="proxy">
                            <q-date flat v-model="state.query.where.attendance_datetime.from" no-unset
                                years-in-month-view minimal @update:model-value="$refs.proxy.hide()" mask="DD-MM-YYYY">
                            </q-date>
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>
            <q-input dense outlined v-model="state.query.where.attendance_datetime.to" mask="##-##-####">
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="proxy">
                            <q-date flat v-model="state.query.where.attendance_datetime.to" no-unset years-in-month-view
                                minimal @update:model-value="$refs.proxy.hide()" mask="DD-MM-YYYY">
                            </q-date>
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>
            <div class="grid grid-cols-2 gap-2">
                <q-btn flat class="button-icon text-[10px] h-[40px]" icon="chevron_left" @click="prevDate">
                    <q-tooltip class="bg-default text-black text-xs">Día anterior</q-tooltip>
                </q-btn>
                <q-btn flat class="button-icon text-[10px] h-[40px]" icon="chevron_right" @click="nextDate">
                    <q-tooltip class="bg-default text-black text-xs">Día siguiente</q-tooltip>
                </q-btn>
            </div>
        </div>
    </div> -->
    <div>
        <q-option-group class="flex text-xs" size="sm" v-model="state.query.where['in:$event_state_id']"
            toggle-color="secondary" toggle-text-color="text-font" :options="options.event_state" type="checkbox" />
    </div>
    <q-table :grid="!$isDesktop" hide-pagination :rows="state.rows" :columns="state.columns" row-key="id" ref="tableRef"
        @request="onRequest" flat selection="multiple" v-model:pagination="state.pagination"
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

        <template v-slot:body-cell-avatar="props">
            <q-td :props="props">
                <q-avatar rounded size="42px">
                    <img :src="$imageInsuredPlaceholder(props.value)" />
                </q-avatar>
            </q-td>
        </template>

        <template v-slot:body-cell-action="props">
            <q-td :props="props">
                <div class="flex gap-2">
                    <q-btn flat class="button text-primary rounded-md" size="sm" label="consultar" no-caps
                        @click="$router.push(`${$path.event}/${$path.event_consult}/${props.row.id}`)" />
                    <q-btn flat class="button text-primary rounded-md" size="sm" label="Editar" no-caps
                        @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                </div>
            </q-td>
        </template>

        <template v-slot:body-cell-user_description="props">
            <q-td :props="props">
                <div class="flex flex-col text-xs">
                    <span>#{{ props.row.code }}</span>
                    <span>{{ props.row.event_type }}</span>
                    <span>{{ props.row.user_description }}</span>
                </div>
            </q-td>
        </template>

        <template v-slot:body-cell-attendance_date="props">
            <q-td :props="props">
                <div class="flex flex-col text-xs">
                    <span>R: {{ props.row.request_date_format }}</span>
                    <span>A: {{ props.row.attendance_date }} {{ props.row.attendance_time }}</span>
                </div>
            </q-td>
        </template>

        <template v-slot:body-cell-event_state="props">
            <q-td :props="props">
                <div class="flex flex-col text-xs gap-1">
                    <div class="flex flex-nowrap items-center gap-2">
                        <q-badge class="text-font w-4" :style="{ background: props.row.color }"></q-badge><span>{{
                            props.row.event_state }}</span>
                    </div>
                    <span v-if="props.row.event_state_time">{{
                        format(props.row.event_state_time[props.row.$event_state_id], 'EEE dd MMM yyyy hh:mm:ss')
                    }}</span>
                </div>
            </q-td>
        </template>

        <template v-slot:body-cell-provider_description="props">
            <q-td :props="props">
                <div class="flex flex-col text-xs">
                    <span>P: {{ props.row.provider_description }}</span>
                    <span>C: {{ props.row.contact_description }}</span>
                </div>
            </q-td>
        </template>

        <template v-slot:body-cell-itinerary="props">
            <div class="flex flex-nowrap gap-1 text-xs" v-for="(row, index) in props.row.itinerary" :key="row.id">
                <div class="w-full flex flex-col px-1 py-1 line-clamp-1 m-1">
                    <div class="text-xxs">{{ row.doctor_description }}</div>
                    <div class="flex">
                        <div class="text-xxs">{{ row.start_readable }}</div>
                    </div>
                    <template v-if="row.mprocedure.length">
                        <div class="subtitle text-xxs px-2 py-0 text-center">Procedimientos</div>
                        <div class="flex flex-nowrap text-xs" v-for="(r, index) in row.mprocedure" :key="r.id">
                            <div class="w-full flex items-start flex-nowrap border card shadow-none px-1 py-1 line-clamp-1">
                                <div class="text-xs uppercase bg-[#f3f1f1] px-1 mr-1 text-xxs">{{ r.code }}</div>
                                <div class="text-xs uppercase pr-1 text-xxs">{{ r.description }}</div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </template>

        <template v-slot:body-cell-created_by="props">
            <q-td :props="props">
                <div class="flex flex-col text-xs">
                    <span>{{ props.row.created_format }}</span>
                    <span>{{ props.row.created_by }}</span>
                </div>
            </q-td>
        </template>

        <template v-slot:item="props">
            <div class="q-py-xs col-xs-12" :style="props.selected ? 'transform: scale(0.95);' : ''">
                <!-- <EventCard :item="props.row" @selected="state.selectedId = $event; state.dialogWrite = true;"
                    @copy="state.selectedId = $event; state.dialogCopy = true;" action /> -->
            </div>
        </template>
        <template v-slot:bottom v-if="!$isDesktop">
            <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
        </template>
    </q-table>
    <q-dialog class="q-pa-none" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'" full-height
        :full-width="$isDesktop" maximized :transition-duration="100">
        <q-card>
            <EventWrite @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit
                :width="$isDesktop ? '100%' : '100%'" />
        </q-card>
    </q-dialog>
    <q-dialog v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
        :transition-duration="100">
        <q-card>
            <EventWrite @close="state.dialogCreate = false" isDrawer :width="$isDesktop ? '100%' : '100%'"
                :insuredId="insuredId" />
        </q-card>
    </q-dialog>
    <q-dialog v-model="state.dialogCopy" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
        :transition-duration="100">
        <q-card>
            <EventWrite @close="state.dialogCopy = false" isDrawer :width="$isDesktop ? '100%' : '100%'"
                :copyId="state.selectedId" />
        </q-card>
    </q-dialog>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import EventWrite from "./EventWrite.vue";
// import EventCard from "./EventCard.vue";
import { convertToValidDate } from "src/helpers/date";
import { addDays, format } from "date-fns";
const $cats = inject('$cats')
const $me = inject('$cats')
const props = defineProps({
    insuredId: Number
})
const { t } = useI18n()
const tableRef = ref()

const options = reactive({
    event_state: $cats.value.event_state
})

const state = reactive({
    dialogCopy: false,
    dialogWrite: false,
    dialogList: false,
    dialogCreate: false,
    selectedId: 0,
    dialogWidth: 400,
    selected: [],
    search: '',
    search_key: 'orlike:code,user_description,insured,provider_description,contact_description,created_by,MRN',
    pagination: {
        sortBy: 'request_date',
        descending: true,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'event',
    query: {
        groupBy: ['t_event.id'],
        where: {
            c_status: 4,
            $event_type_id: 176,
            high_profile: $me.high_profile ? null : 0,
            insured_id: props.insuredId ?? null,
            attendance_datetime: {
                from: null,
                to: null,
            },
            'in:$event_state_id': []
        }
    },
    columns: [
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: t('id'),
            classes: 'w-[200px]'
        },
        {
            name: 'user_description',
            required: true,
            label: 'Asignado a',
            align: 'left',
            field: 'user_description',
            sortable: true
        },
        {
            name: 'insured',
            required: true,
            label: t('insured'),
            align: 'left',
            field: 'insured',
            sortable: true
        },
        {
            name: 'provider_description',
            required: true,
            label: `Proveedor/Contacto`,
            align: 'left',
            field: 'provider_description',
            sortable: true
        },
        // {
        //     name: 'itinerary',
        //     required: true,
        //     label: `Itinerario`,
        //     align: 'left',
        //     field: 'itinerary',
        //     sortable: true
        // },
        {
            name: 'event_state',
            required: true,
            label: t('event_state'),
            align: 'left',
            field: 'event_state',
            sortable: true
        },
        {
            name: 'request_date',
            required: true,
            label: t('request_date'),
            align: 'left',
            field: 'request_date_format',
            sortable: true
        },
        {
            name: 'created_by',
            required: true,
            label: t('created_by'),
            align: 'left',
            field: 'created_by',
            sortable: true
        },
    ],
    rows: [
    ]
})

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_event, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>