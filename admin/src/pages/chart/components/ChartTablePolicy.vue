<template>
    <div>
        <div class="bg-white card p-4 max-h-[400px] overflow-auto">
            <div class="flex items-center justify-between">
                <div class="flex mb-2">
                    <span class="uppercase flex items-center subtitle mr-2 px-4">{{ props.title }}</span>
                    <q-input class="mr-2" dense outlined debounce="300" v-model="state.search"
                        :placeholder="$t('search')">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </div>
                <div class="flex gap-2">
                    <q-btn flat class="button h-full " icon-right="sym_o_download" label="Reportes"
                        @click="getReport({ title })" />
                    <q-btn flat class="button h-full" icon-right="sym_o_download" label="Excel"
                        @click="getReportExcel()" />
                </div>
            </div>
            <q-table flat :rows="listComputed" :columns="state.columns" row-key="name" dense
                no-data-label="No hay tratamiento para esta fecha" :rows-per-page-options="[0]" wrap-cells>
                <template v-slot:body-cell-action="props">
                    <q-td :props="props">
                        <q-btn flat class="button bg-green-400" size="xs" label="pólizas" no-caps
                            @click="openDialogTable(columnKey, props.row.label, columnKey)" />
                    </q-td>
                </template>
                <template v-slot:no-data="{ icon, message, filter }">
                    <div class="full-width row flex-center text-primary q-gutter-sm">
                        <span>
                            {{ message }}
                        </span>
                        <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                    </div>
                </template>
            </q-table>
        </div>

        <q-dialog class="q-pa-none left-0" v-model="state.dialogTable" position="standard"
            :transition-duration="$isDesktop ? 100 : 0" full-height full-width>
            <q-card class="p-4">
                <q-table flat :rows="state.dialogTableItems" :columns="columnsDialog" row-key="name" dense
                    no-data-label="No hay eventos para esta fecha" :rows-per-page-options="[0]" wrap-cells
                    :pagination="state.initialPagination">
                    <template v-slot:top-left>
                        <span class="text-center w-full uppercase">TABLA DE PÓLIZAS</span>
                    </template>
                    <template v-slot:body-cell-code="props">
                        <q-td :props="props">
                            <div class="flex flex-col">
                                {{ props.row.code }}
                                {{ props.row.ncf_sequence }}
                                {{ props.row.c_status }}
                            </div>
                        </q-td>
                    </template>
                    <template v-slot:body-cell-action="props">
                        <q-td :props="props">
                            <q-btn flat class="button bg-green-300" size="xs" label="editar" no-caps
                                @click="state.selectedId = props.row.id; state.dialogWrite = true" />
                        </q-td>
                    </template>
                    <template v-slot:no-data="{ icon, message, filter }">
                        <div class="full-width row flex-center text-primary q-gutter-sm">
                            <span>
                                {{ message }}
                            </span>
                            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                        </div>
                    </template>
                </q-table>
            </q-card>
        </q-dialog>

        <q-dialog class="q-pa-none left-0" no-refocus v-model="state.dialogWrite"
            :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="$isDesktop ? 100 : 0">
            <q-card>
                <PolicyWrite @submit="state.dialogWrite = false" @close="state.dialogWrite = false" isEdit
                    :id="state.selectedId" :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import { downloadResource } from 'src/helpers';
import PolicyWrite from 'src/pages/policy/components/PolicyWrite.vue';
import { useExcel } from 'src/use/excel';
import { computed, inject, reactive } from 'vue';

const $api = inject("$api")

const props = defineProps({
    list: Array,
    columns: Array,
    title: {
        type: String,
        default: 'TABLA DE PACIENTES'
    },
    date: Date,
    type: String,
    stats: Object,
    columnKey: {
        type: String,
        default: 'item_description'
    }
})

const listComputed = computed(() => {
    return props.list.filter(i => {
        if (state.search) {
            return i.label.toLowerCase().includes(state.search.toLowerCase())
        }
        return true
    })
})

const state = reactive({
    dialogWrite: false,
    selectedId: null,
    search: null,
    dialogName: null,
    initialPagination: {
        sortBy: 'quantity',
        descending: true,
        page: 1,
        rowsPerPage: 10
    },
    columns: props.columns || [
        {
            name: 'action',
            required: true,
            label: 'Acciones',
            align: 'left',
            field: 'action',
            classes: 'w-[100px]'
        },
        {
            name: 'label',
            required: true,
            label: 'Descripción',
            align: 'left',
            field: 'label',
        },
        {
            name: 'value',
            required: true,
            label: 'Cantidad',
            align: 'left',
            field: 'value',
            classes: 'w-[120px]'
        },
    ]
})

const columnsDialog = computed(() => {

    return [
        {
            name: 'action',
            required: true,
            label: 'Acciones',
            align: 'left',
            field: 'action',
            classes: 'w-[100px]'
        },
        {
            name: 'customer_description',
            required: true,
            label: 'Cliente',
            align: 'left',
            field: 'customer_description',
        },
        {
            name: 'titular_description',
            required: true,
            label: 'titular',
            align: 'left',
            field: 'titular_description',
        },
        {
            name: 'policy_number',
            required: true,
            label: '# Póliza',
            align: 'left',
            field: 'policy_number',
            classes: 'w-[200px]'
        },
        {
            name: 'insurance',
            required: true,
            label: 'Aseguradora',
            align: 'left',
            field: 'insurance',
        },
        {
            name: 'policy_branch',
            required: true,
            label: 'Rama',
            align: 'left',
            field: 'policy_branch',
            classes: 'w-[120px]'
        },
    ]

})

async function getReport({ title }) {
    let url;

    const from = props.date.from
    const to = props.date.to

    url = await $api.post(`event/report`, {
        items: props.list,
        from,
        to,
        title
    })

    if (url) {
        downloadResource(url, `REPORTE-${title}-${from}-${to}`)
    }
}

const { exportTable } = useExcel()
async function getReportExcel() {
    const columns = [
        {
            label: 'label',
        },
        {
            label: 'value',
        },
    ]

    exportTable({
        rows: props.list,
        columns,
        filename: 'Reporte Excel'
    })
}

async function openDialogTable(key, value, key2) {
    try {
        console.log(value);
        if (key2) {
            state.dialogName = key2
        } else {
            state.dialogName = key
        }

        let where = {
            start: props.date,
            c_status: 4,
        };

        if (value === 'null') {
            where[`null:${key}`] = 1
        } else {
            where[`${key}`] = value
        }

        const { items } = await $api.get('policy', {
            params: {
                groupBy: ['t_policy.policy_number'],
                where: where
            }
        });

        state.dialogTableItems = items;
        state.dialogTable = true;
    } catch (error) {
        console.log(error);
    }
}



</script>