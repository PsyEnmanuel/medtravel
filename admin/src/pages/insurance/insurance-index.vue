<template>
    <q-page :class="insuredId ? 'px-2 py-3' : 'px-1.5 py-2 lg:px-5 lg:py-6'">
        <div class="flex justify-between md:flex-nowrap mb-2">
            <div class="flex flex-nowrap w-full gap-2">
                <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
                    :placeholder="$t('search')">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
                <q-btn flat class="button h-full" icon="add" :label="$isDesktop && $t('add')"
                    @click="state.dialogCreate = true" />
                <q-btn v-if="state.selected.length" flat class="button h-full bg-primary text-white"
                    icon-right="sym_o_remove" :label="$isDesktop ? 'Remover' : ''" no-caps @click="onDeleteRows" />
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
        <q-table :grid="!$isDesktop" hide-pagination :rows="state.rows" :columns="state.columns" row-key="id"
            ref="tableRef" @request="onRequest" flat selection="multiple" v-model:pagination="state.pagination"
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
            <template v-slot:body-cell-description="props">
                <q-td :props="props">
                    <div class="flex flex-col">
                        <div>{{ props.row.description }}</div>
                        <div v-if="props.row.insurance_plan_format"><b class="text-primary">Planes:</b>
                            {{ props.row.insurance_plan_format }}</div>
                        <div v-if="props.row.insurance_plan_type_format"><b class="text-primary">Tipo de planes:</b>
                            {{ props.row.insurance_plan_type_format }}</div>
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-action="props">
                <q-td :props="props">
                    <div class="flex gap-2">
                        <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
                            @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                        <router-link :to="`${$path.insurance}/${$path.insurance_consult}/${props.row.id}`">
                            <q-btn flat class="button bg-default text-primary rounded-md" label="consultar" no-caps />
                        </router-link>
                    </div>
                </q-td>
            </template>

            <template v-slot:item="props">
                <div class="q-py-xs col-xs-12 col-sm-6 col-md-4"
                    :style="props.selected ? 'transform: scale(0.95);' : ''">
                    <div bordered flat class="card pb-2 relative flex flex-nowrap">
                        <div class="absolute right-3 top-2">
                            <q-checkbox dense v-model="props.selected" :label="props.row.name" />
                        </div>
                        <div class="pl-3 pr-8 w-full pt-2 flex flex-col overflow-hidden">
                            <span class="text-uppercase line-clamp-1 font-semibold">{{ props.row.description }}</span>
                            <div v-if="props.row.insurance_plan_format"><b class="text-primary">Planes:</b>
                                {{ props.row.insurance_plan_format }}</div>
                            <div v-if="props.row.insurance_plan_type_format"><b class="text-primary">Tipo de planes:</b>
                                {{ props.row.insurance_plan_type_format }}</div>
                            <div v-if="props.row.total_policy"><b class="text-primary">Pólizas:</b>
                                {{ props.row.total_policy }}</div>
                            <div v-if="props.row.total_insured"><b class="text-primary">Asegurados:</b>
                                {{ props.row.total_insured }}</div>
                            <div class="flex justify-end gap-2 -mr-5 mt-1">
                                <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
                                    @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                                <router-link :to="`${$path.insurance}/${$path.insurance_consult}/${props.row.id}`">
                                    <q-btn flat class="button bg-default text-primary rounded-md" label="consultar"
                                        no-caps />
                                </router-link>
                            </div>
                        </div>

                    </div>
                </div>
            </template>
            <template v-slot:bottom v-if="!$isDesktop">
                <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
            </template>
        </q-table>
        <q-dialog class="q-pa-none" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'"
            full-height :full-width="$isDesktop" maximized :transition-duration="100">
            <q-card>
                <InsuranceWrite @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit
                    :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>
        <q-dialog v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="100">
            <q-card>
                <InsuranceWrite @close="state.dialogCreate = false" isDrawer :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import InsuranceWrite from './components/InsuranceWrite.vue'
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
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
    search_key: 'orlike:description,insurance_plan,insurance_plan_type',
    pagination: {
        sortBy: 'description',
        descending: false,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'insurance',
    query: {
        groupBy: ['t_insurance.id'],
        where: {
            c_status: 4,
        }
    },
    columns: [
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: t('id'),
            classes: 'w-[220px]'
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
            name: 'total_policy',
            required: true,
            label: t('policy'),
            align: 'left',
            field: 'total_policy',
            sortable: true
        },
        {
            name: 'total_insured',
            required: true,
            label: t('insureds'),
            align: 'left',
            field: 'total_insured',
            sortable: true
        },
    ],
    rows: [
    ]
})

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_insurance, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>