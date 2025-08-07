<template>
    <div class="flex justify-between md:flex-nowrap mb-1">
        <div class="flex flex-nowrap w-full gap-2">
            <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
                :placeholder="$t('search')">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>
            <q-select class="mb-2" :label="$t('relationship')" dense outlined clearable
                v-model="state.query.where.$relationship_id" use-input hide-selected fill-input input-debounce="0"
                :options="options.relationship"
                @filter="(val, update, abort) => filterFnCategory(val, update, abort, 'relationship')"
                :placeholder="$t('relationship')" option-value="id" option-label="description" emit-value map-options>
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            No data
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
        </div>
        <div class="flex justify-end">
            <div v-if="$isDesktop" class="grid grid-flow-col auto-cols-max gap-2">
                <q-btn class="bg-transparent" flat no-caps>{{ itemsRange.start }} - {{ itemsRange.end
                    }} de {{ state.pagination.rowsNumber }}</q-btn>
                <q-btn class="bg-transparent" icon="sym_o_first_page" flat @click="tableRef.firstPage()"></q-btn>
                <q-btn class="bg-transparent" icon="sym_o_navigate_before" flat @click="tableRef.prevPage()"></q-btn>
                <q-btn class="bg-transparent" icon="sym_o_navigate_next" flat @click="tableRef.nextPage()"></q-btn>
                <q-btn class="bg-transparent" icon="sym_o_last_page" flat @click="tableRef.lastPage()"></q-btn>
            </div>
        </div>
    </div>

    <div class="flex justify-between md:flex-nowrap mb-1">
        <q-option-group class="flex" :options="options.insured_type" type="checkbox"
            v-model="state.query.where.$insured_type_id" />
    </div>

    <q-table table-class="table-style-1" hide-pagination :rows="state.rows" :columns="state.columns" row-key="id"
        ref="tableRef" @request="onRequest" flat v-model:pagination="state.pagination" :loading="state.loading"
        rows-per-page-label="Lineas" :rows-per-page-options="[10, 20, 50, 100]" :wrap-cells="true">
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
                    <q-btn v-if="props.row.$insured_type_id === 165" flat
                        class="button bg-default text-primary rounded-md" label="Editar" no-caps
                        @click="state.selectedId = props.row.id; state.dialogWriteTitular = true;" />
                    <q-btn v-if="props.row.$insured_type_id === 164" flat
                        class="button bg-default text-primary rounded-md" label="Editar" no-caps
                        @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                    <q-btn flat class="button bg-default text-primary rounded-md" label="consultar" no-caps
                        @click="$router.push(`${$path.insured}/${$path.insured_consult}/${props.row.insured_id}`)" />
                </div>
            </q-td>
        </template>
        <template v-if="!$isDesktop" v-slot:bottom>
            <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
        </template>
    </q-table>

    <q-dialog class="q-pa-none left-0" no-refocus v-model="state.dialogWrite"
        :position="$isDesktop ? 'right' : 'standard'" full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <PolicyWriteDependant @close="state.dialogWrite = false;" isEdit isDrawer :id="state.selectedId"
                :width="$isDesktop ? '400px' : '100%'" />
        </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" no-refocus v-model="state.dialogWriteTitular"
        :position="$isDesktop ? 'right' : 'standard'" full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <PolicyWriteTitular @close="state.dialogWriteTitular = false;" isEdit isDrawer :id="state.selectedId"
                :width="$isDesktop ? '400px' : '100%'" />
        </q-card>
    </q-dialog>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
import PolicyWriteDependant from "./PolicyWriteDependant.vue";
import { useI18n } from "vue-i18n";
import { useFilter } from "src/use/filter";
import PolicyWriteTitular from "./PolicyWriteTitular.vue";
const props = defineProps({ insuredId: Number, insuredId: Number, policy_number: String })
const tableRef = ref()
const { t } = useI18n()
const $cats = inject('$cats')
const options = reactive({
    insured_type: $cats.value.insured_type,
    relationship: $cats.value.relationship
})

const state = reactive({
    dialogWrite: false,
    dialogList: false,
    dialogCreate: false,
    selectedId: 0,
    dialogWidth: 400,
    selected: [],
    search: '',
    search_key: 'orlike:t_policy_insured.insured_description,t_policy_insured.insured_code',
    pagination: {
        sortBy: 't_policy_insured.insured_code',
        descending: false,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'policy',
    query: {
        join: [{ table: 't_policy_insured', relationA: 't_policy.id', relationB: 't_policy_insured.policy_id' }],
        groupBy: ['t_policy_insured.id'],
        where: {
            't_policy.c_status': 4,
            't_policy_insured.c_status': 4,
            $insured_type_id: [],
            insured_id: props.insuredId ?? null,
            policy_number: props.policy_number ?? null
        },
        columns: {
            t_policy: ['*'],
            t_insured: ['fullname']
        }
    },
    columns: [
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: t('id'),
            classes: 'w-[230px]'
        },
        {
            name: 'titular_description',
            required: true,
            label: t('titular'),
            align: 'left',
            field: 'titular_description',
            sortable: true
        },
        {
            name: 'insured_description',
            required: true,
            label: t('insured_description'),
            align: 'left',
            field: 'insured_description',
            sortable: true
        },
        {
            name: 'insured_code',
            required: true,
            label: t('insured_code'),
            align: 'left',
            field: 'insured_code',
            sortable: true
        },
        {
            name: 'relationship',
            required: true,
            label: t('relationship'),
            align: 'left',
            field: 'relationship',
            sortable: true
        },
        {
            name: 'insured_type',
            required: true,
            label: t('insured_type'),
            align: 'left',
            field: 'insured_type',
            sortable: true
        },
    ],
    rows: [
    ]
})

const { filterFnCategory } = useFilter(options)

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_policy, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>