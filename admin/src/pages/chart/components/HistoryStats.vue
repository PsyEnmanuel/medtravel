<template>
    <div class="p-2">
        <div class="subtitle mb-2 text-center">Estadísticas Historia</div>
        <div class="grid md:grid-cols-2 gap-2 mb-1">
            <div class="grid grid-cols-2 gap-2">
                <q-input dense outlined v-model="state.query.where.history_date.from" mask="##-##-####">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="proxy">
                                <q-date flat v-model="state.query.where.history_date.from" no-unset years-in-month-view
                                    minimal @update:model-value="$refs.proxy.hide()" mask="DD-MM-YYYY">
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input dense outlined v-model="state.query.where.history_date.to" mask="##-##-####">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="proxy">
                                <q-date flat v-model="state.query.where.history_date.to" no-unset years-in-month-view
                                    minimal @update:model-value="$refs.proxy.hide()" mask="DD-MM-YYYY">
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
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
        </div>
        <div class="bg-white card p-4 mt-2 max-h-[400px] overflow-auto">
            <div class="flex">
                <span class="uppercase flex items-center subtitle mr-2">TABLA DE DIAGNÓSTICOS</span>
                <q-input class="mr-2" dense outlined debounce="300" v-model="state.searchDiagnosis"
                    :placeholder="$t('search')">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <q-table flat :rows="diagnosisListComputed" :columns="state.columns" row-key="name" dense
                no-data-label="No hay diagnóstico para esta fecha" :rows-per-page-options="[0]" wrap-cells>
                <template v-slot:body-cell-action="props">
                    <q-td :props="props">
                        <q-btn flat class="button bg-green-400" size="sm" label="asegurados" no-caps
                            @click="openInsuredsTable(props.row)" />
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
        </div>
        <div class="bg-white card p-4 mt-2 max-h-[400px] overflow-auto">
            <div class="flex">
                <span class="uppercase flex items-center subtitle mr-2">TABLA DE PROCEDIMIENTOS</span>
                <q-input class="mr-2" dense outlined debounce="300" v-model="state.searchProcedure"
                    :placeholder="$t('search')">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <q-table flat :rows="procedureListComputed" :columns="state.columns" row-key="name" dense
                no-data-label="No hay procedimiento para esta fecha" :rows-per-page-options="[0]" wrap-cells>
                <template v-slot:body-cell-action="props">
                    <q-td :props="props">
                        <q-btn flat class="button bg-green-400" size="sm" label="asegurados" no-caps
                            @click="openProcedureTable(props.row)" />
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
        </div>

        <div class="bg-white card p-4 mt-2 max-h-[400px] overflow-auto">
            <div class="flex">
                <span class="uppercase flex items-center subtitle mr-2">TABLA DE TRATAMIENTO</span>
                <q-input class="mr-2" dense outlined debounce="300" v-model="state.searchTreatment"
                    :placeholder="$t('search')">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <q-table flat :rows="treatmentListComputed" :columns="state.columns" row-key="name" dense
                no-data-label="No hay tratamiento para esta fecha" :rows-per-page-options="[0]" wrap-cells>
                <template v-slot:body-cell-action="props">
                    <q-td :props="props">
                        <q-btn flat class="button bg-green-400" size="sm" label="asegurados" no-caps
                            @click="openTreatmentTable(props.row)" />
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
        </div>

        <q-dialog class="q-pa-none left-0" v-model="state.dialogDiagnosisTable" position="standard"
            :transition-duration="$isDesktop ? 100 : 0" style="width: 1200px">
            <q-card style="width: 700px; max-width: 80vw;" class="p-4">
                <q-table flat :rows="state.insuredsTable" :columns="state.columnsDiagnosis" row-key="name" dense
                    no-data-label="No hay eventos para esta fecha" :rows-per-page-options="[0]" wrap-cells>
                    <template v-slot:top-left>
                        <span class="text-center w-full uppercase">TABLA DE ASEGURADOS POR
                            <span class="subtitle">{{ state.insuredsTableTitle }}</span></span>
                    </template>
                    <template v-slot:body-cell-action="props">
                        <q-td :props="props">
                            <q-btn flat class="button bg-primary" size="sm" label="consultar" no-caps
                                @click="$router.push(`${$path.insured}/${$path.insured_consult}/${props.row.insured_id}`)" />
                        </q-td>
                    </template>
                    <template v-slot:body-cell-history_date="props">
                        <q-td :props="props">
                            <div class="flex flex-col">
                                <div>{{ props.row.history_date_format }}</div>
                                <div>{{ props.row.code }}</div>
                            </div>
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

        <q-dialog class="q-pa-none left-0" v-model="state.dialogProcedureTable" position="standard"
            :transition-duration="$isDesktop ? 100 : 0" style="width: 1200px">
            <q-card style="width: 700px; max-width: 80vw;" class="p-4">
                <q-table flat :rows="state.procedureTable" :columns="state.columnsDiagnosis" row-key="name" dense
                    no-data-label="No hay eventos para esta fecha" :rows-per-page-options="[0]" wrap-cells>
                    <template v-slot:top-left>
                        <span class="text-center w-full uppercase">TABLA DE ASEGURADOS POR
                            <span class="subtitle">{{ state.procedureTableTitle }}</span></span>
                    </template>
                    <template v-slot:body-cell-action="props">
                        <q-td :props="props">
                            <q-btn flat class="button bg-primary" size="sm" label="consultar" no-caps
                                @click="$router.push(`${$path.insured}/${$path.insured_consult}/${props.row.insured_id}`)" />
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

        <q-dialog class="q-pa-none left-0" v-model="state.dialogTreatmentTable" position="standard"
            :transition-duration="$isDesktop ? 100 : 0" style="width: 1200px">
            <q-card style="width: 700px; max-width: 80vw;" class="p-4">
                <q-table flat :rows="state.treatmentTable" :columns="state.columnsDiagnosis" row-key="name" dense
                    no-data-label="No hay eventos para esta fecha" :rows-per-page-options="[0]" wrap-cells>
                    <template v-slot:top-left>
                        <span class="text-center w-full uppercase">TABLA DE ASEGURADOS POR
                            <span class="subtitle">{{ state.treatmentTableTitle }}</span></span>
                    </template>
                    <template v-slot:body-cell-action="props">
                        <q-td :props="props">
                            <q-btn flat class="button bg-primary" size="sm" label="consultar" no-caps
                                @click="$router.push(`${$path.insured}/${$path.insured_consult}/${props.row.insured_id}`)" />
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
    </div>
</template>

<script setup>
import { format, startOfYesterday, startOfMonth, endOfMonth, endOfYear, startOfYear, getDate, subMonths } from "date-fns"
import ChartBarVertical from 'src/components/chart/ChartBarVertical.vue'
import ChartPie from 'src/components/chart/ChartPie.vue'
import { computed, inject, onMounted, reactive, watch } from 'vue';
const $api = inject('$api')

const options = reactive({
    diagnosis: []
})

const diagnosisListComputed = computed(() => {
    return state.diagnosisList.filter(i => {
        if (state.searchDiagnosis) {
            return i.description.toLowerCase().includes(state.searchDiagnosis.toLowerCase())
        }
        return true
    })
})

const procedureListComputed = computed(() => {
    return state.mprocedureList.filter(i => {
        if (state.searchProcedure) {
            return i.description.toLowerCase().includes(state.searchProcedure.toLowerCase())
        }
        return true
    })
})

const treatmentListComputed = computed(() => {
    return state.treatmentList.filter(i => {
        if (state.searchTreatment) {
            return i.description.toLowerCase().includes(state.searchTreatment.toLowerCase())
        }
        return true
    })
})

const state = reactive({
    timeout: null,
    quickDate: 2,
    dialogDiagnosisTable: false,
    dialogProcedureTable: false,
    dialogTreatmentTable: false,
    searchDiagnosis: null,
    searchProcedure: null,
    searchTreatment: null,
    first: true,
    stats: {},
    diagnosis: [],
    diagnosisList: [],
    mprocedureList: [],
    treatmentList: [],
    treatmentTable: [],
    query: {
        order: {
            insured_id: 'ASC',
            created: 'ASC'
        },
        where: {
            history_date: {
                from: format(startOfMonth(new Date()), 'dd/MM/yyyy'),
                to: format(endOfMonth(new Date()), 'dd/MM/yyyy')
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
            name: 'description',
            required: true,
            label: 'Nombre',
            align: 'left',
            field: 'description',
        },
        {
            name: 'quantity',
            required: true,
            label: 'Cantidad',
            align: 'left',
            field: 'quantity',
        },
    ],
    columnsDiagnosis: [
        {
            name: 'action',
            required: true,
            label: 'Acciones',
            align: 'left',
            field: 'action',
            classes: 'w-[150px]'
        },
        {
            name: 'insured_description',
            required: true,
            label: 'Nombre',
            align: 'left',
            field: 'insured_description',
        },
        {
            name: 'sex',
            required: true,
            label: 'Sexo',
            align: 'left',
            field: 'sex',
        },
        {
            name: 'age',
            required: true,
            label: 'Edad',
            align: 'left',
            field: 'age',
        },
        {
            name: 'history_date',
            required: true,
            label: 'Historia',
            align: 'left',
            field: 'history_date_format',
        },
    ]
})

async function getStats() {
    state.stats = await $api.get('history/stats/insured', { params: state.query });

    if (state.first) {
        state.diagnosisList = [...state.stats.diagnosisList]
        options.diagnosis = [...state.stats.diagnosisList]
        state.mprocedureList = [...state.stats.mprocedureList]
        state.treatmentList = [...state.stats.treatmentList]
        // state.first = false
    }
    ++state.update
}

watch(() => state.quickDate, (val) => {

    switch (val) {
        case 0:
            state.query.where.history_date.from = format(new Date(), 'dd/MM/yyyy')
            state.query.where.history_date.to = format(new Date(), 'dd/MM/yyyy')
            break;
        case 1:
            state.query.where.history_date.from = format(startOfYesterday(new Date()), 'dd/MM/yyyy')
            state.query.where.history_date.to = format(startOfYesterday(new Date()), 'dd/MM/yyyy')
            break;
        case 2:
            state.query.where.history_date.from = format(startOfMonth(new Date()), 'dd/MM/yyyy')
            state.query.where.history_date.to = format(endOfMonth(new Date()), 'dd/MM/yyyy')
            break;
        case 3:
            state.query.where.history_date.from = format(subMonths(startOfMonth(new Date()), 1), 'dd/MM/yyyy')
            state.query.where.history_date.to = format(subMonths(endOfMonth(new Date()), 1), 'dd/MM/yyyy')
            console.log(state.query.where.history_date);
            break;
        case 4:
            state.query.where.history_date.from = format(startOfYear(new Date()), 'dd/MM/yyyy')
            state.query.where.history_date.to = format(endOfYear(new Date()), 'dd/MM/yyyy')
            break;
        case 5:
            state.query.where.history_date.from = null
            state.query.where.history_date.to = null
            break;

        default:
            break;
    }
})

watch(() => state.query.where, (val) => {
    clearTimeout(state.timeout)
    state.timeout = setTimeout(() => {
        getStats()
    }, 300)
}, { deep: true })

async function openInsuredsTable(row) {
    try {
        state.insuredsTableTitle = row.description
        const { items } = await $api.get('history', {
            params: {
                groupBy: ['t_history.insured_id'],
                where: {
                    history_date: state.query.where.history_date,
                    "js:diagnosis": [row.id]
                }
            }
        });

        state.insuredsTable = items;
        state.dialogDiagnosisTable = true;
    } catch (error) {
        console.log(error);
    }
}

async function openProcedureTable(row) {
    try {
        state.procedureTableTitle = row.description
        const { items } = await $api.get('history', {
            params: {
                groupBy: ['t_history.insured_id'],
                where: {
                    history_date: state.query.where.history_date,
                    "js:mprocedure": [row.id]
                }
            }
        });

        state.procedureTable = items;
        state.dialogProcedureTable = true;
    } catch (error) {
        console.log(error);
    }
}


async function openTreatmentTable(row) {
    try {
        state.treatmentTableTitle = row.description
        const { items } = await $api.get('history', {
            params: {
                groupBy: ['t_history.insured_id'],
                where: {
                    history_date: state.query.where.history_date,
                    "js:treatment": [row.id]
                }
            }
        });
        state.treatmentTable = items;
        state.dialogTreatmentTable = true;
    } catch (error) {
        console.log(error);
    }
}

onMounted(() => {
    getStats()
})
</script>