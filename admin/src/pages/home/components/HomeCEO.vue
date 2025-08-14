<template>
  <div v-if="!state.loading" class="grid lg:grid-cols-3 gap-1">
      <div class="lg:col-span-1 col-span-3">
          <CalendarCEO />
      </div>
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

          <div class="lg:max-w-full max-w-[350px]">
              <q-tabs v-model="state.tab" dense class="text-grey mb-1 w-full" active-color="primary"
                  indicator-color="primary" align="justify" narrow-indicator outside-arrows>
                  <q-tab name="provider" label="Proveedores" />
                  <q-tab name="diagnosis" label="Diagnósticos" />
                  <q-tab name="country" label="País" />
                  <q-tab name="city" label="Ciudades" />
              </q-tabs>
          </div>

          <q-tab-panels class="p-0" v-model="state.tab" animated>
              <q-tab-panel class="p-0" name="provider">
                  <div class="grid md:grid-cols-3 grid-cols-2 gap-1 mb-1">
                      <div
                          class="border border-[#a9a7b1] border-l-4 border-l-primary flex justify-between px-2 rounded">
                          <span>Cantidad</span>
                          <span>{{ state.stats.c.quantity }}</span>
                      </div>
                      <div
                          class="border border-[#a9a7b1] border-l-4 border-l-primary flex justify-between px-2 rounded">
                          <span>Maternidad</span>
                          <span>{{ state.stats.c.pregnant }}</span>
                      </div>
                  </div>
                  <div class="grid lg:grid-cols-2 gap-1">
                      <div class="flex flex-col w-full gap-1">
                          <ChartPieArrObj :key="state.update" :data="state.stats.c.providerList" name="label"
                              value="value" title="Coordinaciones por Proveedores" subtitle="Coordinaciones" />
                          <ChartTableEvent :list="state.stats.c.providerList" title="COORDINACIONES"
                              :stats="state.stats.c" type="provider_description" columnKey="provider_description"
                              hideBtn :event_state_id="state.$event_state_id" :quantity="state.stats.c.quantity" />
                      </div>
                      <div class="flex flex-col w-full gap-1">
                          <ChartPieArrObj :key="state.update" :data="state.stats.e.providerList" name="label"
                              value="value" title="Chequeos Preventivos por Proveedores"
                              subtitle="Chequeos Preventivos" />
                          <ChartTableEvent :list="state.stats.e.providerList" title="Chequeos Preventivos"
                              name="Proveedores" :stats="state.stats.e" type="provider_description"
                              columnKey="provider_description" hideBtn :event_state_id="state.$event_state_id"
                              :quantity="state.stats.e.quantity" />
                      </div>
                  </div>
              </q-tab-panel>
              <q-tab-panel class="p-0" name="diagnosis">
                <div class="grid md:grid-cols-3 grid-cols-2 gap-1 mb-1">
                  <div
                      class="border border-[#a9a7b1] border-l-4 border-l-primary flex justify-between px-2 rounded">
                      <span>Cantidad</span>
                      <span>{{ state.stats.e.quantity }}</span>
                  </div>
                  <div
                      class="border border-[#a9a7b1] border-l-4 border-l-primary flex justify-between px-2 rounded">
                      <span>Maternidad</span>
                      <span>{{ state.stats.e.pregnant }}</span>
                  </div>
                </div>
                <div class="flex justify-center gap-4">
                  <q-tabs v-model="state.diagnosisBy" dense class="text-grey mb-1 w-full" active-color="primary"
                  indicator-color="primary" align="center" narrow-indicator outside-arrows>
                  <q-tab name="code" label="Grupo" @click="()=>getDiagnosisDataBy('code')" />
                  <q-tab name="list" label="Código" @click="()=>getDiagnosisDataBy('list')" />
                  </q-tabs>
                </div>
                <div class="grid gap-1">
                  <div class="flex flex-col w-full gap-1">
                    <ChartPieArrObj :key="state.update" :data="state.diagnosisGraph.data" name="label"
                      value="value" :title="state.diagnosisGraph.title" subtitle="Coordinaciones" 
                      :hideLegend="state.diagnosisBy == 'code'" />
                    <ChartTableEvent :list="state.diagnosisGraph.data" title="COORDINACIONES"
                      name="Diagnóstico" :stats="state.stats.c" type="diagnosis" columnKey="diagnosis" hideBtn
                      :event_state_id="state.$event_state_id" :quantity="state.stats.c.quantity" />
                  </div>
                </div>
              </q-tab-panel>
              <q-tab-panel class="p-0" name="country">
                  <div class="grid md:grid-cols-3 grid-cols-2 gap-1 mb-1">
                      <div
                          class="border border-[#a9a7b1] border-l-4 border-l-primary flex justify-between px-2 rounded">
                          <span>Cantidad</span>
                          <span>{{ state.stats.e.quantity }}</span>
                      </div>
                      <div
                          class="border border-[#a9a7b1] border-l-4 border-l-primary flex justify-between px-2 rounded">
                          <span>Maternidad</span>
                          <span>{{ state.stats.e.pregnant }}</span>
                      </div>
                  </div>
                  <div class="grid md:grid-cols-2 gap-1">
                      <div class="flex flex-col w-full gap-1">
                          <ChartPieArrObj :key="state.update" :data="state.stats.c.countryList" name="label"
                              value="value" title="Coordinaciones por País" subtitle="Coordinaciones" />
                          <ChartTableEvent :list="state.stats.c.countryList" title="COORDINACIONES" name="Paises"
                              :stats="state.stats.c" type="country" columnKey="country" hideBtn
                              :event_state_id="state.$event_state_id" :quantity="state.stats.c.quantity" />
                      </div>
                      <div class="flex flex-col w-full gap-1">
                          <ChartPieArrObj :key="state.update" :data="state.stats.e.countryList" name="label"
                              value="value" title="Chequeos Preventivos por País" subtitle="Chequeos Preventivos" />
                          <ChartTableEvent :list="state.stats.e.countryList" title="Chequeos Preventivos"
                              name="Paises" :stats="state.stats.e" type="country" columnKey="country" hideBtn
                              :event_state_id="state.$event_state_id" :quantity="state.stats.e.quantity" />
                      </div>
                  </div>
              </q-tab-panel>
              <q-tab-panel class="p-0" name="city">
                  <div class="grid md:grid-cols-3 grid-cols-2 gap-1 mb-1">
                      <div
                          class="border border-[#a9a7b1] border-l-4 border-l-primary flex justify-between px-2 rounded">
                          <span>Cantidad</span>
                          <span>{{ state.stats.e.quantity }}</span>
                      </div>
                      <div
                          class="border border-[#a9a7b1] border-l-4 border-l-primary flex justify-between px-2 rounded">
                          <span>Maternidad</span>
                          <span>{{ state.stats.e.pregnant }}</span>
                      </div>
                  </div>
                  <div class="grid md:grid-cols-2 gap-1">
                      <div class="flex flex-col w-full gap-1">
                          <ChartPieArrObj :key="state.update" :data="state.stats.c.cityList" name="label"
                              value="value" title="Coordinaciones por Ciudad" subtitle="Coordinaciones" />
                          <ChartTableEvent :list="state.stats.c.cityList" title="COORDINACIONES" name="Ciudades"
                              :stats="state.stats.c" type="city" columnKey="city" hideBtn
                              :event_state_id="state.$event_state_id" :quantity="state.stats.c.quantity" />
                      </div>
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
import ChartPieArrObj from 'src/components/chart/ChartPieArrObj.vue';
import ChartTableEvent from 'src/pages/chart/components/ChartTableEvent.vue';
import CalendarCEO from 'src/pages/chart/components/CalendarCEO.vue';
import ICD_GROUP  from 'src/data/icd_group';
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
  ],
  statsType: [{
      value: "provider", label: "Proveedores",
  }, {
      value: "diagnosis", label: "Diagnósticos",

  }, {
      value: "country", label: "País",
  }, {
      value: "city", label: "Ciudades",
  }]
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
  diagnosisBy: 'code',
  diagnosisGraph: { title: 'Coordinaciones por Diagnóstico', data: [] },
  diagnosisByGroupDesc: [],
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

function groupByGroupDesc(data) {
  const grouped = {};

  for (const [code, item] of Object.entries(data)) {
    const group = item.group_desc || "unknown";

    if (!grouped[group]) {
      grouped[group] = { value: 0, label: '' };
    }
    grouped[group].value += item.quantity;
    grouped[group].label = `[${group}] ${ICD_GROUP[group]['en']}` || '';
  }

  return Object.values(grouped);
}

function getDiagnosisDataBy(val){
  state.diagnosisBy = val
  if(val === 'code'){
    state.diagnosisGraph = { title: 'Coordinaciones por Diagnóstico de grupo', data: state.diagnosisByGroupDesc }
  } else {
    state.diagnosisGraph = { title: 'Coordinaciones por Diagnóstico', data:  state.stats.c.diagnosisList }
  }
  ++state.update
}

async function getStats() {
  state.stats = await $api.get('event/stats', { params: state.query });
  state.diagnosisByGroupDesc = groupByGroupDesc(state.stats.c.diagnosis);
  getDiagnosisDataBy(state.diagnosisBy)
  state.loading = false
}

onMounted(() => {
  getStats()
})
</script>