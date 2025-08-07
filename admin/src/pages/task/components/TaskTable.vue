<template>
    <q-page :class="insuredId ? 'px-2 py-3' : 'px-1.5 py-2 lg:px-5 lg:py-6'">
        <div class="flex justify-between md:flex-nowrap mb-1">
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
        <div class="flex lg:flex-nowrap gap-1 mb-1">
            <!-- <UserSelect class="w-[150px]" @setUser="state.query.where.user_id = $event"
                @clearUser="state.query.where.user_id = null" :model-value="state.user_description" label="Asignado a:"
                :unixroles="1023" /> -->
            <div class="flex items-center lg:px-4 border border-dashed">
                <q-option-group class="flex" size="xs" :options="options.task_state" type="checkbox"
                    v-model="state.query.where['in:$task_state_id']" />
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
                        <div class="text-xs">{{ props.row.description }}</div>
                        <div class="line-clamp-2 text-xxs">{{ props.row.detail }}</div>
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-user="props">
                <q-td :props="props">
                    <div v-for="u in props.row.user" :key="u.id" class="flex flex-col">
                        <div class="text-xs">{{ u.description }}</div>
                    </div>
                    <q-badge class="text-font bg-default text-xxs">
                        <div>{{ props.row.time_passed }}</div>
                    </q-badge>
                </q-td>
            </template>
            <template v-slot:body-cell-task_state="props">
                <q-td :props="props">
                    <div class="flex flex-nowrap gap-1">
                        <q-badge class="text-font w-2" :style="{ background: props.row.color }"></q-badge><span>{{
                            props.row.task_state }}</span>
                    </div>
                    <hr class="mt-1">
                    <div class="text-xxs">{{ props.row.task_section }}</div>
                </q-td>
            </template>
            <template v-slot:body-cell-sent="props">
                <q-td :props="props">
                    <div class="flex gap-1" v-if="props.row.sent"><span>Si</span>
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-action="props">
                <q-td :props="props">
                    <div class="flex gap-2">
                        <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
                            @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                        <q-btn flat class="button bg-default text-primary rounded-md" label="Consultar" no-caps
                            @click="$router.push(`${$path.task}/${$path.task_consult}/${props.row.id}`)" />
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-created_by="props">
                <q-td :props="props">
                    <div class="flex flex-col text-xs">
                        <span>{{ props.row.created_format }}</span>
                        <span>{{ props.row.created_by }}</span>
                    </div>
                </q-td>
            </template>
            <template v-slot:item="props">
                <div class="q-py-xs col-xs-12 col-sm-6 col-md-4"
                    :style="props.selected ? 'transform: scale(0.95);' : ''">
                    <TaskCard :item="props" @selectedId="state.selectedId = $event; state.dialogWrite = true;" />
                </div>
            </template>
            <template v-slot:bottom v-if="!$isDesktop">
                <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
            </template>
        </q-table>
        <q-dialog class="q-pa-none" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'"
            full-height :full-width="$isDesktop" maximized :transition-duration="100">
            <q-card>
                <TaskWrite @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit
                    :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>
        <q-dialog v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="100">
            <q-card>
                <TaskWrite @close="state.dialogCreate = false" isDrawer :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>
        <q-dialog v-model="state.dialogImport" full-height full-width :transition-duration="100">
            <q-card>
                <FileImport table="t_task" @close="state.dialogImport = false" />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import FileImport from "src/components/import/FileImport.vue";
import TaskCard from "./TaskCard.vue";
import UserSelect from "src/components/select/UserSelect.vue";
import TaskWrite from "./TaskWrite.vue";
const { t } = useI18n()
const tableRef = ref()
const $cats = inject("$cats")
const $me = inject("$me")
const props = defineProps({ created_by_id: Number, user_id: Number })

const options = reactive({
    task_state: $cats.value.task_state.slice().reverse()
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
    search_key: 'orlike:description',
    pagination: {
        sortBy: 'description',
        descending: false,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'task',
    query: {
        groupBy: ['t_task.id'],
        where: {
            c_status: 4,
            created_by_id: props.created_by_id,
            user_id: $me.unixroles & 4 ? null : props.user_id,
            'in:$task_state_id': [329, 330]
        }
    },
    columns: [
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: t('id'),
            classes: 'w-[200px]'
        },
        // {
        //     name: 'file',
        //     required: true,
        //     label: '',
        //     align: 'left',
        //     field: t('id'),
        //     classes: 'w-[100px]'
        // },
        {
            name: 'description',
            required: true,
            label: t('detail'),
            align: 'left',
            field: 'description',
            sortable: true
        },
        {
            name: 'task_state',
            required: true,
            label: t('task_state'),
            align: 'left',
            field: 'task_state',
            classes: 'w-[120px]',
            sortable: true
        },
        {
            name: 'user',
            required: true,
            label: t('assigned'),
            align: 'left',
            field: 'user',
            classes: 'w-[150px]',
            sortable: true
        },
        {
            name: 'created_by',
            required: true,
            label: t('created_by'),
            align: 'left',
            field: 'created_by',
            classes: 'w-[150px]',
            sortable: true
        },
    ],
    rows: [
    ]
})

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_task, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>