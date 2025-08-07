<template>
    <div class="p-4 pb-20" :style="style">

        <div class="flex justify-between mb-2">
            <h3 class="text-lg font-bold text-sky-600">PLANTILLAS</h3>
            <q-btn flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>

        <q-input dense outlined v-model="state.search" :label="$t('search')" hide-bottom-space>
            <template #append><q-icon name="search" /></template>
        </q-input>

        <q-table grid hide-pagination hide-header :rows="state.rows" row-key="id" ref="tableRef" @request="onRequest"
            flat selection="multiple" v-model:pagination="state.pagination" :loading="state.loading"
            v-model:selected="state.selected" :selected-rows-label="getSelectedString" rows-per-page-label="Lineas"
            :rows-per-page-options="[10, 20, 50, 100]" :wrap-cells="true" no-data-label="No se encontraron pacientes">

            <template v-slot:no-data="{ icon, message, filter }">
                <NoData :icon="icon" :message="message" :filter="filter" />
            </template>

            <template v-slot:item="props">
                <div class="col-xs-12 my-1">
                    <div @click="selectPrescription(props.row)" class="col-xs-12 col-sm-6 col-md-4 cursor-pointer">
                        <div class="card-shadow border pb-4 relative flex flex-nowrap mb-2">
                            <div class="pl-3 pr-8 w-full pt-2 flex flex-col overflow-hidden">
                                <span class="text-uppercase line-clamp-1 font-semibold">{{ props.row.template
                                    }}</span>
                            </div>

                        </div>
                    </div>
                </div>
            </template>
        </q-table>
    </div>
</template>

<script setup>
import { computed, ref, reactive, inject } from 'vue';
const props = defineProps({ width: String })
const emits = defineEmits(['selectPrescription'])
import { useTable } from "src/use/table"
import NoData from 'src/components/table/NoData.vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
const $q = useQuasar()
const $api = inject("$api")
const router = useRouter()
const tableRef = ref()

const state = reactive({
    items: [],
    total: 0,
    loading: true,
    dialogWrite: false,
    dialogRead: false,
    selectedId: 0,
    selected: [],
    search: null,
    search_key: 'orlike:description',
    pagination: {
        sortBy: 'created',
        descending: true,
        page: 1,
        rowsPerPage: 5,
    },
    url: 'prescription',
    query: {
        order: {
            created: 'DESC'
        },
        groupBy: ['t_prescription.id'],
        where: {
            c_status: 4,
            'notnull:template': 1
        }
    },
    rows: []
})

const { onRequest, getSelectedString } = useTable(state, tableRef)

const style = computed(() => {
    return {
        width: props.width
    }
})

async function selectPrescription(row) {
    emits('selectPrescription', row)
}

</script>