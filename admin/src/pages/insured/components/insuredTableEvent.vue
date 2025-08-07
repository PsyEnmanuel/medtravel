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
                <q-btn flat class="button text-primary rounded-md" size="sm" label="consultar" no-caps
                    @click="$router.push(`${$path.insured}/${$path.insured_consult}/${props.row.insured_id}`)" />
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

        <template v-slot:body-cell-request_date="props">
            <q-td :props="props">
                <span>{{ props.row.request_date_format }}</span>
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
                </div>
            </q-td>
        </template>

        <template v-slot:body-cell-doctor_description="props">
            <q-td :props="props">
                <div v-if="props.row.doctor_description" class="flex flex-col text-xs">
                    <div v-for="(doctor_description, index) in props.row.doctor_description" :key="doctor_description">
                        <span>{{ index + 1 }}: {{ doctor_description }}</span>
                    </div>
                </div>
            </q-td>
        </template>

        <template v-slot:body-cell-mprocedure="props">
            <q-td :props="props">
                <div class="flex flex-nowrap gap-1 text-xs" v-for="(r, index) in props.row.mprocedure" :key="r.id">
                    <div class="w-full flex border card shadow-none px-3 py-1 line-clamp-1">
                        <div class="text-xxs uppercase bg-[#f3f1f1] px-1 mr-1">{{ r.code }}</div>
                        <div class="text-xxs uppercase pr-1">{{ r.description }}</div>
                    </div>
                </div>
            </q-td>
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
                <EventCard :item="props.row" @selected="state.selectedId = $event; state.dialogWrite = true;"
                    @copy="state.selectedId = $event; state.dialogCopy = true;" action />
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
    <q-dialog v-model="state.itineraryDialog" full-height maximized>
        <q-card class="shadow pt-4 px-6 pb-4 flex-col w-[400px]">
            <EventItinerary isEdit :id="state.eventSelected.id" isDrawer @close="state.itineraryDialog = false"
                displayAdd />
        </q-card>
    </q-dialog>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import EventWrite from "pages/event/components/EventWrite.vue";
import { addDays, format } from "date-fns";
import EventItinerary from "pages/event/components/EventItinerary.vue";
import UserSelect from "src/components/select/UserSelect.vue";
import ProviderSelect from "src/components/select/ProviderSelect.vue";
import EventCard from "pages/event/components/EventCard.vue";
const $cats = inject('$cats')
const $me = inject('$me')
const props = defineProps({
    insuredId: Number,
    doctorId: Number,
    providerId: Number,
})
const { t } = useI18n()
const tableRef = ref()

const options = reactive({
    event_state: $cats.value.event_state,
    event_type: $cats.value.event_type
})

const state = reactive({
    itinerary: [],
    eventSelected: null,
    itineraryDialog: false,
    dialogCopy: false,
    dialogWrite: false,
    dialogList: false,
    dialogCreate: false,
    selectedId: 0,
    dialogWidth: 400,
    selected: [],
    search: '',
    search_key: 'orlike:t_event.code,user_description,insured,t_event.provider_description,contact_description,t_event.created_by,MRN',
    pagination: {
        sortBy: 'request_date',
        descending: true,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'event',
    query: {
        join: [{
            table: 't_itinerary',
            relationA: 't_itinerary.event_id',
            relationB: 't_event.id',
        }],
        groupBy: ['t_event.insured'],
        where: {
            't_event.c_status': 4,
            high_profile: $me.high_profile ? null : 0,
            insured_id: props.insuredId ?? null,
            doctor_id: props.doctorId ?? null,
            't_event.provider_id': props.providerId ?? null,
            'in:$event_type_id': $me.unixroles & 8 ? [178] : $me.unixroles & 16 ? [176] : [],
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

        },
        {
            name: 'insured',
            required: true,
            label: t('insured'),
            align: 'left',
            field: 'insured',
            sortable: true,
            classes: 'w-full'
        },
        {
            name: 'provider_description',
            required: true,
            label: `Proveedor`,
            align: 'left',
            field: 'provider_description',
            sortable: true,
            classes: 'w-full'
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