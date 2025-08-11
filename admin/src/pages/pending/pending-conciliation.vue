<template>
    <q-page class="px-1.5 py-2 lg:px-5 lg:py-6">
        <div class="flex justify-between md:flex-nowrap mb-2">
            <div class="flex flex-nowrap w-full gap-2">
                <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
                    :placeholder="$t('search')">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
                <q-checkbox size="xs" v-if="$me.high_profile" class="border border-dashed px-4 h-[40px] text-xs"
                    v-model="state.query.where.high_profile" :true-value="1" :false-value="null">Alto
                    perfil</q-checkbox>
                <q-checkbox size="xs" class="border border-dashed px-4 h-[40px] text-xs"
                    v-model="state.query.where.pregnant" :true-value="1" :false-value="null">Maternidad</q-checkbox>
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
        <div class="grid lg:grid-cols-4 gap-1 mb-1">
            <UserSelect @setUser="state.query.where.user_id = $event" @clearUser="state.query.where.user_id = null"
                :model-value="state.user_description" label="Coordinador" :unixroles="24" />
            <ProviderSelect class="w-full" @setProvider="state.query.where['t_event.provider_id'] = $event"
                @clearProvider="state.query.where['t_event.provider_id'] = null"
                :model-value="state.provider_description" />
        </div>
        <q-table :grid="!$isDesktop" hide-pagination :rows="state.rows" :columns="state.columns" row-key="id"
            ref="tableRef" @request="onRequest" flat v-model:pagination="state.pagination" :loading="state.loading"
            rows-per-page-label="Lineas" :wrap-cells="true" :visibleColumns="state.visibleColumns">
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
                    <div class="grid grid-cols-2 gap-1">
                        <q-btn flat class="button text-primary rounded-md" size="sm" label="consultar" no-caps
                            @click="$router.push(`${$path.event}/${$path.event_consult}/${props.row.id}`)" />
                        <q-btn flat class="button text-primary rounded-md" size="sm" label="Editar" no-caps
                            @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                        <q-btn flat class="button text-primary rounded-md" size="sm" label="Itinerario" no-caps
                            @click="state.eventSelected = props.row; state.itineraryDialog = true;" />
                        <template v-if="props.row.book_code">
                            <q-btn flat class="button bg-secondary text-white rounded-md" size="sm" label="Coinciliada"
                                no-caps :to="`/conciliaciones/editar/${props.row.book_code}`" />
                        </template>
                        <template v-else>
                            <q-btn v-if="props.row.policy_id" flat class="button text-primary rounded-md" size="sm"
                                label="Coinciliar" no-caps :to="`/conciliaciones/crear?eventId=${props.row.id}`">
                            </q-btn>
                            <q-btn v-else flat class="button text-primary rounded-md" size="sm" label="Coinciliar*"
                                no-caps>
                                <q-popup-proxy transition-show="flip-up" transition-hide="flip-down">
                                    <q-banner>
                                        <template v-slot:avatar>
                                            <q-icon name="fa-duotone fa-solid fa-triangle-exclamation" />
                                        </template>
                                        La cita debe tener una póliza para conciliar
                                    </q-banner>
                                </q-popup-proxy>
                            </q-btn>
                        </template>
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
                        <span>C: {{ props.row.contact_description }}</span>
                    </div>
                </q-td>
            </template>

            <template v-slot:body-cell-doctor_description="props">
                <q-td :props="props">
                    <div v-if="props.row.doctor_description" class="flex flex-col text-xs">
                        <div v-for="(doctor_description, index) in props.row.doctor_description"
                            :key="doctor_description">
                            <span class="flex flex-nowrap border-b border-default">{{ doctor_description }}</span>
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

            <template v-slot:body-cell-last_attendance_datetime="props">
                <q-td :props="props">
                    <div class="flex flex-col text-xs">
                        <span>{{ props.row.last_attendance_datetime_format }}</span>
                        <div class="flex items-end text-xxs leading-none">
                            <q-badge class="text-font bg-default text-xxs w-4 h-2 mr-1"
                                :style="{ background: props.row.time_passed_color }">
                            </q-badge>
                            <span>{{ props.row.time_passed_format }}</span>
                        </div>
                    </div>
                </q-td>
            </template>

            <template v-slot:item="props">
                <div class="q-py-xs col-xs-12" :style="props.selected ? 'transform: scale(0.95);' : ''">
                    <EventCard :item="props.row" @selected="state.selectedId = $event; state.dialogWrite = true;"
                        @openItinerary="state.eventSelected = $event; state.itineraryDialog = true;"
                        @copy="state.selectedId = $event; state.dialogCopy = true;" />
                </div>
            </template>
            <template v-slot:bottom v-if="!$isDesktop">
                <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
            </template>
        </q-table>
        <q-dialog class="q-pa-none" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'"
            full-height :full-width="$isDesktop" maximized :transition-duration="100">
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
            <q-card class="shadow pt-4 lg:px-6 pb-4 flex-col w-[400px]">
                <EventItinerary isEdit :id="state.eventSelected.id" isDrawer @close="state.itineraryDialog = false"
                    displayAdd />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import EventWrite from "src/pages/event/components/EventWrite.vue";
import { addDays, format } from "date-fns";
import EventItinerary from "src/pages/event/components/EventItinerary.vue";
import UserSelect from "src/components/select/UserSelect.vue";
import ProviderSelect from "src/components/select/ProviderSelect.vue";
import EventCard from "src/pages/event/components/EventCard.vue";
const $cats = inject('$cats')
const $me = inject('$me')
const props = defineProps({
    insuredId: Number,
    doctorId: Number,
    providerId: Number,
})
const { t } = useI18n()
const tableRef = ref()

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
        sortBy: 't_event.event_state',
        descending: false,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'event/alert-list',
    table: 't_event',
    query: {
        join: [{
            table: 't_itinerary',
            relationA: 't_itinerary.event_id',
            relationB: 't_event.id',
        }],
        groupBy: ['t_event.id'],
        where: {
            'isnull:book_code': 1,
            't_event.c_status': 4,
            't_itinerary.c_status': 4,
            ['in:$event_state_id']: [40]
        }
    },
    visibleColumns: [],
    columns: [
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: t('id'),
            classes: 'min-w-[200px]'
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
        {
            name: 'doctor_description',
            required: true,
            label: `Médico`,
            align: 'left',
            field: 'doctor_description',
            sortable: true
        },
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
            name: 'last_attendance_datetime',
            required: true,
            label: t('last_attendance_datetime'),
            align: 'left',
            field: 'last_attendance_datetime_format',
            sortable: true
        },
        {
            name: 'pending_list',
            label: t('pending_list'),
            align: 'left',
            field: 'pending_list',
            sortable: true,
            hidden: true
        }
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

watch(() => state.query.where["t_event.c_status"], (val) => {
    console.log(val);
    if (val === 2) {
        state.visibleColumns = state.columns.filter(i => {
            return i.name === 'reason_cancellation' && !i.required
        }).map(i => i.name)
    } else {
        state.visibleColumns = []
    }
})

</script>