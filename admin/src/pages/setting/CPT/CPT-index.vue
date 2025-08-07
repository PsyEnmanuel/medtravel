<template>
    <q-page :class="!$isDesktop ? 'px-1.5 py-2' : insuredId ? 'px-2 py-3' : 'px-1.5 py-2 lg:px-5 lg:py-6'">
        <div class="flex justify-between md:flex-nowrap">
            <div class="flex flex-nowrap w-full gap-2 mb-1">
                <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
                    :placeholder="$t('search')">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
                <q-btn v-if="$me.unixroles & 7" flat class="button h-full" icon="add" :label="$isDesktop && $t('add')"
                    @click="state.dialogCreate = true" />
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
        <q-table :grid="!$isDesktop" hide-pagination :rows="state.rows" :columns="state.columns" row-key="id" ref="tableRef"
            @request="onRequest" flat v-model:pagination="state.pagination" :loading="state.loading"
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
                <div class="q-py-xs col-xs-12 col-sm-6 col-md-4" :style="props.selected ? 'transform: scale(0.95);' : ''">
                    <div bordered flat class="card pb-2 relative flex flex-nowrap">
                        <div class="absolute right-3 top-2">
                            <q-checkbox dense v-model="props.selected" :label="props.row.name" />
                        </div>
                        <div class="pl-3 pr-8 w-full pt-2 flex flex-col overflow-hidden">
                            <span class="text-uppercase line-clamp-1 font-semibold">{{ props.row.description }}</span>
                            <span class="text-uppercase line-clamp-1 text-xxs">{{ props.row.ref }}</span>
                            <div class="flex justify-end gap-2 -mr-5 mt-1">
                                <q-btn flat class="button-press bg-primary text-white rounded-md" size="sm" label="Editar"
                                    no-caps @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                            </div>
                        </div>

                    </div>
                </div>
            </template>
            <template v-slot:bottom v-if="!$isDesktop">
                <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
            </template>
        </q-table>
    </q-page>
    <q-dialog class="q-pa-none" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'" full-height
        :full-width="$isDesktop" maximized :transition-duration="100">
        <q-card>
            <CPTWrite @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit
                :width="$isDesktop ? '400px' : '100%'" />
        </q-card>
    </q-dialog>
    <q-dialog v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
        :transition-duration="100">
        <q-card>
            <CPTWrite @close="state.dialogCreate = false" isDrawer :width="$isDesktop ? '400px' : '100%'" />
        </q-card>
    </q-dialog>
</template>

<script setup>
import { reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import CPTWrite from "./components/CPTWrite.vue";
const { t } = useI18n()
const tableRef = ref()

const state = reactive({
    dialogWrite: false,
    dialogList: false,
    dialogCreate: false,
    selectedId: 0,
    dialogWidth: 400,
    selected: [],
    search: '',
    search_key: 'orlike:code,description',
    pagination: {
        sortBy: 'code',
        descending: false,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'CPT',
    query: {
        groupBy: ['t_CPT.id'],
        where: {
            c_status: 4,
        }
    },
    columns: [
        {
            name: 'code',
            required: true,
            label: t('code'),
            align: 'left',
            field: 'code',
            sortable: true
        },
        {
            name: 'description',
            required: true,
            label: t('name'),
            align: 'left',
            field: 'description',
            sortable: true
        },
        {
            name: 'description',
            required: true,
            label: t('name'),
            align: 'left',
            field: 'description',
            sortable: true,
            format: (val, row) => {
                return `${row.code} - ${row.description}`
            }
        },
    ],
    rows: [
    ]
})

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_CPT, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>