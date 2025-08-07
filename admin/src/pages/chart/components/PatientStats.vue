<template>
    <div class="p-2" v-if="!state.loading">
        <div class="subtitle mb-2 text-center">Estadísticas Asegurados</div>
        <div class="grid md:grid-cols-2 gap-2 mb-1">
            <div class="grid grid-cols-2 gap-2">
                <q-input dense outlined v-model="state.query.where.created.from" mask="##-##-####">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="proxy">
                                <q-date flat v-model="state.query.where.created.from" no-unset years-in-month-view
                                    minimal @update:model-value="$refs.proxy.hide()" mask="DD-MM-YYYY">
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input dense outlined v-model="state.query.where.created.to" mask="##-##-####">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="proxy">
                                <q-date flat v-model="state.query.where.created.to" no-unset years-in-month-view minimal
                                    @update:model-value="$refs.proxy.hide()" mask="DD-MM-YYYY">
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
        <div class="grid md:grid-cols-3 gap-2">
            <q-select class="md:mb-2" dense outlined clearable v-model="state.query.where['jc:diagnosis_ids']"
                :label="$t('diagnosis')" :options="state.diagnosisList" option-value="id" option-label="description"
                emit-value map-options multiple use-chips
                @filter="(val, update, abort) => filterFn(val, update, abort, 'diagnosis', state.diagnosis)" use-input
                fill-input>
                <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                        <q-item-section>
                            <q-item-label>{{ scope.opt.description }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-item-label>Cant: {{ scope.opt.quantity }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </template>
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            No data
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
            <q-select class="md:mb-2" dense outlined clearable v-model="state.query.where['jc:mprocedure_ids']"
                :label="$t('procedure')" :options="state.mprocedureList" option-value="id" option-label="description"
                emit-value map-options multiple use-chips>
                <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                        <q-item-section>
                            <q-item-label>{{ scope.opt.description }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-item-label>Cant: {{ scope.opt.quantity }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </template>
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            No data
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
            <q-select class="md:mb-2" dense outlined clearable v-model="state.query.where.$sex_id" :label="$t('sex')"
                :options="$cats.sex" option-value="id" option-label="description" emit-value map-options>
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            No data
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div class="card">
                <ChartPie :key="state.update" :data="state.stats.sex" name="sex" title="Sexo" subtitle="Asegurados" />
            </div>
            <div class="card">
                <ChartBarVertical :key="state.update" :data="state.stats.ages_range" name="age" title="Edad"
                    subtitle="Asegurados" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted, inject, watch, computed } from 'vue'
import { format, startOfYesterday, startOfMonth, endOfMonth, endOfYear, startOfYear, getDate } from "date-fns"
const $cats = inject("$cats")
import { es } from 'date-fns/locale';
import ChartBarVertical from 'src/components/chart/ChartBarVertical.vue'
import ChartPie from 'src/components/chart/ChartPie.vue'
import { useFilter } from 'src/use/filter';

const start_of_month = startOfMonth(new Date());

const month = format(start_of_month, 'MMMM', { locale: es });

const day = getDate(new Date());

const $api = inject('$api')

const options = reactive({
    diagnosis: []
})

const state = reactive({
    quickDate: 2,
    dialogDiagnosisTable: false,
    searchDiagnosis: null,
    searchProcedure: null,
    loading: true,
    first: true,
    update: 1,
    tab: 'diagnosis',
    tabs: [
        {
            name: 'diagnosis',
            label: 'Diagnóstico',
        },
        {
            name: 'age',
            label: 'Edad',
        },
        {
            name: 'cities',
            label: 'Ciudad',
        },
        {
            name: 'sex',
            label: 'Sexo',
        },
    ],
    day,
    stats: {},
    diagnosis: [],
    diagnosisList: [],
    mprocedureList: [],
    treatment: [],
    month,
    start: 'all',
    query: {
        group_by: 't_insured.id',
        where: {
            $sex_id: null,
            "jc:diagnosis_ids": [],
            "jc:mprocedure_ids": [],
            created: {
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
    insuredsTableTitle: null,
    insuredsTable: [],
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
            name: 'description',
            required: true,
            label: 'Nombre',
            align: 'left',
            field: 'description',
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
    ]
})

watch(() => state.quickDate, (val) => {

    switch (val) {
        case 0:
            state.query.where.created.from = format(new Date(), 'dd/MM/yyyy')
            state.query.where.created.to = format(new Date(), 'dd/MM/yyyy')
            break;
        case 1:
            state.query.where.created.from = format(startOfYesterday(new Date()), 'dd/MM/yyyy')
            state.query.where.created.to = format(startOfYesterday(new Date()), 'dd/MM/yyyy')
            break;
        case 2:
            state.query.where.created.from = format(startOfMonth(new Date()), 'dd/MM/yyyy')
            state.query.where.created.to = format(endOfMonth(new Date()), 'dd/MM/yyyy')
            break;
        case 3:
            state.query.where.created.from = format(subMonths(startOfMonth(new Date()), 1), 'dd/MM/yyyy')
            state.query.where.created.to = format(subMonths(endOfMonth(new Date()), 1), 'dd/MM/yyyy')
            break;
        case 4:
            state.query.where.created.from = format(startOfYear(new Date()), 'dd/MM/yyyy')
            state.query.where.created.to = format(endOfYear(new Date()), 'dd/MM/yyyy')
            break;
        case 5:
            state.query.where.created.from = null
            state.query.where.created.to = null
            break;

        default:
            break;
    }
})

async function getStats() {
    state.stats = await $api.get('insured/stats', { params: state.query });
    if (state.first) {
        state.diagnosisList = [...state.stats.diagnosisList]
        options.diagnosis = [...state.stats.diagnosisList]
        state.mprocedureList = [...state.stats.mprocedureList]
        // state.first = false
    }
    ++state.update
}

const { filterFn } = useFilter(options)

watch(() => state.query.where, (val) => {
    getStats()
}, { deep: true })

onMounted(async () => {
    await getStats()
    state.loading = false
})


</script>