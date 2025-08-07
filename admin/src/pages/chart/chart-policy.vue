<template>
    <div class="subtitle mb-2 text-center">Estadísticas Pólizas</div>
    <div class="p-2" v-if="!state.loading">
        <div class="grid md:grid-cols-2 gap-2 mb-1">
            <div class="grid grid-cols-2 gap-2">
                <q-input dense outlined v-model="state.query.where.request_date.from" mask="##-##-####">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="proxy">
                                <q-date flat v-model="state.query.where.request_date.from" no-unset years-in-month-view
                                    minimal @update:model-value="$refs.proxy.hide()" mask="DD-MM-YYYY">
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input dense outlined v-model="state.query.where.request_date.to" mask="##-##-####">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="proxy">
                                <q-date flat v-model="state.query.where.request_date.to" no-unset years-in-month-view
                                    minimal @update:model-value="$refs.proxy.hide()" mask="DD-MM-YYYY">
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
            </div>

        </div>
        <div class="w-full">
            <q-option-group class="flex" size="sm" v-model="state.quickDate" toggle-color="secondary"
                toggle-text-color="text-font" :options="[
                    { label: 'Hoy', value: 0 },
                    { label: 'Ayer', value: 1 },
                    { label: 'Mes Actual', value: 2 },
                    { label: 'Mes Anterior', value: 3 },
                    { label: 'Año Actual', value: 4 },
                    { label: 'Todas', value: 5 },
                ]" type="radio" />
        </div>
        <div class="grid lg:grid-cols-3 gap-2 mt-2">
            <CategorySelect :model-value="state.query.where.event_type" refKey="event_type"
                @setCategory="state.query.where.$event_type_id = $event"
                @clearCategory="state.query.where.$event_type_id = null" />
            <InsuranceSelect class="mb-2" @setInsurance="setInsurance" @clearInsurance="clearInsurance"
                :model-value="state.query.where.insurance" />
            <CountrySelect class="mb-2" @setCountry="setCountry" @clearCountry="clearCountry"
                :model-value="state.query.where.country" />
        </div>
        <div class="card">
            <ChartPieArrObj :key="state.update" :data="state.insuranceList" name="label" value="value"
                title="Aseguradoras" subtitle="Pólizas" />
        </div>

        <ChartTablePolicy :list="state.insuranceList" title="TABLA DE ASEGURADORAS" :stats="state.stats"
            :date="state.query.where.request_date" type="insurance" columnKey="insurance" />

        <ChartTablePolicy :list="state.customerList" title="TABLA POR CLIENTES" :stats="state.stats"
            :date="state.query.where.request_date" type="customer_description" columnKey="customer_description" />

        <!-- <div class="card mt-2">
            <ChartPieArrObj :key="state.update" :data="state.eventTypeList" name="label" value="value" title="Tipo"
                subtitle="Pólizas" />
        </div>

        <ChartTablePolicy :list="state.eventTypeList" title="TABLA POR TIPO COORDINACIÓN" :stats="state.stats"
            :date="state.query.where.request_date" type="event_type" columnKey="event_type" /> -->

    </div>

    <q-dialog class="q-pa-none left-0" v-model="state.dialogTable" position="standard"
        :transition-duration="$isDesktop ? 100 : 0" style="width: 1200px">
        <q-card style="width: 1000px; max-width: 80vw;" class="p-4">
            <q-table flat :rows="state.dialogTableItems" :columns="state.columnsDialog" row-key="name" dense
                no-data-label="No hay eventos para esta fecha" :rows-per-page-options="[0]" wrap-cells
                :pagination="state.initialPagination">
                <template v-slot:top-left>
                    <span class="text-center w-full uppercase">TABLA DE EVENTO</span>
                </template>
                <template v-slot:body-cell-action="props">
                    <q-td :props="props">
                        <q-btn flat class="button bg-green-300" size="sm" label="editar" no-caps
                            @click="state.selectedEventId = props.row.id; state.dialogEventWrite = true" />
                    </q-td>
                </template>
                <template v-slot:no-data="{ icon, message, filter }">
                    <div class="full-width row flex-center text-primary q-gutter-sm">
                        <span>
                            {{ message }}
                        </span>
                        <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                    </div>
                </template>
            </q-table>
        </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" no-refocus v-model="state.dialogEventWrite"
        :position="$isDesktop ? 'right' : 'standard'" full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <EventWrite @submit="state.dialogEventWrite = false" @close="state.dialogEventWrite = false" isEdit
                :id="state.selectedEventId" :width="$isDesktop ? '1000px' : '100%'" />
        </q-card>
    </q-dialog>

</template>

<script setup>
import { reactive, onMounted, inject, watch } from 'vue'
import { format, startOfYesterday, startOfMonth, endOfMonth, endOfYear, startOfYear, getDate } from "date-fns"
const $cats = inject("$cats")
import { es } from 'date-fns/locale';
import ChartPieArrObj from 'src/components/chart/ChartPieArrObj.vue';
import ChartBarVerticalArrObj from 'src/components/chart/ChartBarVerticalArrObj.vue';
import EventWrite from 'src/pages/event/components/EventWrite.vue';
import ChartTablePolicy from './components/ChartTablePolicy.vue';
import CategorySelect from 'src/components/select/CategorySelect.vue';
import InsuranceSelect from 'src/components/select/InsuranceSelect.vue';
import CountrySelect from 'src/components/select/CountrySelect.vue';

const start_of_month = startOfMonth(new Date());

const month = format(start_of_month, 'MMMM', { locale: es });

const day = getDate(new Date());

const $api = inject('$api')

const state = reactive({
    initialPagination: {
        sortBy: 'quantity',
        descending: true,
        page: 1,
        rowsPerPage: 10
    },
    quickDate: 5,
    timeout: null,
    dialogEventWrite: false,
    selectedEventId: 0,
    loading: true,
    first: true,
    update: 1,
    day,
    stats: {},
    insuranceList: [],
    eventTypeList: [],
    customerList: [],
    month,
    start: 'all',
    query: {
        groupBy: ['t_policy.policy_number'],
        where: {
            $event_type_id: [],
            request_date: {
                from: null,
                to: null,
            },
            c_status: [4],
        },
    },
    columns: [
        {
            name: 'action',
            required: true,
            label: 'Acciones',
            align: 'left',
            field: 'action',
            classes: 'w-[150px]'
        },
        {
            name: 'label',
            required: true,
            label: 'Descripción',
            align: 'left',
            field: 'label',
        },
        {
            name: 'value',
            required: true,
            label: 'Cantidad',
            align: 'left',
            field: 'value',
        },
    ],
    columnsDialog: [
        {
            name: 'action',
            required: true,
            label: 'Acciones',
            align: 'left',
            field: 'action',
            classes: 'w-[150px]'
        },
        {
            name: 'contact_description',
            required: true,
            label: 'Nombre',
            align: 'left',
            field: 'contact_description',
        },
        {
            name: 'customer_description',
            required: true,
            label: 'Médico',
            align: 'left',
            field: 'customer_description',
        },
        {
            name: 'event_state',
            required: true,
            label: 'Estado',
            align: 'left',
            field: 'event_state',
        },
        {
            name: 'event_type',
            required: true,
            label: 'Tipo',
            align: 'left',
            field: 'event_type',
        },
        {
            name: 'request_date',
            required: true,
            label: 'Fecha',
            align: 'left',
            field: 'request_date',
        },
    ]
})

watch(() => state.quickDate, (val) => {
    switch (val) {
        case 0:
            state.query.where.request_date.from = format(new Date(), 'dd/MM/yyyy')
            state.query.where.request_date.to = format(new Date(), 'dd/MM/yyyy')
            break;
        case 1:
            state.query.where.request_date.from = format(startOfYesterday(new Date()), 'dd/MM/yyyy')
            state.query.where.request_date.to = format(startOfYesterday(new Date()), 'dd/MM/yyyy')
            break;
        case 2:
            state.query.where.request_date.from = format(startOfMonth(new Date()), 'dd/MM/yyyy')
            state.query.where.request_date.to = format(endOfMonth(new Date()), 'dd/MM/yyyy')
            break;
        case 3:
            state.query.where.request_date.from = format(startOfYear(new Date()), 'dd/MM/yyyy')
            state.query.where.request_date.to = format(endOfYear(new Date()), 'dd/MM/yyyy')
            break;
        case 4:
            state.query.where.request_date.from = null
            state.query.where.request_date.to = null
            break;

        default:
            break;
    }
})

function setInsurance(id) {
    try {
        state.query.where.insurance_id = id
    } catch (error) {
        console.log(error);
    }
}

function clearInsurance() {
    try {
        state.query.where.insurance_id = null
    } catch (error) {
        console.log(error);
    }
}

async function setCountry(id) {
    try {
        state.query.where.country_id = id
    } catch (error) {
        console.log(error);
    }
}

function clearCountry() {
    try {
        state.query.where.country_id = null;
    } catch (error) {
        console.log(error);
    }
}

async function getStats() {
    state.stats = await $api.get('policy/stats', { params: state.query });
    if (state.first) {
        state.insuranceList = [...state.stats.insuranceList]
        state.eventTypeList = [...state.stats.eventTypeList]
        state.customerList = [...state.stats.customerList]
        state.first = false
    }
    ++state.update
}

watch(() => state.query.where, (val) => {
    clearTimeout(state.timeout)
    state.timeout = setTimeout(() => {
        state.first = true;
        getStats()
    }, 300);
}, { deep: true })

onMounted(async () => {
    await getStats()
    state.loading = false
})


</script>