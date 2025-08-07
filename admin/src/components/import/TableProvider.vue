<template>
    <div class="flex justify-between md:flex-nowrap mb-1">
        <div class="flex flex-nowrap w-full gap-2">
            <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
                :placeholder="$t('search')">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>
            <q-btn :disabled="!state.rows.length" flat class="button h-full" icon="upload"
                :label="$isDesktop && $t('Importar Proveedores')" @click="migrateData" />
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

        <template v-slot:body-cell-webpage="props">
            <q-td :props="props">
                <div class="flex gap-2">
                    <a :href="props.row.webpage" target="_blank">
                        <q-btn flat class="button-press bg-primary text-white rounded-md" size="sm" label="PAGINA WEB"
                            no-caps />
                    </a>
                </div>
            </q-td>
        </template>

        <template v-slot:body-cell-link_gps="props">
            <q-td :props="props">
                <div class="flex gap-2">
                    <a :href="props.row.link_gps" target="_blank">
                        <q-btn flat class="button-press bg-primary text-white rounded-md" size="sm" label="MAPA"
                            no-caps />
                    </a>
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
const emit = defineEmits(['close'])
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
    search_key: 'orlike:description',
    pagination: {
        sortBy: 'description',
        descending: false,
        page: 1,
        rowsPerPage: 9999,
    },
    url: 'provider',
    query: {
        groupBy: ['t_provider.id'],
        where: {
            c_status: 4,
        }
    },
    columns: [
        {
            name: 'description',
            required: true,
            label: t('name'),
            align: 'left',
            field: 'description',
            classes: 'w-[250px]',
            sortable: true
        },
        {
            name: 'provider_type',
            required: true,
            label: t('provider_type'),
            align: 'left',
            field: 'provider_type',
            sortable: true
        },
        {
            name: 'country',
            required: true,
            label: t('country'),
            align: 'left',
            field: 'country',
            sortable: true
        },
        {
            name: 'city',
            required: true,
            label: t('city'),
            align: 'left',
            field: 'city',
            sortable: true
        },
        {
            name: 'phone',
            required: true,
            label: t('phone'),
            align: 'left',
            field: 'phone',
            sortable: true
        },
        {
            name: 'address',
            required: true,
            label: t('address'),
            align: 'left',
            field: 'address',
            sortable: true
        },
        {
            name: 'webpage',
            required: true,
            label: t('webpage'),
            align: 'left',
            field: 'webpage',
            classes: 'max-w-[200px]',
            sortable: true,
        },
        {
            name: 'link_gps',
            required: true,
            label: t('link_gps'),
            align: 'left',
            field: 'link_gps',
            classes: 'max-w-[200px] overflow-hidden',
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
    $q.loading.show()
    const response = await $api.post(`migration/provider`, state.rows)

    state.rows = [];
    state.pagination.rowsNumber = 0
    state.pagination.page = 1;

    if (response) {
        $q.notify({
            type: 'success',
            message: 'Proveedores subidos exitosamente'
        })
        emit('close')
    }
    $q.loading.hide()
}

</script>