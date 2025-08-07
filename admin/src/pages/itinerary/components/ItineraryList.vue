<template>
    <div class="pb-20" :class="isDrawer ? 'p-2' : ''" :style="style">
        <div v-if="isDrawer" class="flex justify-between mb-2">
            <h3 class="text-lg font-bold text-primary">ITINERARIOS</h3>
            <q-btn flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>

        <div class="flex justify-between flex-nowrap flex-col mb-1">
            <div class="flex flex-nowrap">
                <q-input class="w-full mr-2" dense outlined debounce="300" v-model="state.search"
                    :placeholder="$t('search')">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>

            <div v-if="$isDesktop && itemsRange" class="grid grid-flow-col auto-cols-max gap-2 ml-auto">
                <q-btn class="bg-transparent" flat no-caps>{{ itemsRange.start }} - {{ itemsRange.end
                    }} de {{ state.pagination.rowsNumber }}</q-btn>
                <q-btn class="bg-transparent" icon="sym_o_first_page" flat @click="tableRef.firstPage()"></q-btn>
                <q-btn class="bg-transparent" icon="sym_o_navigate_before" flat @click="tableRef.prevPage()"></q-btn>
                <q-btn class="bg-transparent" icon="sym_o_navigate_next" flat @click="tableRef.nextPage()"></q-btn>
                <q-btn class="bg-transparent" icon="sym_o_last_page" flat @click="tableRef.lastPage()"></q-btn>
            </div>
        </div>

        <q-table table-class="table-style-1" grid hide-pagination hide-header :rows="state.rows" row-key="id"
            ref="tableRef" @request="onRequest" flat selection="multiple" v-model:pagination="state.pagination"
            :loading="state.loading" v-model:selected="state.selected" :selected-rows-label="getSelectedString"
            rows-per-page-label="Lineas" :rows-per-page-options="[10, 20, 50, 100]" :wrap-cells="true">

            <template v-slot:no-data="{ icon, message, filter }">
                <NoData :icon="icon" :message="message" :filter="filter" />
            </template>

            <template v-slot:item="props">
                <div class="col-xs-12 overflow-hidden relative mb-2">
                    <ItineraryCard class="card" :item="props.row" @selected="state.selectedId = $event; state.dialogWrite = true;" />
                </div>
            </template>
        </q-table>

        <q-dialog class="q-pa-none left-0" no-refocus v-model="state.dialogWrite"
            :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="$isDesktop ? 100 : 0">
            <q-card>
                <EventWrite isDrawer @close="state.dialogWrite = false" :timestamp="state.timestampSelected" isEdit
                    :id="state.selectedId" :width="$isDesktop ? '1200px' : '100%'" />
            </q-card>
        </q-dialog>
        <q-dialog class="q-pa-none left-0" no-refocus v-model="state.dialogCreate"
            :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="$isDesktop ? 100 : 0">
            <q-card>
                <EventWrite isDrawer @close="state.dialogCreate = false" :timestamp="state.timestampSelected"
                    :insuredId="insuredId" :width="$isDesktop ? '1200px' : '100%'" />
            </q-card>
        </q-dialog>

    </div>
</template>

<script setup>
import { computed, ref, reactive, inject } from 'vue';
const props = defineProps({ width: String, isDrawer: Boolean, insuredId: Number })
import { useTable } from "src/use/table"
import NoData from 'src/components/table/NoData.vue';
import EventWrite from 'src/pages/event/components/EventWrite.vue';
import ItineraryCard from './ItineraryCard.vue';
const $me = inject("$me")

const tableRef = ref()
const state = reactive({
    items: [],
    total: 0,
    loading: true,
    dialogWrite: false,
    dialogRead: false,
    selectedId: 0,
    selected: [],
    search: '',
    search_key: 'orlike:insured',
    pagination: {
        sortBy: 'attendance_datetime',
        descending: true,
        page: 1,
        rowsPerPage: 5,
    },
    url: 'itinerary',
    query: {
        order: {
            attendance_datetime: "ASC"
        },
        join: [{
            table: 't_event',
            relationA: 't_event.id',
            relationB: 't_itinerary.event_id',
        }],
        groupBy: ['t_itinerary.id'],
        where: {
            high_profile: $me.high_profile ? null : 0,
            't_itinerary.c_status': [4],
            't_event.c_status': [4],
            user_id: null,
        },
    },
    rows: [
    ]
})

const { onRequest, getSelectedString, itemsRange } = useTable(state, tableRef)

const style = computed(() => {
    return {
        width: props.width
    }
})

</script>