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
                <q-btn v-if="state.selected.length" flat class="button h-full bg-primary text-white"
                    icon-right="sym_o_remove" :label="$isDesktop ? 'Remover' : ''" no-caps @click="onDeleteRows" />
                <q-btn v-if="$me.unixroles & 1 && state.selected.length > 1" flat class="button h-full bg-orange-300"
                    icon-right="sym_o_cell_merge" :label="$isDesktop ? 'Unir' : ''" no-caps @click="onMergeRows" />
            </div>
            <div class="flex justify-end">
                <div v-if="$isDesktop" class="grid grid-flow-col auto-cols-max gap-2">
                    <q-btn class="bg-transparent" flat no-caps>{{ itemsRange.start }} - {{ itemsRange.end
                        }} de {{ state.pagination.rowsNumber }}</q-btn>
                    <q-btn class="bg-transparent" icon="sym_o_first_page" flat @click="tableRef.firstPage()"></q-btn>
                    <q-btn class="bg-transparent" icon="sym_o_navigate_before" flat
                        @click="tableRef.prevPage()"></q-btn>
                    <q-btn class="bg-transparent" icon="sym_o_navigate_next" flat @click="tableRef.nextPage()"></q-btn>
                    <q-btn class="bg-transparent" icon="sym_o_last_page" flat @click="tableRef.lastPage()"></q-btn>
                </div>
            </div>
        </div>

        <q-table table-class="table-style-1" grid hide-pagination :rows="state.rows" :columns="state.columns"
            row-key="id" ref="tableRef" @request="onRequest" flat selection="multiple"
            v-model:pagination="state.pagination" v-model:selected="state.selected"
            :selected-rows-label="getSelectedString" :loading="state.loading" rows-per-page-label="Lineas"
            :rows-per-page-options="[10, 20, 50, 100]" :wrap-cells="true">
            <template v-slot:no-data="{ icon, message, filter }">
                <div class="full-width row flex-center text-primary q-gutter-sm">
                    <span>
                        {{ message }}
                    </span>
                    <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                </div>
            </template>
            <template v-slot:item="props">
                <div class="q-pa-xs col-lg-4 col-md-6 col-xs-12"
                    :style="props.selected ? 'transform: scale(0.95);' : ''">
                    <InsuredCard :item="props" @selectedId="state.selectedId = $event; state.dialogWrite = true;" />
                </div>
            </template>
            <template v-if="!$isDesktop" v-slot:bottom>
                <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
            </template>
        </q-table>

        <q-dialog class="q-pa-none left-0" no-refocus v-model="state.dialogWrite"
            :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="$isDesktop ? 100 : 0">
            <q-card>
                <InsuredWrite @close="state.dialogWrite = false;" isEdit isDrawer :id="state.selectedId"
                    :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { reactive, ref, watch, inject } from "vue"
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
import { setTimePeriodQuery } from "src/helpers";
import InsuredWrite from "src/pages/insured/components/InsuredWrite.vue";
import InsuredCard from "src/pages/insured/components/insuredCard.vue";
import { useQuasar } from "quasar";
const props = defineProps({ insuredId: Number, insuredId: Number, insurance_id: Number })
const tableRef = ref()
const $me = inject("$me")
const $api = inject("$api")
const $q = useQuasar()

const state = reactive({
    timePeriod: 'today',
    dialogWrite: false,
    dialogList: false,
    dialogCreate: false,
    selectedId: 0,
    dialogWidth: 400,
    selected: [],
    search: '',
    search_key: 'orlike:code,ident_no,fullname',
    pagination: {
        sortBy: 'code',
        descending: false,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'insured',
    query: {
        groupBy: ['t_insured.code'],
        where: {
            c_status: 4,
            insured_id: props.insuredId ?? null,
            ['js:policies|insurance_id']: [props.insurance_id]
        }
    },
    columns: [
    ],
    rows: [
    ]
})

const onMergeRows = async function () {
    try {
        if (!($me.unixroles & 1)) {
            $q.notify({
                type: 'danger',
                message: 'No tienes acceso para unir expedientes'
            })
            return;
        }
        const first = state.selected[0].fullname
        const names = [...state.selected].splice(1, state.selected.length).map(item => item.fullname)
        const result = await $q.dialog({
            title: 'Confirmar Eliminación de Duplicados',
            message: `Desea unir: ${first} -> ${names.join(', ')}`,
            cancel: true,
            persistent: true
        })
        result.onOk(async () => {
            await $api.post(`${state.url}/merge`, {
                data: state.selected.map(item => item.id)
            })
            $q.notify({
                type: 'success',
                message: 'Duplicados removidos'
            })
        })
    } catch (error) {
        console.log(error);
    }
}

watch(() => state.timePeriod, (val) => {
    setTimePeriodQuery(val, state.query, 'insured_date')
})

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_insured, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>