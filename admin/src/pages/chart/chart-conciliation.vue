<template>
    <div v-if="!state.loading">

        <div class="grid md:grid-cols-2 gap-2 mb-1">
            <div class="grid grid-cols-2 gap-2">
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
            </div>

            <div class="w-full">
                <q-btn-toggle class="mb-2" size="xs" unelevated spread v-model="state.quickDate" toggle-color="cyan-3"
                    toggle-text-color="text-font" :options="[
                        { label: 'Hoy', value: 0 },
                        { label: 'Ayer', value: 1 },
                        { label: 'Mes Anterior', value: 2 },
                        { label: 'Mes Actual', value: 3 },
                        { label: 'Año Actual', value: 4 },
                        { label: 'Todas', value: 5 },
                    ]" />
            </div>
        </div>

        <div class="grid md:grid-cols-3 gap-2">
            <q-select class="md:mb-2" dense outlined clearable v-model="state.query.where.$book_state_id"
                :label="$t('book_state')" :options="$cats.book_state" option-value="id" option-label="description"
                emit-value map-options>
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            No data
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
            <q-select class="md:mb-2" dense outlined use-input hide-selected fill-input input-debounce="0"
                v-model="state.query.where.user_id" label="Médico/Cosmíatra" :options="options.users" option-value="id"
                option-label="description"
                @filter="(val, update, abort) => filterFn(val, update, abort, 'users', state.users)" clearable
                emit-value map-options>
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            No data
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
            <q-select class="mb-2" dense outlined use-input hide-selected fill-input input-debounce="0"
                v-model="state.query.where.insurance_id" :label="$t('insurance')" :options="options.insurances"
                option-value="id" option-label="description"
                @filter="(val, update, abort) => filterFn(val, update, abort, 'insurances', state.insurances)" clearable
                emit-value map-options>
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            No data
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
        </div>

        <div class="flex md:flex-nowrap gap-2">
            <div class="w-full md:max-w-[300px]">
                <div class="card p-2 px-4 flex flex-col mb-2">
                    <span class="border-l-4 bg-green-200 pl-2 text-bold text-[#464646]">Ingresos</span>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Servicios:</span>
                        <span class="mt-1 text-sm text-right">{{ $currency(state.stats.DOP.amount.total_service)
                            }}</span>
                    </div>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Medicamentos:</span>
                        <span class="mt-1 text-sm text-right">{{ $currency(state.stats.DOP.amount.total_medication)
                            }}</span>
                    </div>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Cobertura:</span>
                        <span class="mt-1 text-sm text-right">{{ $currency(state.stats.DOP.amount.coverage) }}</span>
                    </div>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Total:</span>
                        <span class="mt-1 text-lg text-right">{{ $currency(state.stats.DOP.amount.income) }}</span>
                    </div>
                </div>
                <div v-if="!hideStatistics" class="card p-2 px-4 flex flex-col mb-2">
                    <span class="border-l-4 bg-green-200 pl-2 text-bold text-[#464646]">Salida</span>
                    <span class="flex flex-col" v-for="(row, index) in typeListComputed" :key="index">
                        <div class="flex justify-between items-end">
                            <span class="text-xs">{{ row.label }}</span>
                            <span class="mt-1 text-sm text-right">{{ $currency(row.value) }}</span>
                        </div>
                    </span>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Total:</span>
                        <span class="mt-1 text-lg text-right">{{ $currency(state.stats_expense.DOP.amount.total_cost)
                            }}</span>
                    </div>
                </div>
                <div v-if="!hideStatistics" class="card p-2 px-4 flex flex-col mb-2">
                    <span class="border-l-4 bg-green-200 pl-2 text-bold text-[#464646]">Restante</span>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Ingresos:</span>
                        <span class="mt-1 text-sm text-right">{{ $currency(state.stats.DOP.amount.income) }}</span>
                    </div>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Salida:</span>
                        <span class="mt-1 text-sm text-right">{{ $currency(state.stats_expense.DOP.amount.total_cost)
                            }}</span>
                    </div>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Total:</span>
                        <span class="mt-1 text-lg text-right">{{ $currency(state.remaining) }}</span>
                    </div>
                </div>
                <div v-if="!hideStatistics" class="card p-2 px-4 flex flex-col mb-2">
                    <span class="border-l-4 bg-green-200 pl-2 text-bold text-[#464646]">Pagos</span>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Efectivo:</span>
                        <span class="mt-1 text-sm text-right">{{ $currency(state.stats_payment.DOP.cash_total) }}</span>
                    </div>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Transferencia:</span>
                        <span class="mt-1 text-sm text-right">{{ $currency(state.stats_payment.DOP.transfer_total)
                            }}</span>
                    </div>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Tarjeta de Credito:</span>
                        <span class="mt-1 text-sm text-right">{{ $currency(state.stats_payment.DOP.card_total) }}</span>
                    </div>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Total:</span>
                        <span class="mt-1 text-lg text-right">{{ $currency(state.stats_payment.DOP.payment_total)
                            }}</span>
                    </div>
                </div>
                <div v-if="!hideStatistics" class="card p-2 px-4 flex flex-col">
                    <span class="border-l-4 bg-green-200 pl-2 text-bold text-[#464646]">Pendiente por cobrar</span>
                    <div class="flex justify-between items-end">
                        <span class="text-xs">Total:</span>
                        <span class="mt-1 text-sm text-right">{{ $currency(state.stats.DOP.amount.balance) }}</span>
                    </div>
                </div>
            </div>
            <div class="w-full">
                <div v-if="state.invoiceStateList.length" class="bg-white card p-4">
                    <q-table flat :rows="state.invoiceStateList" :columns="state.quantityColumns" row-key="name" dense
                        no-data-label="No hay eventos para esta fecha" :rows-per-page-options="[0]" wrap-cells>
                        <template v-slot:top-left>
                            <span class="uppercase text-center w-full subtitle">TABLA DE ESTADO</span>
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

                <div class="grid grid-cols-1 gap-2">
                    <div class="card">
                        <ChartPieArrObj :key="state.update" :data="state.insuranceList" name="label" value="value"
                            title="Seguros Médicos" subtitle="Facturas" currency />
                    </div>
                </div>
                <div class="grid grid-cols-1 gap-2">
                    <div class="bg-white card p-4 mt-2">
                        <div class="flex">
                            <span class="uppercase flex items-center subtitle mr-2">TABLA DE SEGURO MÉDICO</span>
                            <q-input class="mr-2" dense outlined debounce="300" v-model="state.searchInsurance"
                                :placeholder="$t('search')">
                                <template v-slot:append>
                                    <q-icon name="search" />
                                </template>
                            </q-input>
                        </div>
                        <q-table flat :rows="insuranceListComputed" :columns="state.columns" row-key="name" dense
                            no-data-label="No hay eventos para esta fecha" :rows-per-page-options="[0]" wrap-cells
                            :pagination="state.initialPagination">
                            <template v-slot:no-data="{ icon, message, filter }">
                                <div class="full-width row flex-center text-primary q-gutter-sm">
                                    <span>
                                        {{ message }}
                                    </span>
                                    <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                                </div>
                            </template>
                            <template v-slot:body-cell-action="props">
                                <q-td :props="props">
                                    <q-btn flat class="button bg-green-400" size="xs"
                                        :label="$isDesktop ? 'Factura' : ''" icon="sym_o_open_in_new" no-caps
                                        @click="openDialogTable('insurance', props.row.label)" />
                                </q-td>
                            </template>
                            <template v-slot:body-cell-label="props">
                                <q-td :props="props">
                                    {{ $t(props.row.label) }}
                                </q-td>
                            </template>
                            <template v-slot:body-cell-value="props">
                                <q-td :props="props">
                                    {{ $currency(props.row.value) }}
                                </q-td>
                            </template>
                        </q-table>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-2">
            <div class="card mt-2">
                <ChartPieArrObj :key="state.update" :data="state.itemsList" name="label" value="value"
                    title="Medicamentos" subtitle="Facturas" currency nolabel />
            </div>
        </div>
        <div class="grid grid-cols-1 gap-2">
            <div class="bg-white card p-4 mt-2">
                <div class="flex">
                    <span class="uppercase flex items-center subtitle mr-2">TABLA DE MEDICAMENTOS</span>
                    <q-input class="mr-2" dense outlined debounce="300" v-model="state.searchItems"
                        :placeholder="$t('search')">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </div>
                <q-table flat :rows="itemsListComputed" :columns="state.columns" row-key="name" dense
                    no-data-label="No hay facturas para esta fecha" :rows-per-page-options="[0]" wrap-cells
                    :pagination="state.initialPagination">
                    <template v-slot:no-data="{ icon, message, filter }">
                        <div class="full-width row flex-center text-primary q-gutter-sm">
                            <span>
                                {{ message }}
                            </span>
                            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                        </div>
                    </template>
                    <template v-slot:body-cell-action="props">
                        <q-td :props="props">
                            <q-btn flat class="button bg-green-400" size="xs" label="Factura" no-caps
                                @click="openDialogTable('item_description', props.row.label, 'item_description')" />
                        </q-td>
                    </template>
                    <template v-slot:body-cell-label="props">
                        <q-td :props="props">
                            {{ $t(props.row.label) }}
                        </q-td>
                    </template>
                    <template v-slot:body-cell-value="props">
                        <q-td :props="props">
                            {{ $currency(props.row.value) }}
                        </q-td>
                    </template>
                </q-table>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-2">
            <div class="card mt-2">
                <ChartPieArrObj :key="state.update" :data="state.servicesList" name="label" value="value"
                    title="Servicios" subtitle="Facturas" currency nolabel />
            </div>
        </div>
        <div class="grid grid-cols-1 gap-2">
            <div class="bg-white card p-4 mt-2">
                <div class="flex">
                    <span class="uppercase flex items-center subtitle mr-2">TABLA DE SERVICIOS</span>
                    <q-input class="mr-2" dense outlined debounce="300" v-model="state.searchServices"
                        :placeholder="$t('search')">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </div>
                <q-table flat :rows="servicesListComputed" :columns="state.columns" row-key="name" dense
                    no-data-label="No hay eventos para esta fecha" :rows-per-page-options="[0]" wrap-cells
                    :pagination="state.initialPagination">
                    <template v-slot:no-data="{ icon, message, filter }">
                        <div class="full-width row flex-center text-primary q-gutter-sm">
                            <span>
                                {{ message }}
                            </span>
                            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                        </div>
                    </template>
                    <template v-slot:body-cell-action="props">
                        <q-td :props="props">
                            <q-btn flat class="button bg-green-400" size="xs" label="Factura" no-caps
                                @click="openDialogTable('item_description', props.row.label, 'services')" />
                        </q-td>
                    </template>
                    <template v-slot:body-cell-label="props">
                        <q-td :props="props">
                            {{ $t(props.row.label) }}
                        </q-td>
                    </template>
                    <template v-slot:body-cell-value="props">
                        <q-td :props="props">
                            {{ $currency(props.row.value) }}
                        </q-td>
                    </template>
                </q-table>
            </div>
        </div>







        <q-dialog class="q-pa-none left-0" v-model="state.dialogTable" position="standard"
            :transition-duration="$isDesktop ? 100 : 0" style="width: 1200px">
            <q-card style="width: 1000px; max-width: 80vw;" class="p-4">
                <q-table flat :rows="state.dialogTableItems" :columns="columnsDialog" row-key="name" dense
                    no-data-label="No hay eventos para esta fecha" :rows-per-page-options="[0]" wrap-cells>
                    <template v-slot:top-left>
                        <span class="text-center w-full uppercase">TABLA DE FACTURAS</span>
                    </template>
                    <template v-slot:body-cell-action="props">
                        <q-td :props="props">
                            <q-btn flat class="button bg-green-300" size="xs" label="Guardar cambios" no-caps
                                @click="$router.push(`/facturas/editar/${props.row.code}`)" />
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
import { reactive, onMounted, inject, watch, computed } from 'vue'
import { format, startOfYesterday, startOfMonth, endOfMonth, endOfYear, startOfYear, getDate, subMonths } from "date-fns"
const $cats = inject("$cats")
import { es, id } from 'date-fns/locale';
import ChartBarVertical from 'src/components/chart/ChartBarVertical.vue'
import ChartPie from 'src/components/chart/ChartPie.vue'
import { useFilter } from 'src/use/filter'
import ChartPieArrObj from 'src/components/chart/ChartPieArrObj.vue';
import { cloneObj, roundToPrecision } from "src/helpers";

const start_of_month = startOfMonth(new Date());

const month = format(start_of_month, 'MMMM', { locale: es });

const day = getDate(new Date());

const $api = inject('$api')

const options = reactive({
    insurances: [],
    users: [],
})

const hideStatistics = computed(() => {
    return state.query.where.insurance_id || state.query.where.user_id || state.query.where.$book_state_id
})

const itemsListComputed = computed(() => {
    return state.itemsList.filter(i => {
        if (state.searchItems) {
            return i.label.toLowerCase().includes(state.searchItems.toLowerCase())
        }
        return true
    })
})

const servicesListComputed = computed(() => {
    return state.servicesList.filter(i => {
        if (state.searchServices) {
            return i.label.toLowerCase().includes(state.searchServices.toLowerCase())
        }
        return true
    })
})

const insuranceListComputed = computed(() => {
    return state.insuranceList.filter(i => {
        if (state.searchInsurance) {
            return i.label.toLowerCase().includes(state.searchInsurance.toLowerCase())
        }
        return true
    })
})

const typeListComputed = computed(() => {
    return state.typeList.filter(i => {
        if (state.searchType) {
            return i.label.toLowerCase().includes(state.searchType.toLowerCase())
        }
        return true
    })
})

const columnsDialog = computed(() => {
    let coulmn = [];

    if (state.dialogName === 'insurance') {
        coulmn = [{
            name: 'user_description',
            required: true,
            label: 'Coordinador',
            align: 'left',
            field: 'user_description',
            sortable: true
        },
        {
            name: 'coverage_amount',
            required: true,
            label: 'Monto',
            align: 'left',
            field: 'coverage_amount_format',
            sortable: true
        }]
    } else if (state.dialogName === 'item_description') {
        coulmn = [{
            name: 'price_amount',
            required: true,
            label: 'Monto',
            align: 'left',
            field: 'price_amount_format',
            sortable: true
        }]
    } else {
        coulmn = [{
            name: 'user_description',
            required: true,
            label: 'Coordinador',
            align: 'left',
            field: 'user_description',
            sortable: true
        }, {
            name: 'price_amount',
            required: true,
            label: 'Monto',
            align: 'left',
            field: 'price_amount_format',
            sortable: true
        }]
    }

    return [
        {
            name: 'code',
            required: true,
            label: '#',
            align: 'left',
            field: 'code',
            classes: 'w-[150px]',
            sortable: true
        },
        {
            name: 'action',
            required: true,
            label: 'Acciones',
            align: 'left',
            field: 'action',
            classes: 'w-[150px]'
        },
        {
            name: 'customer_description',
            required: true,
            label: 'Nombre',
            align: 'left',
            field: 'customer_description',
            sortable: true
        },
        {
            name: 'quantity',
            required: true,
            label: 'Cant.',
            align: 'left',
            field: 'quantity',
            sortable: true
        },
        ...coulmn,
        // {
        //     name: 'book_type',
        //     required: true,
        //     label: 'Tipo',
        //     align: 'left',
        //     field: 'book_type',
        // },
        {
            name: 'book_date_format',
            required: true,
            label: 'Fecha',
            align: 'left',
            field: 'book_date_format',
            sortable: true
        },
    ]

})

const state = reactive({
    dialogName: null,
    timeout: null,
    quickDate: 3,
    searchItems: null,
    searchInsurance: null,
    searchServices: null,
    loading: true,
    first: true,
    first2: true,
    update: 1,
    day,
    stats: {},
    remaining: 0,
    stats_expense: {},
    stats_payment: {},
    diagnosis: [],
    invoiceStateList: [],
    insuranceList: [],
    amountList: [],
    treatment: [],
    itemsList: [],
    servicesList: [],
    month,
    start: 'all',
    initialPagination: {
        sortBy: 'quantity',
        descending: true,
        page: 1,
        rowsPerPage: 10
    },
    query: {
        groupBy: ['t_book.id'],
        where: {
            $book_type_id: 98,
            $book_state_id: null,
            book_date: {
                from: format(startOfMonth(new Date()), 'dd/MM/yyyy'),
                to: format(endOfMonth(new Date()), 'dd/MM/yyyy'),
            },
            c_status: [4],
        },
    },
    queryExpense: {
        groupBy: ['t_book.code'],
        where: {
            'in:$book_type_id': [108],
            'in:$book_state_id': [],
            book_date: {
                from: format(startOfMonth(new Date()), 'dd/MM/yyyy'),
                to: format(endOfMonth(new Date()), 'dd/MM/yyyy'),
            },
            c_status: [4],
        },
    },
    queryPayment: {
        groupBy: ['t_book.code'],
        where: {
            'in:$book_type_id': [99],
            'in:$book_state_id': [],
            book_date: {
                from: format(startOfMonth(new Date()), 'dd/MM/yyyy'),
                to: format(endOfMonth(new Date()), 'dd/MM/yyyy'),
            },
            c_status: [4],
        },
    },
    quantityColumns: [
        {
            name: 'description',
            required: true,
            label: 'Detalle',
            align: 'left',
            field: 'description',
            sortable: true
        },
        {
            name: 'amount',
            required: true,
            label: 'Cant.',
            align: 'left',
            field: 'amount',
            sortable: true
        },
    ],
    amountColumns: [
        {
            name: 'description',
            required: true,
            label: 'Detalle',
            align: 'left',
            field: 'description',
            sortable: true
        },
        {
            name: 'value',
            required: true,
            label: 'Monto',
            align: 'left',
            field: 'value',
            sortable: true
        },
    ],
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
            name: 'label',
            required: true,
            label: 'Detalle',
            align: 'left',
            field: 'label',
            sortable: true
        },
        {
            name: 'quantity',
            required: true,
            label: 'Cant.',
            align: 'left',
            field: 'quantity',
            sortable: true
        },
        {
            name: 'value',
            required: true,
            label: 'Monto',
            align: 'left',
            field: 'value',
            sortable: true
        },
    ],
})

watch(() => state.query.where.book_date.from, (val) => {
    state.queryExpense.where.book_date.from = val
    state.queryPayment.where.book_date.from = val
})

watch(() => state.query.where.book_date.to, (val) => {
    state.queryExpense.where.book_date.to = val
    state.queryPayment.where.book_date.to = val
})

watch(() => state.quickDate, (val) => {
    switch (val) {
        case 0:
            state.query.where.book_date.from = format(new Date(), 'dd/MM/yyyy')
            state.query.where.book_date.to = format(new Date(), 'dd/MM/yyyy')
            state.queryExpense.where.book_date.from = format(new Date(), 'dd/MM/yyyy')
            state.queryExpense.where.book_date.to = format(new Date(), 'dd/MM/yyyy')
            state.queryPayment.where.book_date.from = format(new Date(), 'dd/MM/yyyy')
            state.queryPayment.where.book_date.to = format(new Date(), 'dd/MM/yyyy')
            break;
        case 1:
            state.query.where.book_date.from = format(startOfYesterday(new Date()), 'dd/MM/yyyy')
            state.query.where.book_date.to = format(startOfYesterday(new Date()), 'dd/MM/yyyy')
            state.queryExpense.where.book_date.from = format(startOfYesterday(new Date()), 'dd/MM/yyyy')
            state.queryExpense.where.book_date.to = format(startOfYesterday(new Date()), 'dd/MM/yyyy')
            state.queryPayment.where.book_date.from = format(startOfYesterday(new Date()), 'dd/MM/yyyy')
            state.queryPayment.where.book_date.to = format(startOfYesterday(new Date()), 'dd/MM/yyyy')
            break;
        case 2:
            let lastMonth = subMonths(new Date, 1)
            state.query.where.book_date.from = format(startOfMonth(lastMonth), 'dd/MM/yyyy')
            state.query.where.book_date.to = format(endOfMonth(lastMonth), 'dd/MM/yyyy')
            state.queryExpense.where.book_date.from = format(startOfMonth(lastMonth), 'dd/MM/yyyy')
            state.queryExpense.where.book_date.to = format(endOfMonth(lastMonth), 'dd/MM/yyyy')
            state.queryPayment.where.book_date.from = format(startOfMonth(lastMonth), 'dd/MM/yyyy')
            state.queryPayment.where.book_date.to = format(endOfMonth(lastMonth), 'dd/MM/yyyy')
            break;
        case 3:
            state.query.where.book_date.from = format(startOfMonth(new Date()), 'dd/MM/yyyy')
            state.query.where.book_date.to = format(endOfMonth(new Date()), 'dd/MM/yyyy')
            state.queryExpense.where.book_date.from = format(startOfMonth(new Date()), 'dd/MM/yyyy')
            state.queryExpense.where.book_date.to = format(endOfMonth(new Date()), 'dd/MM/yyyy')
            state.queryPayment.where.book_date.from = format(startOfMonth(new Date()), 'dd/MM/yyyy')
            state.queryPayment.where.book_date.to = format(endOfMonth(new Date()), 'dd/MM/yyyy')
            break;
        case 4:
            state.query.where.book_date.from = format(startOfYear(new Date()), 'dd/MM/yyyy')
            state.query.where.book_date.to = format(endOfYear(new Date()), 'dd/MM/yyyy')
            state.queryExpense.where.book_date.from = format(startOfYear(new Date()), 'dd/MM/yyyy')
            state.queryExpense.where.book_date.to = format(endOfYear(new Date()), 'dd/MM/yyyy')
            state.queryPayment.where.book_date.from = format(startOfYear(new Date()), 'dd/MM/yyyy')
            state.queryPayment.where.book_date.to = format(endOfYear(new Date()), 'dd/MM/yyyy')
            break;
        case 5:
            state.query.where.book_date.from = null
            state.query.where.book_date.to = null
            state.queryExpense.where.book_date.from = null
            state.queryExpense.where.book_date.to = null
            state.queryPayment.where.book_date.from = null
            state.queryPayment.where.book_date.to = null
            break;

        default:
            break;
    }
})

async function getStats() {
    state.stats = await $api.get('invoice/stats', { params: state.query });


    if (state.first) {
        state.invoiceStateList = [...state.stats.DOP.invoiceStateList]
        state.insuranceList = [...state.stats.DOP.insuranceList]
        state.userList = [...state.stats.DOP.userList]
        state.itemsList = [...state.stats.DOP.itemsList]
        state.servicesList = [...state.stats.DOP.servicesList]
    }
    state.stats_expense = await $api.get('expense/stats', { params: state.queryExpense });
    if (state.first2) {
        state.typeList = [...state.stats_expense.DOP.typeList]
    }
    state.stats_payment = await $api.get('invoice/payments-stats', { params: state.queryPayment });
    if (state.first3) {
        // state.itemsList = [...state.stats_payment.DOP.itemsList]
        // state.typeList = [...state.stats_payment.DOP.typeList]
    }

    state.remaining = roundToPrecision(state.stats.DOP.amount.income) - roundToPrecision(state.stats_expense.DOP.amount.total_cost)

    ++state.update
}

async function getInsurances() {
    const insurances = await $api.get('insurance', {
        params: {
            order: {
                description: 'ASC'
            },
            where: {
                c_status: 4
            },
            returnItems: true
        }
    })
    options.insurances = insurances.map(i => ({ ...i, label: i.description }))
    state.insurances = cloneObj(options.insurances)
}

async function getUsers() {
    const users = await $api.get('user', {
        params: {
            order: {
                description: "ASC"
            },
            group_by: 't_user.id',
            where: {
                c_status: 4,
                'bi:unixroles': 22
            },
            returnItems: true
        }
    })

    options.users = users.map((opt) => ({
        ...opt,
        value: opt.id,
        label: opt.description,
    }));
    state.users = cloneObj(options.users)
}

const { filterFn } = useFilter(options)

async function openDialogTable(key, value, key2) {
    try {
        // state.dialogTable = true;
        
        if (key2) {
            state.dialogName = key2
        } else {
            state.dialogName = key
        }
        
        let where = {
            'in:$book_type_id': [98],
            'in:$book_state_id': [],
            c_status: 4,
            book_date: state.query.where.book_date
        };
        
        
        if (value === 'null') {
            where[`null:${key}`] = 1
        } else {
            where[key] = value
        }

        const { items } = await $api.get('invoice', {
            params: {
                groupBy: ['t_book.id'],
                where: where
            }
        });
        state.dialogTable = true;
        state.dialogTableItems = items;
    } catch (error) {
        console.log(error);
    }
}

watch(() => state.query.where, (val) => {
    clearTimeout(state.timeout)
    state.timeout = setTimeout(() => {
        state.first = true;
        state.first2 = true;
        getStats()
    }, 300);
}, { deep: true })

onMounted(async () => {
    await getStats()
    await getInsurances()
    await getUsers()
    state.loading = false
})


</script>