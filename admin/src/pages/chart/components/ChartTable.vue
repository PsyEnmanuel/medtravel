<template>
    <div>
        <div class="bg-white card p-4 mt-2 max-h-[400px] overflow-auto">
            <div class="flex mb-2">
                <span class="uppercase flex items-center subtitle mr-2">{{ props.title }}</span>
                <q-input class="mr-2" dense outlined debounce="300" v-model="state.searchTreatment"
                    :placeholder="$t('search')">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <q-table flat :rows="treatmentListComputed" :columns="state.columns" row-key="name" dense
                no-data-label="No hay tratamiento para esta fecha" :rows-per-page-options="[0]" wrap-cells>
                <template v-slot:body-cell-action="props">
                    <q-td :props="props">
                        <q-btn flat class="button bg-green-400" size="sm" label="asegurados" no-caps
                            @click="openTable(props.row)" />
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
            :transition-duration="$isDesktop ? 100 : 0" style="width: 1200px">
            <q-card style="width: 700px; max-width: 80vw;" class="p-4">
                <q-table flat :rows="state.table" :columns="state.columnsDialog" row-key="name" dense
                    no-data-label="No hay eventos para esta fecha" :rows-per-page-options="[0]" wrap-cells>
                    <template v-slot:top-left>
                        <span class="text-center w-full uppercase">TABLA DE ASEGURADOS POR
                            <span class="subtitle">{{ state.tableTitle }}</span></span>
                    </template>
                    <template v-slot:body-cell-action="props">
                        <q-td :props="props">
                            <q-btn flat class="button bg-sky-300" size="sm" label="consultar" no-caps
                                @click="$router.push(`${$path.patient}/${$path.patient_consult}/${props.row.patient_id}`)" />
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

    </div>
</template>

<script setup>
import { computed, inject, reactive } from 'vue';

const $api = inject("$api")

const props = defineProps({
    list: Array,
    title: {
        type: String,
        default: 'TABLA DE TRATAMIENTO'
    },
    date: Date,
    type: String
})

const treatmentListComputed = computed(() => {
    return props.list.filter(i => {
        if (state.searchTreatment) {
            return i.description.toLowerCase().includes(state.searchTreatment.toLowerCase())
        }
        return true
    })
})

const state = reactive({
    searchTreatment: null,
    columns: [
        {
            name: 'action',
            required: true,
            label: 'Acciones',
            align: 'left',
            field: 'action',
            classes: 'w-[150px]'
        },
        {
            name: 'description',
            required: true,
            label: 'Nombre',
            align: 'left',
            field: 'description',
            classes: 'uppercase',
            sortable: true
        },
        {
            name: 'quantity',
            required: true,
            label: 'Cantidad',
            align: 'left',
            field: 'quantity',
            classes: 'w-[150px]',
            sortable: true
        },
    ],
    columnsDialog: [
        {
            name: 'action',
            required: true,
            label: 'Acciones',
            align: 'left',
            field: 'action',
            classes: 'w-[150px]'
        },
        {
            name: 'patient_description',
            required: true,
            label: 'Nombre',
            align: 'left',
            field: 'patient_description',
            classes: 'uppercase',
            sortable: true
        },
        {
            name: 'prescription_date',
            required: true,
            label: 'Fecha',
            align: 'left',
            field: 'prescription_date_format',
            classes: 'w-[150px]',
            sortable: true
        },
    ],
})

async function openTable(row) {
    try {
        state.tableTitle = row.description
        const { items } = await $api.get('prescription', {
            params: {
                groupBy: ['t_prescription.patient_id'],
                where: {
                    prescription_date: props.date,
                    [`js:${props.type}`]: [row.id]
                }
            }
        });
        state.table = items;
        state.dialogTable = true;
    } catch (error) {
        console.log(error);
    }
}

</script>