<template>
    <div class="flex justify-between md:flex-nowrap mb-2">
        <div class="flex flex-nowrap w-full gap-2">
            <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
                :placeholder="$t('search')">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>
            <q-btn flat class="button h-full" icon="add" :label="$isDesktop && $t('add')"
                @click="state.dialogCreate = true" />
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
    <div class="flex lg:flex-nowrap w-full gap-2">
        <q-btn v-if="state.selected.length" flat class="button h-full bg-primary text-white" icon-right="sym_o_remove"
            :label="$isDesktop ? 'Remover' : ''" no-caps @click="onDeleteRows" />
    </div>
    <div>
        <q-option-group class="flex text-xs" size="sm" v-model="state.query.where['in:$event_state_id']"
            toggle-color="secondary" toggle-text-color="text-font" :options="options.event_state" type="checkbox" />
    </div>
    <div class="grid lg:grid-cols-4 gap-1 mb-1">
        <UserSelect @setUser="state.query.where.user_id = $event" @clearUser="state.query.where.user_id = null"
            :model-value="state.user_description" label="Coordinador" :unixroles="24" />
        <ProviderSelect class="w-full" @setProvider="state.query.where['t_event.provider_id'] = $event"
            @clearProvider="state.query.where['t_event.provider_id'] = null"
            :model-value="state.provider_description" />
    </div>
    <q-table :grid="!$isDesktop" hide-pagination :rows="state.rows" :columns="state.columns" row-key="id" ref="tableRef"
        @request="onRequest" flat selection="multiple" v-model:pagination="state.pagination"
        v-model:selected="state.selected" :selected-rows-label="getSelectedString" :loading="state.loading"
        rows-per-page-label="Lineas" :wrap-cells="true" :visibleColumns="state.visibleColumns">
        <template v-slot:no-data="{ icon, message, filter }">
            <div class="full-width row flex-center text-primary q-gutter-sm">
                <span>
                    {{ message }}
                </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
        </template>

        <template v-slot:body-cell-avatar="props">
            <q-td :props="props">
                <q-avatar rounded size="42px">
                    <img :src="$imageInsuredPlaceholder(props.value)" />
                </q-avatar>
            </q-td>
        </template>

        <template v-slot:bottom v-if="!$isDesktop">
            <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
        </template>
    </q-table>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import { addDays, format } from "date-fns";
import UserSelect from "src/components/select/UserSelect.vue";
import ProviderSelect from "src/components/select/ProviderSelect.vue";
const $cats = inject('$cats')
const $me = inject('$me')
const props = defineProps({
    insuredId: Number,
    doctorId: Number,
    providerId: Number,
})
const { t } = useI18n()
const tableRef = ref()

const options = reactive({
    event_state: $cats.value.event_state,
    event_type: $cats.value.event_type
})

const state = reactive({
    itinerary: [],
    eventSelected: null,
    itineraryDialog: false,
    dialogCopy: false,
    dialogWrite: false,
    dialogList: false,
    dialogCreate: false,
    selectedId: 0,
    dialogWidth: 400,
    selected: [],
    search: '',
    search_key: 'orlike:t_event.code,user_description,insured,t_event.provider_description,contact_description,t_event.created_by,MRN',
    pagination: {
        sortBy: 't_event.event_state',
        descending: false,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'event',
    table: 't_event',
    query: {
        join: [{
            table: 't_itinerary',
            relationA: 't_itinerary.event_id',
            relationB: 't_event.id',
        }],
        groupBy: ['t_event.id'],
        where: {
            't_event.c_status': 4,
            high_profile: $me.high_profile ? null : 0,
            insured_id: props.insuredId ?? null,
            doctor_id: props.doctorId ?? null,
            't_event.provider_id': props.providerId ?? null,
            'in:$event_type_id': $me.unixroles & 8 ? [178] : $me.unixroles & 16 ? [176] : [],
            attendance_datetime: {
                from: null,
                to: null,
            },
            'in:$event_state_id': []
        }
    },
    visibleColumns: [],
    columns: [
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: t('id'),
            classes: 'min-w-[200px]'
        },
        {
            name: 'user_description',
            required: true,
            label: 'Asignado a',
            align: 'left',
            field: 'user_description',
            sortable: true
        },
        {
            name: 'insured',
            required: true,
            label: t('insured'),
            align: 'left',
            field: 'insured',
            sortable: true
        },
        {
            name: 'provider_description',
            required: true,
            label: `Proveedor/Contacto`,
            align: 'left',
            field: 'provider_description',
            sortable: true
        },
        {
            name: 'doctor_description',
            required: true,
            label: `Médico`,
            align: 'left',
            field: 'doctor_description',
            sortable: true
        },
        {
            name: 'event_state',
            required: true,
            label: t('event_state'),
            align: 'left',
            field: 'event_state',
            sortable: true
        },
        {
            name: 'request_date',
            required: true,
            label: t('request_date'),
            align: 'left',
            field: 'request_date_format',
            sortable: true
        },
        {
            name: 'created_by',
            required: true,
            label: t('created_by'),
            align: 'left',
            field: 'created_by',
            sortable: true
        },
        {
            name: 'reason_cancellation',
            label: t('reason_cancellation'),
            align: 'left',
            field: 'reason_cancellation',
            sortable: true,
            hidden: true
        }
    ],
    rows: [
    ]
})

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_event, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

watch(() => state.query.where["t_event.c_status"], (val) => {
    console.log(val);
    if (val === 2) {
        state.visibleColumns = state.columns.filter(i => {
            return i.name === 'reason_cancellation' && !i.required
        }).map(i => i.name)
    } else {
        state.visibleColumns = []
    }
})

</script>