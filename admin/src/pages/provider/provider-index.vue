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
                <!-- <q-btn flat class="button h-full" icon="fa-solid fa-download" :label="$isDesktop && $t('export')"
                    @click="onExport" />
                <q-btn flat class="button h-full" icon="fa-solid fa-upload" :label="$isDesktop && $t('import')"
                    @click="state.dialogImport = true" /> -->
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
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-webpage="props">
                <q-td :props="props">
                    <div class="flex flex-col">
                        <a class="text-primary line-clamp-1" :href="props.row.webpage" target="_blank">{{
                            props.row.webpage }}</a>
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-link_gps="props">
                <q-td :props="props">
                    <div class="flex flex-col">
                        <a class="text-primary line-clamp-1" :href="props.row.link_gps" target="_blank">{{
                            props.row.link_gps }}</a>
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-action="props">
                <q-td :props="props">
                    <div class="flex gap-2">
                        <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
                            @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                        <q-btn flat class="button bg-default text-primary rounded-md" label="consultar" no-caps
                            @click="$router.push(`${$path.provider}/${$path.provider_consult}/${props.row.id}`)" />
                    </div>
                </q-td>
            </template>

            <template v-slot:item="props">
                <div class="q-py-xs col-xs-12 col-sm-6 col-md-4"
                    :style="props.selected ? 'transform: scale(0.95);' : ''">
                    <ProviderCard :item="props" @selectedId="state.selectedId = $event; state.dialogWrite = true;" />
                </div>
            </template>
            <template v-slot:bottom v-if="!$isDesktop">
                <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
            </template>
        </q-table>
        <q-dialog class="q-pa-none" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'"
            full-height :full-width="$isDesktop" maximized :transition-duration="100">
            <q-card>
                <ProviderWrite @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit
                    :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>
        <q-dialog v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="100">
            <q-card>
                <ProviderWrite @close="state.dialogCreate = false" isDrawer :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>
        <q-dialog v-model="state.dialogImport" full-height full-width :transition-duration="100">
            <q-card>
                <FileImport table="t_provider" @close="state.dialogImport = false" />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import ProviderWrite from './components/ProviderWrite.vue'
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import FileImport from "src/components/import/FileImport.vue";
import ProviderCard from "./components/ProviderCard.vue";
const { t } = useI18n()
const tableRef = ref()

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
    url: 'provider',
    query: {
        groupBy: ['t_provider.id'],
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
            classes: 'w-[230px]'
        },
        {
            name: 'description',
            required: true,
            label: t('name'),
            align: 'left',
            field: 'description',
            classes: 'w-[250px]',
            sortable: true
        },
        {
            name: 'provider_type',
            required: true,
            label: t('provider_type'),
            align: 'left',
            field: 'provider_type',
            sortable: true
        },
        {
            name: 'country',
            required: true,
            label: t('country'),
            align: 'left',
            field: 'country',
            sortable: true
        },
        {
            name: 'city',
            required: true,
            label: t('city'),
            align: 'left',
            field: 'city',
            sortable: true
        },
        {
            name: 'phone',
            required: true,
            label: t('phone'),
            align: 'left',
            field: 'phone',
            sortable: true
        },
        {
            name: 'address',
            required: true,
            label: t('address'),
            align: 'left',
            field: 'address',
            sortable: true
        },
        {
            name: 'webpage',
            required: true,
            label: t('webpage'),
            align: 'left',
            field: 'webpage',
            classes: 'max-w-[200px]',
            sortable: true,
        },
        {
            name: 'link_gps',
            required: true,
            label: t('link_gps'),
            align: 'left',
            field: 'link_gps',
            classes: 'max-w-[200px]',
            sortable: true
        },
    ],
    rows: [
    ]
})

async function onExport() {
    try {

    } catch (error) {
        console.log(error);
    }
}

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_provider, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>