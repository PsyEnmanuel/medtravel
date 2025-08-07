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
                <!-- <q-btn flat class="button h-full" icon="fa-solid fa-download" :label="$isDesktop && $t('export')"
                    @click="onExport" />
                <q-btn flat class="button h-full" icon="fa-solid fa-upload" :label="$isDesktop && $t('import')"
                    @click="state.dialogImport = true" /> -->
                <q-btn v-if="state.selected.length" flat class="button h-full bg-primary text-white"
                    icon-right="sym_o_remove" :label="$isDesktop ? 'Desactivar' : ''" no-caps @click="onDeleteRows" />
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
        <div class="grid lg:grid-cols-4 mb-2">
            <q-select v-model="state.query.where['jo:$attention_type_ids']" use-chips dense outlined clearable multiple
                :options="options.attention_type" option-value="id" :label="$t('attention_type')"
                option-label="description" emit-value map-options use-input @filter="(val, update, abort) =>
                    filterFnCategory(val, update, abort, 'attention_type')" />
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

            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td>
                        <q-checkbox v-model="props.selected" color="primary" size="xs" />
                    </q-td>
                    <template v-for="col in props.cols" :key="col.name">
                        <template v-if="col.name === 'description'">
                            <q-td :key="col.name" :props="props">
                                <div class="flex flex-col">
                                    <div>{{ props.row.description }}</div>
                                    <div class="text-xxs">{{ props.row.postnominal.join(',') }}</div>
                                </div>
                            </q-td>
                        </template>
                        <template v-else-if="col.name === 'speciality'">
                            <q-td :key="col.name" :props="props">
                                <div class="flex flex-col" v-for="p in props.row.speciality" :key="p.id">
                                    <div class="subtitle text-xs">{{ p.description }}</div>
                                    <ul class="flex flex-col list-inside text-xxs mt-1" v-for="s in p.sub" :key="s.id">
                                        <li v-if="s.checked">{{ s.description }}</li>
                                    </ul>
                                </div>
                            </q-td>
                        </template>
                        <template v-else-if="col.name === 'provider'">
                            <q-td :key="col.name" :props="props">
                                <div class="flex flex-col" v-for="p in props.row.provider" :key="p.id">
                                    <div class="subtitle text-xs mb-1">{{ p.description }}</div>
                                </div>
                            </q-td>
                        </template>
                        <template v-else-if="col.name === 'bio'">
                            <q-td :key="col.name" :props="props">
                                <div class="flex flex-col">
                                    <div class="line-clamp-1">{{ props.row.bio }}</div>
                                </div>
                            </q-td>
                        </template>
                        <template v-else-if="col.name === 'action'">
                            <q-td :key="col.name" :props="props">
                                <div class="flex gap-2">
                                    <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
                                        @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                                    <q-btn flat class="button bg-default text-primary rounded-md" label="consultar"
                                        no-caps
                                        @click="$router.push(`${$path.doctor}/${$path.doctor_consult}/${props.row.id}`)" />
                                </div>
                            </q-td>
                        </template>
                        <template v-else-if="col.name === 'c_status'">
                            <q-td :key="col.name" :props="props">
                                <q-badge class="bg-primary" v-if="props.row.c_status & 4">Activado</q-badge>
                                <q-badge class="bg-secondary" v-else>Desactivado</q-badge>
                            </q-td>
                        </template>
                        <template v-else>
                            <q-td :key="col.name" :props="props">
                                {{ col.value }}
                            </q-td>
                        </template>
                    </template>
                </q-tr>
            </template>


            <template v-slot:item="props">
                <div class="q-py-xs col-xs-12 col-sm-6 col-md-4"
                    :style="props.selected ? 'transform: scale(0.95);' : ''">
                    <DoctorCard :item="props" @selectedId="state.selectedId = $event; state.dialogWrite = true;" />
                </div>
            </template>
            <template v-slot:bottom v-if="!$isDesktop">
                <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
            </template>
        </q-table>
        <q-dialog class="q-pa-none" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'"
            full-height :full-width="$isDesktop" maximized :transition-duration="100">
            <q-card>
                <DoctorWrite @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit
                    :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>
        <q-dialog v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="100">
            <q-card>
                <DoctorWrite @close="state.dialogCreate = false" isDrawer :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>
        <q-dialog v-model="state.dialogImport" full-height full-width :transition-duration="100">
            <q-card>
                <FileImport table="t_doctor" @close="state.dialogImport = false" />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import DoctorWrite from './components/DoctorWrite.vue'
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import { useFilter } from "src/use/filter";
import FileImport from "src/components/import/FileImport.vue";
import DoctorCard from "./components/DoctorCard.vue";
const { t } = useI18n()
const tableRef = ref()
const $cats = inject('$cats');
const $api = inject('$api');

const options = reactive({
    attention_type: $cats.value.attention_type,
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
    url: 'doctor',
    query: {
        groupBy: ['t_doctor.id'],
        where: {
            'jo:$attention_type_ids': [],
            'bi:c_status': 5,
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
            sortable: true,
            classes: 'w-[220px]'
        },
        {
            name: 'attention_type',
            required: true,
            label: t('attention_type'),
            align: 'left',
            field: 'attention_type',
            sortable: true,
            classes: 'w-[100px]',
            format(value, row) {
                return row.attention_type.join(', ')
            }
        },
        {
            name: 'speciality',
            required: true,
            label: t('specialities'),
            align: 'left',
            field: 'speciality',
            sortable: true,
            classes: 'w-[220px]'
        },
        {
            name: 'provider',
            required: true,
            label: t('providers'),
            align: 'left',
            field: 'provider',
            sortable: true,
        },
        {
            name: 'note',
            required: true,
            label: t('note'),
            align: 'left',
            field: 'note',
            sortable: true,
        },
        {
            name: 'c_status',
            required: true,
            label: t('c_status'),
            align: 'left',
            field: 'c_status',
            sortable: true,
        },
    ],
    rows: [
    ]
})

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const { filterFnCategory } = useFilter(options)

async function onExport() {
    try {

    } catch (error) {
        console.log(error);
    }
}

async function onChange(val, id) {
    try {
        await $api.put(`doctor/${id}`, { c_status: val })
    } catch (error) {
        console.log(error);
    }
}

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_doctor, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>