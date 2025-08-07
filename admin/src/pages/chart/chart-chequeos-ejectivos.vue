<template>
    <div v-if="!state.loading" class="grid lg:grid-cols-2 gap-1">
        <div class="lg:col-span-2 gap-1">
            <div class="flex mb-1">
                <q-option-group class="flex" size="sm" v-model="state.timePeriod" toggle-color="secondary"
                    toggle-text-color="text-font" :options="options.timePeriods" type="radio" />
            </div>
            <div class="flex lg:flex-nowrap gap-1 justify-between">
                <div class="grid grid-cols-2 gap-2">
                    <q-input class="min-w-[150px]" dense outlined v-model="state.query.where.request_date.from"
                        mask="##-##-####">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy ref="proxy">
                                    <q-date flat v-model="state.query.where.request_date.from" no-unset
                                        years-in-month-view minimal @update:model-value="$refs.proxy.hide(); getStats()"
                                        mask="DD-MM-YYYY">
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    <q-input class="min-w-[150px]" dense outlined v-model="state.query.where.request_date.to"
                        mask="##-##-####">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy ref="proxy">
                                    <q-date flat v-model="state.query.where.request_date.to" no-unset
                                        years-in-month-view minimal @update:model-value="$refs.proxy.hide(); getStats()"
                                        mask="DD-MM-YYYY">
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                </div>
                <q-option-group class="flex" v-model="state.$event_state_id"
                    :options="options.event_state"></q-option-group>
            </div>
            <div class="grid lg:grid-cols-3 my-1">
                <UserSelect @setUser="state.query.where.user_id = $event" @clearUser="state.query.where.user_id = null"
                    :model-value="state.user_description" label="Coordinador" :unixroles="24"
                    @update:model-value="getStats()" />
            </div>
            <div class="grid lg:grid-cols-2 gap-1 mb-1">
                <div class="grid grid-cols-3 gap-1">
                    <div class="border border-[#a9a7b1] border-l-4 border-l-primary flex justify-between px-2 rounded">
                        <span>Cantidad</span>
                        <span>{{ state.stats.e.quantity }}</span>
                    </div>
                    <div class="border border-[#a9a7b1] border-l-4 border-l-primary flex justify-between px-2 rounded">
                        <span>Maternidad</span>
                        <span>{{ state.stats.e.pregnant }}</span>
                    </div>
                </div>
            </div>

            <div class="lg:max-w-full max-w-[350px]">
                <q-tabs v-model="state.tab" dense class="text-grey mb-1" active-color="primary"
                    indicator-color="primary" align="justify" narrow-indicator>
                    <q-tab name="provider" label="Proveedores" />
                    <!-- <q-tab name="diagnosis" label="Diagnósticos" /> -->
                    <q-tab name="country" label="País" />
                    <q-tab name="city" label="Ciudades" />
                    <q-tab name="state" label="Estado" />
                    <q-tab name="user" label="Coordinador" />
                </q-tabs>
            </div>

            <q-tab-panels class="p-0" v-model="state.tab" animated>
                <q-tab-panel class="p-0" name="provider">
                    <div class="grid lg:grid-cols-1 gap-1">
                        <div class="flex flex-col w-full gap-1">
                            <ChartPieArrObj :key="state.update" :data="state.stats.e.providerList" name="label"
                                value="value" title="Chequeos Preventivos" subtitle="Chequeos Preventivos" />
                            <ChartTableEvent :list="state.stats.e.providerList" title="Chequeos Preventivos"
                                :stats="state.stats.e" type="provider_description" columnKey="provider_description"
                                hideBtn :event_state_id="state.$event_state_id" :quantity="state.stats.e.quantity" />
                        </div>
                    </div>
                </q-tab-panel>
                <q-tab-panel class="p-0" name="state">
                    <div class="grid lg:grid-cols-1 gap-1">
                        <div class="flex flex-col w-full gap-1">
                            <ChartPieArrObj :key="state.update" :data="state.stats.e.eventStateList" name="label"
                                value="value" title="Coordinaciones por Estado" subtitle="Coordinaciones" />
                            <ChartTableEvent :list="state.stats.e.eventStateList" title="COORDINACIONES"
                                :stats="state.stats.c" type="event_state" columnKey="event_state" hideBtn
                                :event_state_id="state.$event_state_id" :quantity="state.stats.e.quantity" />
                        </div>
                    </div>
                </q-tab-panel>
                <q-tab-panel class="p-0" name="user">
                    <div class="grid lg:grid-cols-1 gap-1">
                        <div class="flex flex-col w-full gap-1">
                            <ChartPieArrObj :key="state.update" :data="state.stats.e.users" name="label" value="value"
                                title="Coordinaciones por Usuario" subtitle="Coordinaciones" />
                            <ChartTableEvent :list="state.stats.e.users" title="COORDINACIONES" :stats="state.stats.c"
                                type="user_description" columnKey="user_description" hideBtn
                                :event_state_id="state.$event_state_id" :quantity="state.stats.e.quantity" />
                        </div>
                    </div>
                </q-tab-panel>
                <q-tab-panel class="p-0" name="country">
                    <div class="grid grid-cols-1 gap-1">
                        <div class="flex flex-col w-full gap-1">
                            <ChartPieArrObj :key="state.update" :data="state.stats.e.countryList" name="label"
                                value="value" title="Chequeos Preventivos por País" subtitle="Chequeos Preventivos" />
                            <ChartTableEvent :list="state.stats.e.countryList" title="Chequeos Preventivos" name="Paises"
                                :stats="state.stats.e" type="country" columnKey="country" hideBtn
                                :event_state_id="state.$event_state_id" :quantity="state.stats.e.quantity" />
                        </div>
                    </div>
                </q-tab-panel>
                <q-tab-panel class="p-0" name="city">
                    <div class="grid grid-cols-1 gap-1">
                        <div class="flex flex-col w-full gap-1">
                            <ChartPieArrObj :key="state.update" :data="state.stats.e.cityList" name="label"
                                value="value" title="Chequeos Preventivos por Ciudad" subtitle="Chequeos Preventivos" />
                            <ChartTableEvent :list="state.stats.e.cityList" title="Chequeos Preventivos" name="Ciudades"
                                :stats="state.stats.e" type="city" columnKey="city" hideBtn
                                :event_state_id="state.$event_state_id" :quantity="state.stats.e.quantity" />
                        </div>
                    </div>
                </q-tab-panel>
            </q-tab-panels>
        </div>
    </div>
</template>

<script setup>
import { inject, onMounted, reactive, watch } from 'vue';
import { format, getDate, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { timePeriods } from 'src/data/options'
import { setTimePeriodQuery } from "src/helpers";
import { useI18n } from 'vue-i18n';
import UserSelect from 'src/components/select/UserSelect.vue';
import ChartTableEvent from './components/ChartTableEvent.vue';
import ChartPieArrObj from 'src/components/chart/ChartPieArrObj.vue';
const { t } = useI18n();

const options = {
    timePeriods: timePeriods.map(i => ({ label: t(i), value: i })),
    event_state: [
        {
            label: 'Todos',
            value: 2
        },
        {
            label: 'Finalizadas',
            value: 1
        },
        {
            label: 'Pendientes',
            value: 0
        },
    ]
}

const start_of_month = startOfMonth(new Date());

const month = format(start_of_month, 'MMMM', { locale: es });

const day = getDate(new Date());

const $api = inject('$api')


const state = reactive({
    tab: 'provider',
    $event_state_id: 0,
    timePeriod: 'all',
    initialPagination: {
        sortBy: 'quantity',
        descending: true,
        page: 1,
        rowsPerPage: 10
    },
    timeout: null,
    dialogEventWrite: false,
    selectedEventId: 0,
    loading: true,
    first: true,
    update: 1,
    day,
    stats: {},
    diagnosis: [],
    dailyList: [],
    eventStateList: [],
    userList: [],
    treatment: [],
    month,
    start: 'all',
    query: {
        group_by: 't_event.id',
        where: {
            'ne:$event_state_id': '40',
            user_id: null,
            $event_type_id: [],
            request_date: {
                from: null,
                to: null,
            },
            c_status: [4],
        },
    },
})

watch(() => state.timePeriod, (val) => {
    setTimePeriodQuery(val, state.query, 'request_date')
    getStats()
})

watch(() => state.query.where.user_id, (val) => {
    getStats()
})

watch(() => state.$event_state_id, (val) => {
    if (val === 2) {
        state.query.where['ne:$event_state_id'] = null
        state.query.where['$event_state_id'] = null
    } else if (val === 1) {
        state.query.where['$event_state_id'] = 40
        state.query.where['ne:$event_state_id'] = null
    } else {
        state.query.where['$event_state_id'] = null
        state.query.where['ne:$event_state_id'] = 40
    }
    getStats()
})

async function getStats() {
    state.stats = await $api.get('event/stats', { params: state.query });
    console.log(state.stats);
    ++state.update
    state.loading = false
}

onMounted(() => {
    getStats()
})
</script>