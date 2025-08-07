<template>
    <div class="flex justify-between md:flex-nowrap mb-1">
        <div class="flex flex-nowrap w-full gap-2">
            <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
                :placeholder="$t('search')">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>
            <q-btn flat class="button h-full" icon="upload" :label="$isDesktop && $t('Subir Polizas')"
                @click="migrateData" />
        </div>
    </div>
    <q-table :grid="!$isDesktop" hide-pagination :rows="_rows" :columns="state.columns" row-key="id" ref="tableRef" flat
        v-model:pagination="state.pagination" :loading="state.loading" rows-per-page-label="Lineas" :wrap-cells="true">
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
                <div class="flex gap-2">
                    <q-btn flat class="button-press bg-primary text-white rounded-md" size="sm" label="Editar" no-caps
                        @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                </div>
            </q-td>
        </template>

        <template v-slot:body-cell-insured_description="props">
            <q-td :props="props">
                <div class="flex flex-col">
                    <span>{{ props.row.insured_description }}</span>
                    <span>{{ props.row.ident_no }}</span>
                    <span>{{ props.row.sex }}</span>
                    <span>{{ props.row.birthdate_format }}</span>
                    <span>{{ props.row.age }}</span>
                </div>
            </q-td>
        </template>

    </q-table>
</template>

<script setup>
import { useQuasar } from "quasar";
import { computed, inject, onMounted, reactive, ref, watch } from "vue"
import { useI18n } from "vue-i18n";

const props = defineProps({ data: Array })
const $api = inject("$api");
const { t } = useI18n()
const tableRef = ref()
const $q = useQuasar()

const state = reactive({
    dialogWrite: false,
    dialogList: false,
    dialogCreate: false,
    selectedId: 0,
    dialogWidth: 400,
    selected: [],
    search: '',
    search_key: 'orlike:customer_description,policy_number,policy_branch,insured_code,insured_type,relationship,insured_description,',
    pagination: {
        sortBy: 'description',
        descending: false,
        page: 1,
        rowsPerPage: 1000,
    },
    columns: [
        // {
        //     name: 'action',
        //     required: true,
        //     label: '',
        //     align: 'left',
        //     field: t('id'),
        //     classes: 'w-[100px]'
        // },
        {
            name: 'customer_description',
            required: true,
            label: t('customer_description'),
            align: 'left',
            field: 'customer_description',
            sortable: true
        },
        {
            name: 'policy_number',
            required: true,
            label: t('policy_number'),
            align: 'left',
            field: 'policy_number',
            sortable: true
        },
        {
            name: 'insured_code',
            required: true,
            label: t('insured_code'),
            align: 'left',
            field: 'insured_code',
            sortable: true
        },
        {
            name: 'titular_description',
            required: true,
            label: t('titular_description'),
            align: 'left',
            field: 'titular_description',
            sortable: true
        },
        {
            name: 'insured_description',
            required: true,
            label: t('insured_description'),
            align: 'left',
            field: 'insured_description',
            sortable: true
        },
        {
            name: 'insurance',
            required: true,
            label: t('insurance'),
            align: 'left',
            field: 'insurance',
            sortable: true
        },
        {
            name: 'insurance_plan',
            required: true,
            label: t('insurance_plan'),
            align: 'left',
            field: 'insurance_plan',
            sortable: true
        },
        {
            name: 'insurance_plan_type',
            required: true,
            label: t('insurance_plan_type'),
            align: 'left',
            field: 'insurance_plan_type',
            sortable: true
        },
        {
            name: 'relationship',
            required: true,
            label: t('relationship'),
            align: 'left',
            field: 'relationship',
            sortable: true
        },
        {
            name: 'insured_type',
            required: true,
            label: t('insured_type'),
            align: 'left',
            field: 'insured_type',
            sortable: true
        },
        {
            name: 'policy_branch',
            required: true,
            label: t('policy_branch'),
            align: 'left',
            field: 'policy_branch',
            sortable: true
        },
        {
            name: 'validity_date_start',
            required: true,
            label: t('validity_date_start'),
            align: 'left',
            field: 'validity_date_start',
            sortable: true
        },
        {
            name: 'validity_date_end',
            required: true,
            label: t('validity_date_end'),
            align: 'left',
            field: 'validity_date_end',
            sortable: true
        },
    ],
    rows: props.data
})

const _rows = computed(() => {
    let rows;
    if (state.search === "") {
        rows = state.rows;
    } else {
        rows = state.rows.filter((v) =>
            state.search_key
                .replace("orlike:", "")
                .split(",")
                .some((i) => String(v[i]).toLowerCase().includes(state.search.toLowerCase()))
        );
    }
    return rows;
})

watch(() => _rows.value, (val) => {
    state.pagination.rowsNumber = val.length;
    state.pagination.page = 1;
})

async function migrateData() {
    const response = await $api.post(`migration/insurance`, state.rows)

    state.rows = [];
    state.pagination.rowsNumber = 0
    state.pagination.page = 1;

    if (response) {
        $q.notify({
            type: 'success',
            message: 'Póliza subida exitosamente'
        })
    }
}

</script>