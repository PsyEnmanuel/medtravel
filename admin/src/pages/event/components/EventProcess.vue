<template>
    <div class="flex justify-between md:flex-nowrap mb-2">
        <div class="flex flex-nowrap w-full gap-2">
            <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
                :placeholder="$t('search')">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>
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
    <div class="flex justify-between md:flex-nowrap mb-1">
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
    </div>
    <q-scroll>
        <div v-if="options.event_state.length" :class="`flex flex-nowrap gap-2 mt-2`">
            <div v-for="o in options.event_state" :key="o">
                <div class="w-[300px] text-xs text-left flex items-start" align="left">
                    <div class="text-left">
                        <span class="md:text-md font-bold text-left">{{ o.label }}</span>
                    </div>
                    <div class="w-full mb-2" v-for="row in state.rows.filter(i => i.$event_state_id === o.value)"
                        :key="row.id">
                        <EventCard :item="row" @selected="state.selectedId = $event; state.dialogWrite = true;"
                            @copy="state.selectedId = $event; state.dialogCopy = true;" action />
                    </div>
                    <!-- <q-table grid hide-pagination :rows="state.rows" :columns="state.columns" row-key="id" @request="onRequest" flat selection="multiple"
                        v-model:pagination="state.pagination" v-model:selected="state.selected"
                        :selected-rows-label="getSelectedString" :loading="state.loading" rows-per-page-label="Lineas"
                        :wrap-cells="true">
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
                                    <q-btn flat class="button-press bg-primary text-white rounded-md" size="sm"
                                        label="Guardar cambios" no-caps
                                        @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                                </div>
                            </q-td>
                        </template>

                        <template v-slot:body-cell-attendance_date="props">
                            <q-td :props="props">
                                <span>{{ props.row.attendance_date }} {{ props.row.attendance_time }}</span>
                            </q-td>
                        </template>

                        <template v-slot:item="props">
                            <div class="q-py-xs col-xs-12" :style="props.selected ? 'transform: scale(0.95);' : ''">
                                <EventCard :item="props.row"
                                    @selected="state.selectedId = $event; state.dialogWrite = true;"
                                    @copy="state.selectedId = $event; state.dialogCopy = true;" action />
                            </div>
                        </template>
                        <template v-slot:bottom v-if="!$isDesktop">
                            <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar
                                más</q-btn>
                        </template>
                    </q-table> -->
                </div>
            </div>
        </div>
    </q-scroll>
    <q-dialog class="q-pa-none" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'" full-height
        :full-width="$isDesktop" maximized :transition-duration="100">
        <q-card>
            <EventWrite @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit
                :width="$isDesktop ? '1000px' : '100%'" />
        </q-card>
    </q-dialog>
    <q-dialog v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
        :transition-duration="100">
        <q-card>
            <EventWrite @close="state.dialogCreate = false" isDrawer :width="$isDesktop ? '1000px' : '100%'" />
        </q-card>
    </q-dialog>
    <q-dialog v-model="state.dialogCopy" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
        :transition-duration="100">
        <q-card>
            <EventWrite @close="state.dialogCopy = false" isDrawer :width="$isDesktop ? '1000px' : '100%'"
                :copyId="state.selectedId" />
        </q-card>
    </q-dialog>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import EventWrite from "./EventWrite.vue";
import EventCard from "./EventCard.vue";
import { convertToValidDate } from "src/helpers/date";
import { addDays, format } from "date-fns";
const $cats = inject('$cats')
const $api = inject('$api')
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
    search_key: 'orlike:code',
    pagination: {
        sortBy: 'code',
        descending: false,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'event',
    query: {
        groupBy: ['t_event.id'],
        where: {
            c_status: 4,
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
            classes: 'w-[100px]'
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
            name: 'attendance_date',
            required: true,
            label: t('attendance_date'),
            align: 'left',
            field: 'attendance_date',
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
            name: 'provider_description',
            required: true,
            label: t('provider_description'),
            align: 'left',
            field: 'provider_description',
            sortable: true
        },
        {
            name: 'doctor_description',
            required: true,
            label: t('doctor_description'),
            align: 'left',
            field: 'doctor_description',
            sortable: true
        },
    ],
    rows: []
})

function nextDate() {
    const from = convertToValidDate(state.query.where.attendance_datetime.from)
    state.query.where.attendance_datetime.from = format(addDays(from, 1), 'dd/MM/yyyy')
    state.query.where.attendance_datetime.to = format(addDays(from, 1), 'dd/MM/yyyy')
}

function prevDate() {
    const from = convertToValidDate(state.query.where.attendance_datetime.from)
    state.query.where.attendance_datetime.from = format(addDays(from, -1), 'dd/MM/yyyy')
    state.query.where.attendance_datetime.to = format(addDays(from, -1), 'dd/MM/yyyy')
}

// const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

// const updateStore = useUpdateStore()
// watch(() => updateStore.table.t_event, (data) => {
//     tableRef.value.requestServerInteraction()
//     tableRef.value.clearSelection()
// }, { deep: true })

const itemsRange = computed(() => {
    if (!state.pagination.rowsNumber) {
        return false;
    }
    const start =
        (state.pagination.page - 1) * state.pagination.rowsPerPage + 1;
    const end = Math.min(
        state.pagination.page * state.pagination.rowsPerPage,
        state.pagination.rowsNumber
    );

    return { start, end };
});

async function onRequest() {
    const res = await $api.get(state.url, {
        params: {
            ...state.query
        },
    });
    state.rows = res.items;
}

onMounted(async () => {
    onRequest()
})

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_event, (data) => {
    onRequest()
}, { deep: true })

</script>