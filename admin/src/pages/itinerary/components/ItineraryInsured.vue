<template>
    <div class="p-2">
        <div class="grid grid-cols-2 gap-1">
            <div class="flex flex-col gap-1">
                <UserSelect @setUser="state.query.where.user_id = $event" @clearUser="state.query.where.user_id = null"
                    :model-value="state.user_description" label="Coordinador" :unixroles="24"
                    @update:model-value="getStats()" />
                <ProcedureSelect class="mb-1" @setProcedure="setProcedure($event)" @clearProcedure="clearProcedure()"
                    :model-value="state.procedure_description" />
            </div>
            <div class="flex flex-col gap-1">
                <CountrySelect @setCountry="state.query.where.country_id = $event"
                    @clearCountry="state.query.where.country_id = null" :model-value="state.country" />
                <ProviderSelect class="w-full" @setProvider="state.query.where['t_itinerary.provider_id'] = $event"
                    @clearProvider="state.query.where['t_itinerary.provider_id'] = null"
                    :model-value="state.provider_description" />
            </div>
            <div class="flex flex-col gap-1">
                <DiagnosisSelect @setDiagnosis="state.query.where['js:diagnosis'] = $event"
                    @clearDiagnosis="state.query.where['js:diagnosis'] = null" :model-value="state.diagnosis" />
            </div>
        </div>
        <div class="flex justify-between md:flex-nowrap my-1">
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
        <div class="bg-white rounded-xs flex flex-col gap-1">
            <q-table grid hide-pagination :rows="state.rows" :columns="state.columns" row-key="id" ref="tableRef"
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
                <template v-slot:item="props">
                    <div class="q-py-xs col-xs-12" :style="props.selected ? 'transform: scale(0.95);' : ''">
                        <ItineraryBox :item="props" @selectedId="state.selectedId = $event;" />
                    </div>
                </template>
                <template v-slot:bottom v-if="!$isDesktop">
                    <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
                </template>
            </q-table>
        </div>
    </div>

</template>

<script setup>
import { ref, reactive, computed, onMounted, inject, watch, nextTick } from 'vue';
const $isDesktop = inject('$isDesktop')
const $me = inject("$me")

import { useUpdateStore } from 'src/stores/update';
import UserSelect from "src/components/select/UserSelect.vue";
import ProcedureSelect from 'src/components/select/ProcedureSelect.vue';
import CountrySelect from 'src/components/select/CountrySelect.vue';
import ProviderSelect from 'src/components/select/ProviderSelect.vue';
import DiagnosisSelect from 'src/components/select/DiagnosisSelect.vue';
import ItineraryBox from './ItineraryBox.vue';
import { useTable } from 'src/use/table';

const tableRef = ref()
const props = defineProps({ insuredId: Number })

const state = reactive({
    selected: [],
    selectedId: 0,
    loading: true,
    search: '',
    search_key: 'orlike:doctor_description',
    pagination: {
        sortBy: 'attendance_datetime',
        descending: true,
        page: 1,
        rowsPerPage: 10,
    },
    url: 'itinerary',
    query: {
        order: {
            attendance_datetime: "DESC"
        },
        join: [{
            table: 't_event',
            relationA: 't_event.id',
            relationB: 't_itinerary.event_id',
        }],
        groupBy: ['t_itinerary.id'],
        where: {
            't_event.insured_id': props.insuredId,
            high_profile: $me.high_profile ? null : 0,
            't_itinerary.c_status': [4],
            't_event.c_status': [4],
            user_id: null,
        },
        doctorDetail: true
    },
    columns: [],
    rows: [
    ]
})

async function setProcedure(id) {
    try {
        state.query.where['js:mprocedure'] = id
    } catch (error) {
        console.log(error);
    }
}

function clearProcedure() {
    try {
        state.query.where['js:mprocedure'] = null
    } catch (error) {
        console.log(error);
    }
}

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_task, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>