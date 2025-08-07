<template>
    <div class="flex flex-col">
        <q-input class="w-full" dense outlined debounce="300" v-model="state.search" :placeholder="$t('search')">
            <template v-slot:append>
                <q-icon name="search" />
            </template>
        </q-input>
        <div class="flex flex-nowrap gap-2">
            <q-btn v-if="state.selected.length" flat class="button bg-primary text-white mt-1"
                :label="$isDesktop ? 'Remover' : ''" no-caps @click="onDeleteRows" />
            <div v-if="$isDesktop" class="flex ml-auto">
                <q-btn class="bg-transparent text-xs" flat no-caps>{{ itemsRange.start }} - {{ itemsRange.end
                    }} de {{ state.pagination.rowsNumber }}</q-btn>
                <q-btn class="bg-transparent px-1" icon="sym_o_first_page" flat @click="tableRef.firstPage()"></q-btn>
                <q-btn class="bg-transparent px-1" icon="sym_o_navigate_before" flat
                    @click="tableRef.prevPage()"></q-btn>
                <q-btn class="bg-transparent px-1" icon="sym_o_navigate_next" flat @click="tableRef.nextPage()"></q-btn>
                <q-btn class="bg-transparent px-1" icon="sym_o_last_page" flat @click="tableRef.lastPage()"></q-btn>
            </div>
        </div>
    </div>

    <q-table table-class="table-style-1" grid hide-pagination :rows="state.rows" :columns="state.columns" row-key="id"
        ref="tableRef" @request="onRequest" flat selection="multiple" v-model:pagination="state.pagination"
        v-model:selected="state.selected" :selected-rows-label="getSelectedString" :loading="state.loading"
        rows-per-page-label="Lineas" :rows-per-page-options="[10, 20, 50, 100]" :wrap-cells="true">

        <template v-slot:no-data="{ icon, message, filter }">
            <NoData :icon="icon" :message="message" :filter="filter" />
        </template>

        <template v-slot:item="props">
            <div class="q-py-xs col-xs-12" :style="props.selected ? 'transform: scale(0.95);' : ''">
                <InsuredCard :item="props" @selectedId="state.selectedId = $event; state.dialogWrite = true;" />
            </div>
        </template>
        <template v-if="!$isDesktop" v-slot:bottom>
            <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
        </template>
    </q-table>
    <q-dialog class="q-pa-none left-0" no-refocus v-model="state.dialogWrite"
        :position="$isDesktop ? 'right' : 'standard'" full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <InsuredWrite @close="state.dialogWrite = false;" isEdit isDrawer :id="state.selectedId"
                :width="$isDesktop ? '1000px' : '100%'" />
        </q-card>
    </q-dialog>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
import NoData from "src/components/table/NoData.vue";
import InsuredWrite from "src/pages/insured/components/InsuredWrite.vue";
import InsuredCard from "src/pages/insured/components/insuredCard.vue";
const $isDesktop = inject("$isDesktop")
const tableRef = ref()

const state = reactive({
    isBackButtonPressed: false,
    dialogCreate: false,
    selected: [],
    selectedId: null,
    search: '',
    search_key: 'orlike:fullname,ident_no',
    pagination: {
        sortBy: 'created',
        descending: true,
        page: 1,
        rowsPerPage: $isDesktop ? 10 : 2,
    },
    url: 'insured',
    query: {
        order: {
            modified: 'DESC'
        },
        groupBy: ['t_insured.id'],
        where: {
            c_status: 4,
        },
    },
    columns: [
        {
            name: 'avatar',
            required: true,
            label: '',
            align: 'left',
            field: row => row.sex,
            classes: 'w-[42px]'
        },
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: row => row.id,
            format: val => `${val}`,
            classes: 'w-[100px]'
        },
        {
            name: 'fullname',
            required: true,
            label: 'Nombre',
            align: 'left',
            field: row => row.fullname,
        },
        { name: 'cel', align: 'center', label: 'Celular', field: 'cel' },
        { name: 'email', label: 'Email', field: 'email' },
    ],
    rows: [
    ]
})

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_insured, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })
watch(() => updateStore.table.t_event, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>