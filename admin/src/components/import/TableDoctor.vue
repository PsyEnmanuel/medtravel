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
                :label="$isDesktop && $t('Importar Médicos')" @click="migrateData" />
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

        <template v-slot:body-cell-speciality="props">
            <q-td :props="props">
                <div class="flex flex-col" v-for="p in props.row.speciality" :key="p.id">
                    <div class="subtitle text-xs">{{ p.description }}</div>
                    <ul class="flex flex-col list-inside text-xxs mt-1" v-for="s in p.sub" :key="s.id">
                        <li v-if="s.checked">{{ s.description }}</li>
                    </ul>
                </div>
            </q-td>
        </template>
        <template v-slot:body-cell-language="props">
            <q-td :props="props">
                <div class="flex flex-col" v-for="language in props.row.language" :key="language">
                    <div class="subtitle text-xs">{{ language }}</div>
                </div>
            </q-td>
        </template>
        <template v-slot:body-cell-postnominal="props">
            <q-td :props="props">
                <div class="flex flex-nowrap gap-2">
                    <div v-for="postnominal in props.row.postnominal" :key="postnominal">
                        <div class="subtitle text-xs">{{ postnominal }}</div>
                    </div>
                </div>
            </q-td>
        </template>
        <template v-slot:body-cell-provider="props">
            <q-td :props="props">
                <div class="flex flex-col" v-for="p in props.row.provider" :key="p.id">
                    <div class="subtitle text-xs mb-1">{{ p.description }}</div>
                </div>
            </q-td>
        </template>
        <template v-slot:body-cell-bio="props">
            <q-td :props="props">
                <div class="flex flex-col">
                    <div class="line-clamp-1">{{ props.row.bio }}</div>
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
    url: 'doctor',
    query: {
        groupBy: ['t_doctor.id'],
        where: {
            'jo:$attention_type_ids': [],
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
            sortable: true,
            classes: 'w-[220px]'
        },
        {
            name: 'language',
            required: true,
            label: t('language'),
            align: 'left',
            field: 'language',
            sortable: true,
            classes: 'w-[100px]',
        },
        {
            name: 'attention_type',
            required: true,
            label: t('attention_type'),
            align: 'left',
            field: 'attention_type',
            sortable: true,
            classes: 'w-[100px]',
            format(value, row) {
                return row?.attention_type.join(', ')
            }
        },
        {
            name: 'speciality',
            required: true,
            label: t('specialities'),
            align: 'left',
            field: 'speciality',
            sortable: true,
            classes: 'w-[220px]'
        },
        {
            name: 'postnominal',
            required: true,
            label: t('postnominal'),
            align: 'left',
            field: 'postnominal',
            sortable: true,
            classes: 'w-[120px]'
        },
        {
            name: 'provider',
            required: true,
            label: t('providers'),
            align: 'left',
            field: 'provider',
            sortable: true,
        },
        {
            name: 'bio',
            required: true,
            label: t('bio'),
            align: 'left',
            field: 'bio',
            sortable: true,
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
    const response = await $api.post(`migration/doctor`, state.rows)

    state.rows = [];
    state.pagination.rowsNumber = 0
    state.pagination.page = 1;

    if (response) {
        $q.notify({
            type: 'success',
            message: 'Médico subidos exitosamente'
        })
        emit('close')
    }
    $q.loading.hide()
}

</script>