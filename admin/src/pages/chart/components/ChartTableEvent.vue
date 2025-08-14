<template>
    <div>
        <div class="bg-white card md:p-4 p-2 w-full">
            <div class="flex items-center justify-between flex-nowrap">
                <div class="grid grid-cols-2 gap-1 mb-1">
                    <q-input class="mr-2" dense outlined debounce="300" v-model="state.search"
                        :placeholder="$t('search')">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </div>
            </div>
            <div class="bg-white rounded-borders shadow-2 h-[400px] overflow-hidden">
                <q-table flat :rows="listComputed" :columns="state.columns" row-key="name" dense
                    no-data-label="No hay tratamiento para esta fecha" :rows-per-page-options="[0]" wrap-cells
                    class="h-full" virtual-scroll>
                    <template v-slot:body-cell-action="props" v-if="props.showActions">
                        <q-td :props="props" class="text-center">
                            <q-btn flat class="button-icon" size="xs" no-caps icon="fa-duotone fa-solid fa-list"
                                @click="openDialogTable(columnKey, props.row.label, columnKey)" />
                        </q-td>
                    </template>
                    <template v-slot:body-cell-label="props">
                        <q-td :props="props">
                            <span class="text-xxs">{{ props.row.label }}</span>
                        </q-td>
                    </template>
                    <template v-slot:body-cell-value="props">
                        <q-td :props="props">
                            <span class="text-xxs">{{ props.row.value }}</span>
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
        </div>

        <q-dialog class="q-pa-none left-0" v-model="state.dialogTable" position="standard"
            :transition-duration="$isDesktop ? 100 : 0" style="width: 1200px">
            <q-card style="width: 1000px; max-width: 80vw;" class="p-4">

                <q-table flat :rows="state.dialogTableItems" :columns="columnsDialog" row-key="name" dense
                    no-data-label="No hay eventos para esta fecha" :rows-per-page-options="[0]" wrap-cells
                    :pagination="state.initialPagination">
                    <template v-slot:top-left>
                        <div class="flex flex-col items-start gap-1 leading-3">
                            <span class="w-full uppercase border-l-4 border-l-primary pl-1">TABLA DE {{ title }}</span>
                            <span class="w-full uppercase text-xs">{{ state.tableDesc }}</span>
                        </div>
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
                            <q-btn flat class="button" size="xs" label="editar" no-caps
                                @click="state.selectedId = props.row.id; state.dialogWrite = true" />
                        </q-td>
                    </template>
                    <template v-slot:body-cell-event_state="props">
                        <q-td :props="props">
                            <div class="flex flex-nowrap items-center justify-between w-full text-primary font-bold">
                                <span>{{ props.row.event_state }}</span>
                                <q-badge :style="{ background: props.row.color }"
                                    class="flex justify-center text-center font-bold text-xxs mb-1">
                                    {{ props.row.event_category }}
                                </q-badge>
                            </div>
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
                <EventWrite @submit="state.dialogWrite = false" @close="state.dialogWrite = false" isEdit
                    :id="state.selectedId" width="100%" isDrawer />
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import EventWrite from 'src/pages/event/components/EventWrite.vue';
import { computed, inject, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
const $api = inject("$api")
const { t } = useI18n()

const props = defineProps({
    list: Array,
    event_state_id: Number,
    quantity: Number,
    columns: Array,
    showActions: {
        type: Boolean,
        default: true
    },
    title: {
        type: String,
        default: 'TABLA DE COORDINACIONES'
    },
    name: {
        type: String,
        default: 'Proveedores'
    },
    hideBtn: {
        type: Boolean,
        default: false
    },
    date: Date,
    type: String,
    stats: Object,
    columnKey: {
        type: String,
        default: 'item_description'
    }
})

const state = reactive({
    dialogWrite: false,
    selectedId: null,
    tableDesc: null,
    search: null,
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
            label: '',
            align: 'left',
            field: 'action',
        },
        {
            name: 'label',
            required: true,
            label: props.name ?? 'Descripción',
            align: 'left',
            field: 'label',
            sortable: true
        },
        {
            name: 'value',
            required: true,
            label: 'Cantidad',
            align: 'left',
            field: 'value',
            sortable: true
        },
    ]
})

const columnsDialog = computed(() => {
    let arr = []
    if (props.columnKey !== 'provider_description') {
        arr = [{
            name: 'provider_description',
            required: true,
            label: 'Proveedor',
            align: 'left',
            field: 'provider_description',
        }]
    }
    return [
        {
            name: 'request_date_format',
            required: true,
            label: t('request_date'),
            align: 'left',
            field: 'request_date_format',
            classes: 'w-[120px]'
        },
        ...arr,
        {
            name: 'insured',
            required: true,
            label: 'Asegurado',
            align: 'left',
            field: 'insured',
        },
        {
            name: 'insurance_description',
            required: true,
            label: 'Aseguradora',
            align: 'left',
            field: 'insurance_description',
        },
        {
            name: 'user_description',
            required: true,
            label: 'Coordinador',
            align: 'left',
            field: 'user_description',
        },
        {
            name: 'event_state',
            required: true,
            label: 'Estado',
            align: 'left',
            field: 'event_state',
        },
        {
            name: 'event_type',
            required: true,
            label: 'Tipo',
            align: 'left',
            field: 'event_type',
        },
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: 'action',
        },
    ]

})

const listComputed = computed(() => {
    return props.list.filter(i => {
        if (state.search) {
            return i.label.toLowerCase().includes(state.search.toLowerCase())
        }
        return true
    })
})

watch(() => state.$event_state_id, (val) => {
    console.log(val);
})

async function openDialogTable(key, value, key2) {
    try {

        let where = {
            c_status: 4,
        };

        if (props.event_state_id === 2) {
            where['$event_state_id'] = null
        } else if (props.event_state_id === 1) {
            where['$event_state_id'] = 40
        } else {
            where['ne:$event_state_id'] = 40
        }
        if (key === 'diagnosis') {
            const match = value.match(/\[(.*?)\]/);
            const code = match ? match[1] : null;
            where[`js:diagnosis|code`] = code
        } else {
            where[`${key}`] = value
        }
        state.tableDesc = value

        const { items } = await $api.get('event', {
            params: {
                groupBy: ['t_event.id'],
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