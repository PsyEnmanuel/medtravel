<template>
    <div v-if="!state.loading">
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
        <div class="grid lg:grid-cols-3 gap-1 mb-1">
            <InsuranceSelect @setInsurance="setInsurance" @clearInsurance="clearInsurance"
                :model-value="state.query.where.insurance" />
            <CountrySelect @setCountry="setCountry" @clearCountry="clearCountry"
                :model-value="state.query.where.country" />
            <q-select dense outlined clearable v-model="state.query.where['jc:language_ids']"
                :label="$t('languages')" multiple :options="options.languages" option-value="value" option-label="label"
                emit-value map-options>
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            No data
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
        </div>
        <div class="grid grid-cols-1 gap-2">
            <div class="card">
                <ChartPie :key="state.update" :data="state.stats.sex" name="sex" title="Sexo" subtitle="Asegurados" />
            </div>
            <div class="card">
                <ChartBarVertical :key="state.update" :data="state.stats.ages_range" name="age" title="Edad"
                    subtitle="Asegurados" />
            </div>
            <div class="card">
                <ChartPie :key="state.update" :data="state.stats.insurances" name="insurance" title="Seguros Médicos"
                    subtitle="Asegurados" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted, inject, watch, computed } from 'vue'
import { format, startOfYesterday, startOfMonth, endOfMonth, endOfYear, subMonths, startOfYear, getDate } from "date-fns"
import languages from 'src/data/languages';
const $cats = inject("$cats")
import { es } from 'date-fns/locale';
import ChartBarVertical from 'src/components/chart/ChartBarVertical.vue'
import ChartPie from 'src/components/chart/ChartPie.vue'
import { useFilter } from 'src/use/filter';
import InsuranceSelect from 'src/components/select/InsuranceSelect.vue';
import CountrySelect from 'src/components/select/CountrySelect.vue';

const start_of_month = startOfMonth(new Date());

const month = format(start_of_month, 'MMMM', { locale: es });

const day = getDate(new Date());

const $api = inject('$api')

const options = reactive({
    languages: languages.filter(i => i.available),
})

const state = reactive({
    quickDate: 5,
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
            "jc:language_ids": [],
            created: {
                from: null,
                to: null
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
    ++state.update
}

function setInsurance(id) {
    try {
        state.query.where['js:policies|insurance_id'] = [id]
    } catch (error) {
        console.log(error);
    }
}

function clearInsurance() {
    try {
        state.query.where['js:policies|insurance_id'] = null
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

watch(() => state.query.where, (val) => {
    getStats()
}, { deep: true })

onMounted(async () => {
    await getStats()
    state.loading = false
})


</script>