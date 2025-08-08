<template>
    <q-page :class="patientId ? 'px-2 py-3' : 'px-1.5 py-2 lg:px-5 lg:py-6'">

        <div class="flex justify-between md:flex-nowrap mb-1">
            <div class="flex md:flex-nowrap w-full gap-2">
                <q-input dense outlined v-model="state.query.where.book_date.from" mask="##-##-####">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="proxy">
                                <q-date flat v-model="state.query.where.book_date.from" no-unset years-in-month-view
                                    minimal @update:model-value="$refs.proxy.hide()" mask="DD-MM-YYYY">
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input dense outlined v-model="state.query.where.book_date.to" mask="##-##-####">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="proxy">
                                <q-date flat v-model="state.query.where.book_date.to" no-unset years-in-month-view
                                    minimal @update:model-value="$refs.proxy.hide()" mask="DD-MM-YYYY">
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <div class="grid grid-cols-2 gap-2">
                    <q-btn flat class="button-icon text-[10px] h-[40px]" icon="chevron_left" @click="prevDate">
                        <q-tooltip class="bg-default text-black text-xs">Día anterior</q-tooltip>
                    </q-btn>
                    <q-btn flat class="button-icon text-[10px] h-[40px]" icon="chevron_right" @click="nextDate">
                        <q-tooltip class="bg-default text-black text-xs">Día siguiente</q-tooltip>
                    </q-btn>
                </div>

            </div>
            <div v-if="$isDesktop" class="ml-auto">
                <PaginationTable :rowsNumber="state.pagination.rowsNumber" :itemsRange="itemsRange"
                    :tableRef="tableRef" />
            </div>
        </div>

        <div class="mb-1">
            <q-option-group class="flex" size="sm" v-model="state.timePeriod" toggle-color="secondary"
                toggle-text-color="text-font" :options="options.timePeriods" type="radio" />
        </div>

        <div style="overflow-x: auto; white-space: nowrap;">
            <q-table :grid="!$isDesktop" hide-pagination v-model:pagination="state.pagination" :rows="state.rows"
                :columns="state.columns" row-key="id" ref="tableRef" @request="onRequest" flat :loading="state.loading"
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
                    <q-tr :props="props" :class="props.row.c_status & 1 ? 'line-through' : ''">
                        <q-td v-for="col in props.cols" :key="col.name" :props="props">
                            <template v-if="col.name === 'action'">
                                <q-btn v-if="props.row.c_status & 4" flat class="button bg-green-400" size="sm"
                                    label="editar" no-caps
                                    @click="$router.push(`${$path.conciliation}/${$path.conciliation_write}/${props.row.code}`)" />
                            </template>
                            <template v-else-if="col.name === 'code'">
                                <div class="flex flex-col flex-nowrap text-xs">
                                    <span>{{ props.row.code }}</span>
                                    <span>{{ props.row.ncf_sequence }}</span>
                                    <span class="text-purple-400 text-xxs">{{ props.row.promotion_description
                                    }}</span>
                                </div>
                            </template>
                            <template v-else-if="col.name === 'invoice_sequence'">
                                <div class="flex flex-col flex-nowrap text-xs">
                                    <span>{{ props.row.invoice_sequence }}</span>
                                    <span v-if="props.row.blocked"><q-badge class="text-xxs font-bold"
                                            color="black">CERRADA</q-badge></span>
                                </div>
                            </template>
                            <template v-else-if="col.name === 'customer_description'">
                                <div class="flex flex-col flex-nowrap text-xs">
                                    <span class="line-clamp-1 whitespace-pre-wrap">{{ props.row.customer_description
                                    }}</span>
                                    <span v-if="props.row.customer_policy">Póliza: <span>{{
                                        props.row.customer_policy
                                            }}</span></span>
                                    <span v-if="props.row.customer_nss">NSS: {{ props.row.customer_nss }}</span>
                                </div>
                            </template>
                            <template v-else-if="col.name === 'items'">
                                <div class="flex flex-col flex-nowrap text-xs">
                                    <div v-for="(item, index) in props.row.items" :key="item.id"
                                        class="flex flex-nowrap items-start">
                                        <div class="min-w-[12px]">{{ index + 1 }}:</div>
                                        <div class="w-full line-clamp-1">{{ item }}</div>
                                    </div>
                                </div>
                            </template>
                            <template v-else-if="col.name === 'total'">
                                <div class="flex flex-col text-xs">
                                    <span>T: {{ props.row.total_format }}</span>
                                    <span v-if="props.row.exoneration_total">
                                        <span>E: {{ props.row.exoneration_total_format }}</span>
                                    </span>
                                    <span v-if="props.row.coverage_total_format">
                                        <span>C: {{ props.row.coverage_total_format }}</span>
                                    </span>
                                    <span v-if="props.row.gap_total_format">D: {{ props.row.gap_total_format
                                    }}</span>
                                </div>
                            </template>
                            <template v-else-if="col.name === 'book_state'">
                                <div class="flex flex-col text-xs">
                                    <span>{{ props.row.book_state }}</span>
                                    <span v-if="props.row.balance">{{ props.row.balance_format }}</span>
                                </div>
                            </template>
                            <template v-else-if="col.name === 'created_by'">
                                <div class="flex flex-col text-xs">
                                    <span>{{ props.row.created_by }}</span>
                                    <span>{{ props.row.created_format }}</span>
                                </div>
                            </template>
                            <template v-else>
                                {{ col.value }}
                            </template>
                        </q-td>
                    </q-tr>
                </template>
                <template v-slot:item="props">
                    <div @click="$router.push(`/facturas/editar/${props.row.code}`)"
                        class="q-pa-xs col-xs-12 col-sm-6 col-md-4"
                        :style="props.selected ? 'transform: scale(0.95);' : ''">
                        <div bordered flat class="card pb-4 relative flex flex-nowrap">
                            <div class="pl-3 pr-10 w-full pt-2 flex flex-col items-start overflow-hidden">
                                <span class="text-uppercase line-clamp-1 font-semibold">{{ props.row.description
                                }}</span>
                                <div class="flex text-xs">
                                    <span class="text-xs">#{{ props.row.sequence }}</span>
                                    <span>&nbsp;-&nbsp;</span>
                                    <span class="text-xs">{{ props.row.book_date_format }}</span>
                                    <q-badge class="text-font ml-2" outline :label="props.row.book_state" />
                                </div>
                                <div class="flex justify-between w-full text-xs">
                                    <span class="line-clamp-1 whitespace-pre-wrap">{{ props.row.customer_description
                                    }}</span>
                                    <span class="line-clamp-1 text-xxs">{{ props.row.insurance }}</span>
                                </div>
                                <span class="line-clamp-1 text-xs">{{ props.row.user_description }}</span>
                                <div class="flex flex-col ml-auto">
                                    <span class="text-xs flex justify-between gap-2" v-if="props.row.total">
                                        <span>Precio: </span>
                                        <span class="text-green-600 ml-auto">{{ props.row.total_format }}</span>
                                    </span>
                                    <span class="text-xs flex justify-between gap-2" v-if="props.row.coverage_total">
                                        <span>Cobertura: </span>
                                        <span class="text-red-600 ml-auto">{{ props.row.coverage_total_format
                                        }}</span>
                                    </span>
                                    <span class="text-xs flex justify-between gap-2" v-if="props.row.gap_total">
                                        <span>Diferencia: </span>
                                        <span class="text-sky-600 ml-auto">{{ props.row.gap_total_format }}</span>
                                    </span>
                                    <span class="text-xs flex justify-between gap-2" v-if="props.row.exoneration_total">
                                        <span>Exoneración: </span>
                                        <span class="text-pink-600 ml-auto">{{ props.row.exoneration_total_format
                                        }}</span>
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </template>
                <template v-slot:bottom v-if="!$isDesktop">
                    <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
                </template>
            </q-table>
        </div>
    </q-page>
</template>

<script setup>
import { inject, onMounted, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import { addDays, format } from "date-fns";
import { convertToValidDate } from "src/helpers/date";
import { timePeriods } from 'src/data/options'
import { setTimePeriodQuery } from "src/helpers";
import PaginationTable from "src/components/table/PaginationTable.vue";
const props = defineProps({ patientId: Number, insuredId: Number })
const { t } = useI18n()
const tableRef = ref()
const $cats = inject('$cats')
const $me = inject('$me')
const $api = inject('$api')

const options = reactive({
    book_state: $cats.value.book_state,
    catalogue_category: $cats.value.catalogue_category.filter(i => [42, 43].includes(i.id)),
    timePeriods: timePeriods.map(i => ({ label: t(i), value: i }))
})

const state = reactive({
    assistants: [],
    timePeriod: 'all',
    dialogWrite: false,
    dialogList: false,
    dialogCreate: false,
    selectedId: 0,
    dialogWidth: 400,
    selected: [],
    search: '',
    search_key: 'orlike:code,customer_description,ncf_sequence,item_description',
    pagination: {
        sortBy: 'code',
        descending: true,
        page: 1,
        rowsPerPage: 50,
    },
    url: 'conciliation',
    query: {
        groupBy: ['t_book.code'],
        where: {
            'bi:c_status': 5,
            $book_type_id: 98,
            insured_id: props.insuredId ?? null,
            $book_state_id: [],
            book_date: {
                from: null,
                to: null,
            }
        }
    },
    columns: [
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: t('id'),
            classes: 'w-[100px]'
        },
        {
            name: 'code',
            required: true,
            label: '#',
            align: 'left',
            field: 'code',
            sortable: true
        },
        {
            name: 'book_date',
            required: true,
            label: t('FECHA'),
            align: 'left',
            field: "book_date_format",
            sortable: true
        },
        {
            name: 'provider_description',
            required: true,
            label: t('PROVEEDOR'),
            align: 'left',
            field: "provider_description",
            sortable: true
        },
        {
            name: 'insurance_description',
            required: true,
            label: t('insurance'),
            align: 'left',
            field: "insurance_description",
            sortable: true
        },
        { name: 'billed_amount_total', label: t('MONTO FACTURADO'), field: 'billed_amount_total_format', align: 'left', classes: 'w-[100px]' },
        { name: 'discount_total', label: t('DESCUENTO DE AJUSTE'), field: 'discount_total_format', align: 'left', classes: 'w-[160px]' },
        { name: 'coverage_total', label: t('MONTO A PROCESAR'), field: 'coverage_total_format', align: 'left', classes: 'w-[100px]' },
        { name: 'deductible_total', label: t('DEDUCIBLE / COPAGO'), field: 'deductible_total_format', align: 'left', classes: 'w-[100px]' },
        { name: 'covered_total', label: t('CUBIERTO'), field: 'covered_total_format', align: 'left', classes: 'w-[100px]' },
        { name: 'insurance_payment_total', label: t('PAGO DE ASEGURADA'), field: 'insurance_payment_total_format', align: 'left', classes: 'w-[100px]' },
        { name: 'insurance_responsability_total', label: t('RESP. ASEGURADA'), field: 'insurance_responsability_total_format', align: 'left', classes: 'w-[100px]' },
        {
            name: 'created_by',
            required: true,
            label: t('created'),
            align: 'left',
            field: row => row.created_by,
            sortable: true
        },
    ],
    rows: [
    ]
})

function nextDate() {
    const from = convertToValidDate(state.query.where.book_date.from)
    state.query.where.book_date.from = format(addDays(from, 1), 'dd/MM/yyyy')
    state.query.where.book_date.to = format(addDays(from, 1), 'dd/MM/yyyy')
}

function prevDate() {
    const from = convertToValidDate(state.query.where.book_date.from)
    state.query.where.book_date.from = format(addDays(from, -1), 'dd/MM/yyyy')
    state.query.where.book_date.to = format(addDays(from, -1), 'dd/MM/yyyy')
}

watch(() => state.timePeriod, (val) => {
    setTimePeriodQuery(val, state.query, 'book_date')
})

async function setItem(id) {
    try {
        state.query.where.item_id = id
    } catch (error) {
        console.log(error);
    }
}

async function clearItem() {
    try {
        state.query.where.item_id = null
    } catch (error) {
        console.log(error);
    }
}

onMounted(async () => {
    const users = await $api.get(`user`, {
        params: {
            where: {
                c_status: 4,
                'bi:unixroles': 28
            },
            returnItems: true
        }
    })

    state.doctors = users.filter(i => {
        return i.unixroles & 20
    }).map(i => ({
        label: i.description,
        value: i.id
    }))

    state.assistants = users.filter(i => {
        return i.unixroles & 8
    }).map(i => ({
        label: i.description,
        value: i.id
    }))
})

const { onRequest, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_user, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>