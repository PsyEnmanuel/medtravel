<template>
    <q-card style="width: 450px">
        <div class="flex justify-between items-start gap-2 py-2 px-4">
            <div>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <q-card-section class="">
            <div class="text-lg font-bold text-primary mb-1">+ {{ state.cat.description }}</div>
            <q-form ref="writeForm" @submit="onSubmit()" @reset="onReset">
                <q-input class="mb-2" dense outlined v-model="state.item.description" :label="$t('name')"
                    :rules="[requiredInput]" hide-bottom-space></q-input>
                <q-btn flat class="button-press w-full bg-primary text-white" label="agregar al listado"
                    type="submit"></q-btn>
            </q-form>
        </q-card-section>
        <div v-if="!state.loading" class="px-4">
            <div class="bg-default p-0.5 text-xs text-center font-bold uppercase">Listado</div>
            <div class="flex justify-between md:flex-nowrap border-b border-default mb-2">
                <div class="flex flex-nowrap w-full">
                    <q-input class="search-input" square outlined dense debounce="300" v-model="state.search"
                        :placeholder="$t('search')" type="search">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </div>
                <PaginationTable :rowsNumber="state.pagination.rowsNumber" :itemsRange="itemsRange"
                    :tableRef="tableRef" />
            </div>
            <div style="overflow-x: auto; white-space: nowrap;">
                <q-table hide-pagination :rows="state.rows" :columns="state.columns" row-key="id" ref="tableRef"
                    @request="onRequest" flat v-model:pagination="state.pagination" v-model:selected="state.selected"
                    :selected-rows-label="getSelectedString" :loading="state.loading" rows-per-page-label="Lineas"
                    :wrap-cells="true">
                    <template v-slot:header-selection="scope">
                        <q-checkbox v-model="scope.selected" color="primary" size="xs" />
                    </template>
                    <template v-slot:body="props">
                        <q-tr :props="props" @click="state.selectedId = props.row.id; state.dialogList = true">
                            <!-- <q-td>
                                <q-checkbox v-model="props.selected" color="primary" size="xs" />
                            </q-td> -->
                            <template v-for="col in props.cols" :key="col.name">
                                <template v-if="col.name === 'action'">
                                </template>
                                <template v-else-if="col.name === 'description'">
                                    <q-td :key="col.name" :props="props">
                                        <q-input v-model.number="props.row[col.name]" type="text" dense
                                            @update:model-value="updateRowInput(props.row, col.name)" :debounce="300" />
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
                    <template v-slot:bottom v-if="!$isDesktop">
                        <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
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
    </q-card>
</template>

<script setup>
import { useQuasar } from 'quasar';
import PaginationTable from 'src/components/table/PaginationTable.vue';
import categories from 'src/data/categories';
import { requiredInput } from 'src/helpers/validation';
import { useUpdateStore } from 'src/stores/update';
import { useTable } from 'src/use/table';
import { inject, onMounted, provide, reactive, ref, watch } from 'vue';
const props = defineProps({ category: String, isDrawer: Boolean })
const emit = defineEmits(['close'])
const writeForm = ref();
const $q = useQuasar()
const $cats = inject('$cats')
const $local = inject('$local')

import { useI18n } from "vue-i18n";
const { t } = useI18n()
const $api = inject('$api')
const form = ref();
const tableRef = ref()

const initialItem = () => ({
    parent_id: null
})

const state = reactive({
    item: initialItem(),
    loading: false,
    cat: {},
    search: '',
    search_key: 'orlike:description',
    pagination: {
        sortBy: 'id',
        descending: true,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'category',
    query: {
        groupBy: ['t_category.id'],
        where: {
            'c_status': 4,
            parent_id: null
        }
    },
    columns: [
        {
            name: 'description',
            required: true,
            label: t('description'),
            align: 'left',
            field: "description",
            sortable: true,
            classes: "max-w-[150px] min-w-[150px] overflow-hidden white-space-wrap"
        },
    ],
    rows: [
    ],
})

function onReset() {
    state.item = initialItem()
    setTimeout(() => {
        writeForm.value.resetValidation()
    }, 0);
}

async function onSubmit() {
    const response = await $api.post('category', {
        ...state.item,
    });

    const cats = await $api.get("category/children", {
        params: {
            data: categories,
        },
    });
    $cats.value = cats

    if (response) {
        $q.notify({
            type: 'success',
            message: 'Categoría Agregada'
        })
        onReset()
        emit('close')
    }
}

async function onInit() {
    state.cat = await $api.get(`/category/ref/${props.category}`)
    state.item.parent_id = state.cat.id
    state.query.where.parent_id = state.cat.id
    state.loading = false;
}

onMounted(() => {
    onInit()
})

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange, updateRowInput } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_category, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>