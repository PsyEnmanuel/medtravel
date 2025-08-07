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
        <div class="flex flex-nowrap w-full gap-2">
            <InsuranceSelect class="mb-2" @setInsurance="setInsurance" @clearInsurance="clearInsurance"
                :model-value="state.query.where.insurance" />
            <div class="grid grid-cols-2 gap-1">
                <div>
                    <div class="bg-stone-100 text-center text-xs">{{ $t('policy_type') }}</div>
                    <q-option-group class="flex gap-1 text-xs" size="xs"
                        v-model="state.query.where['in:$policy_type_id']" toggle-color="secondary"
                        toggle-text-color="text-font" :options="$cats.policy_type" type="checkbox" />
                </div>

                <div>
                    <div class="bg-stone-100 text-center text-xs">{{ $t('policy_branch') }}</div>
                    <q-option-group class="flex gap-1 text-xs" size="xs"
                        v-model="state.query.where['in:$policy_branch_id']" toggle-color="secondary"
                        toggle-text-color="text-font" :options="$cats.policy_branch" type="checkbox" />
                </div>
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
            <template v-slot:body-cell-action="props">
                <q-td :props="props">
                    <div class="flex gap-2">
                        <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
                            @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                        <q-btn flat class="button bg-default text-primary rounded-md" label="consultar" no-caps
                            @click="$router.push(`${$path.policy}/${$path.policy_consult}/${props.row.id}`)" />
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-customer_description="props">
                <q-td :props="props">
                    <span class="line-clamp-1">{{ props.row.customer_description }}</span>
                </q-td>
            </template>
            <template v-slot:body-cell-deductible="props">
                <q-td :props="props">
                    <span class="line-clamp-1">{{ $currency(props.row.deductible) }}</span>
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
                            <span class="text-uppercase line-clamp-1 text-xxs">{{ props.row.ref }}</span>
                            <div class="flex justify-end gap-2 -mr-5 mt-1">
                                <q-btn flat class="button bg-default text-primary rounded-md" size="sm" label="Editar"
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
        <q-dialog class="q-pa-none" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'"
            full-height :full-width="$isDesktop" maximized :transition-duration="100">
            <q-card>
                <PolicyWrite @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit
                    :width="$isDesktop ? '400px' : '100%'" />
            </q-card>
        </q-dialog>
        <q-dialog v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="100">
            <q-card>
                <PolicyWrite @close="state.dialogCreate = false" isDrawer :width="$isDesktop ? '400px' : '100%'" />
            </q-card>
        </q-dialog>
        <q-dialog v-model="state.dialogImport" full-height full-width :transition-duration="100">
            <q-card>
                <FileImport table="t_policy" @close="state.dialogImport = false" />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import PolicyWrite from 'src/pages/policy/components/PolicyWrite.vue'
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import InsuranceSelect from "src/components/select/InsuranceSelect.vue";
import { useFilter } from "src/use/filter";
import FileImport from "src/components/import/FileImport.vue";
const { t } = useI18n()
const tableRef = ref()
const props = defineProps({ insuredId: Number, insurance_id: Number })
const $cats = inject('$cats')

const options = reactive({
    policy_branch: $cats.value.policy_branch
})

const state = reactive({
    dialogImport: false,
    dialogWrite: false,
    dialogList: false,
    dialogCreate: false,
    selectedId: 0,
    dialogWidth: 400,
    selected: [],
    search: '',
    search_key: 'orlike:insured_description,insurance,policy_number',
    pagination: {
        sortBy: 'created',
        descending: true,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'policy',
    query: {
        groupBy: ['t_policy.id'],
        where: {
            'in:$policy_type_id': [],
            'in:$policy_branch_id': [],
            insured_id: props.insuredId ?? null,
            insurance_id: props.insurance_id ?? null,
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
            name: 'customer_description',
            required: true,
            label: t('customer_description'),
            align: 'left',
            field: 'customer_description',
            sortable: true,
            classes: 'w-[200px]'
        },
        {
            name: 'titular_description',
            required: true,
            label: t('titular'),
            align: 'left',
            field: 'titular_description',
            sortable: true,
            classes: 'w-[200px]'
        },
        {
            name: 'policy_number',
            required: true,
            label: t('policy_number'),
            align: 'left',
            field: 'policy_number',
            sortable: true
        },
        {
            name: 'insurance',
            required: true,
            label: t('insurance'),
            align: 'left',
            field: 'insurance',
            sortable: true
        },
        {
            name: 'policy_branch',
            required: true,
            label: t('policy_branch'),
            align: 'left',
            field: 'policy_branch',
            sortable: true
        },
        {
            name: 'policy_type',
            required: true,
            label: t('policy_type'),
            align: 'left',
            field: 'policy_type',
            sortable: true
        },
        // {
        //     name: 'deductible',
        //     required: true,
        //     label: t('deductible'),
        //     align: 'left',
        //     field: 'deductible',
        //     sortable: true
        // },
        {
            name: 'validity_date_end',
            required: true,
            label: t('validity_date_end'),
            align: 'left',
            field: 'validity_date_end',
            sortable: true
        },
    ],
    rows: [
    ]
})

function setInsurance(id) {
    try {
        state.query.where.insurance_id = id
    } catch (error) {
        console.log(error);
    }
}

function clearInsurance() {
    try {
        state.query.where.insurance_id = null
    } catch (error) {
        console.log(error);
    }
}

async function onExport() {
    try {

    } catch (error) {
        console.log(error);
    }
}


const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const { filterFnCategory } = useFilter(options)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_policy, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>