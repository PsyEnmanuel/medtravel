<template>

    <div class="grid grid-cols-3 gap-2">

        <div>

            <div class="flex flex-col">

                <q-input class="w-full" dense outlined debounce="300" v-model="state.search"
                    :placeholder="$t('search')">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>

                <div class="flex flex-nowrap gap-2">
                    <q-btn v-if="state.selected.length" flat class="button-icon bg-red-300 mt-1" size="xs"
                        icon="fa-duotone fa-solid fa-trash" @click="onDeleteRows" />
                    <div v-if="$isDesktop" class="flex ml-auto">
                        <q-btn class="bg-transparent text-xs" flat no-caps>{{ itemsRange.start }} - {{ itemsRange.end
                            }} de {{ state.pagination.rowsNumber }}</q-btn>
                        <q-btn class="bg-transparent px-1" icon="sym_o_first_page" flat
                            @click="tableRef.firstPage()"></q-btn>
                        <q-btn class="bg-transparent px-1" icon="sym_o_navigate_before" flat
                            @click="tableRef.prevPage()"></q-btn>
                        <q-btn class="bg-transparent px-1" icon="sym_o_navigate_next" flat
                            @click="tableRef.nextPage()"></q-btn>
                        <q-btn class="bg-transparent px-1" icon="sym_o_last_page" flat
                            @click="tableRef.lastPage()"></q-btn>
                    </div>
                </div>
            </div>

            <q-table table-class="table-style-1" style="max-height: 600px; overflow-y: auto;" grid hide-pagination :rows="state.rows" :columns="state.columns"
                row-key="id" ref="tableRef" @request="onRequest" flat selection="multiple"
                v-model:pagination="state.pagination" v-model:selected="state.selected"
                :selected-rows-label="getSelectedString" :loading="state.loading" rows-per-page-label="Lineas"
                :rows-per-page-options="[10, 20, 50, 100]" :wrap-cells="true">

                <template v-slot:no-data="{ icon, message, filter }">
                    <NoData :icon="icon" :message="message" :filter="filter" />
                </template>

                <template v-slot:item="props">
                    <div class="q-py-xs col-xs-12" :style="props.selected ? 'transform: scale(0.95);' : ''">
                        <div bordered flat class="card pb-2 relative flex flex-col justify-between hover:bg-green-200"
                            @click="addItem(props.row)">
                            <div class="flex flex-nowrap">
                                <div class="absolute right-3 top-2">
                                    <q-checkbox dense v-model="props.selected" :label="props.row.name" />
                                </div>
                                <div class="pl-3 pr-8 w-full pt-2 flex flex-col overflow-hidden line-clamp-1">
                                    <span class="text-uppercase font-bold">{{ props.row.description }}</span>
                                    <p class="mb-4 whitespace-pre-wrap">{{ props.row.detail }}</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </template>
                <template v-if="!$isDesktop" v-slot:bottom>
                    <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
                </template>
            </q-table>
        </div>

        <div>
            <div class="subtitle mb-1 text-center">Agregar Recomendación</div>
            <div class="subtitle mb-1">
                <q-input class="mb-1" dense outlined v-model="state.item.description" label="Descripción"></q-input>
                <q-input class="mb-1" dense outlined v-model="state.item.detail" label="Detalle" type="textarea"
                    rows="4"></q-input>
                <q-btn flat class="button-press bg-primary-light bg-btn-sky w-full mb-1" no-caps
                    @click="onSubmit">Agregar</q-btn>
            </div>
        </div>

        <div>
            <div class="subtitle mb-1 text-center">Recomendación seleccionados</div>
            <div class="flex flex-nowrap gap-1 mb-2" v-for="(item, index) in item.recomendation" :key="item.id">
                <div class="w-full max-w-[40px] min-w-[40px] flex justify-center items-center bg-green-200 card py-1">
                    <div class="flex flex-col justify-between items-center h-full">
                        <span>{{ index + 1 }}</span>
                        <q-btn class="button-icon bg-red-200" rounded dense flat icon="sym_o_remove"
                            @click="removeRow(item)">
                            <q-tooltip class="bg-green-200 text-black text-xs" :delay="300" self="center middle">
                                - {{ $t('remove') }}
                            </q-tooltip>
                        </q-btn>
                    </div>
                </div>
                <div class="w-full flex flex-col bg-green-200 card px-3 py-1">
                    <!-- <div class="text-xs uppercase pr-4">{{ item.description }}</div> -->
                    <q-input class="text-xs" dense outlined v-model="item.description" placeholder="Recomendación">
                    </q-input>
                    <q-input class="text-xs" dense outlined v-model="item.detail" placeholder="Detalle" type="textarea"
                        rows="3">
                    </q-input>
                </div>
            </div>

        </div>

    </div>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
import NoData from "src/components/table/NoData.vue";
import { useQuasar } from "quasar";
const props = defineProps({ item: Object })

const $isDesktop = inject("$isDesktop")
const $api = inject("$api")
const tableRef = ref()
const $q = useQuasar()

const initialItem = () => ({
})

const state = reactive({
    item: initialItem(),
    isBackButtonPressed: false,
    selected: [],
    selectedId: null,
    search: '',
    search_key: 'orlike:description',
    pagination: {
        sortBy: 'created',
        descending: true,
        page: 1,
        rowsPerPage: $isDesktop ? 10 : 2,
    },
    url: 'recomendation',
    query: {
        order: {
            modified: 'DESC'
        },
        groupBy: ['t_recomendation.id'],
        where: {
            c_status: 4,
        },
    },
    columns: [
        {
            name: 'avatar',
            required: true,
            label: '',
            align: 'left',
            field: row => row.sex,
            classes: 'w-[42px]'
        },
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: row => row.id,
            format: val => `${val}`,
            classes: 'w-[100px]'
        },
        {
            name: 'description',
            required: true,
            label: 'Nombre',
            align: 'left',
            field: row => row.description,
        },
        { name: 'cel', align: 'center', label: 'Celular', field: 'cel' },
        { name: 'email', label: 'Email', field: 'email' },
    ],
    rows: [
    ]
})

async function addItem(row) {
    try {
        const index = props.item.recomendation.findIndex(i => +row.id === +i.id)
        if (index !== -1) {
            $q.notify({
                type: "success",
                message: "Este Recomendación ya esta agregado",
            });
            return;
        }
        props.item.recomendation.push({
            id: String(row.id),
            description: row.description,
            detail: row.detail,
        });
    } catch (error) {
        console.log(error);
    }
}

function removeRow(item) {
    const index = props.item.recomendation.findIndex((i) => i.id === item.id);
    if (index !== -1) {
        props.item.recomendation.splice(index, 1);
    }
}

async function onSubmit() {
    try {
        const response = await $api.post(`recomendation`, state.item);

        props.item.recomendation.push({
            id: String(response.id),
            description: state.item.description,
            detail: state.item.detail,
        });

        $q.notify({
            type: "success",
            message: "Recomendación agregado",
        });

        state.item = initialItem()

    } catch (error) {
        console.log(error);
    }
}

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_recomendation, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>