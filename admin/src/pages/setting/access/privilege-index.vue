<template>
    <q-page :class="!$isDesktop ? 'px-1.5 py-2' : insuredId ? 'px-2 py-3' : 'px-1.5 py-2 lg:px-5 lg:py-6'">
        <div class="flex flex-nowrap">
            <div class="w-[200px] mt-1 mr-2">
                <q-tabs v-model="state.tab" dense stretch indicator-color="transparent" align="left" :mobile-arrows="false"
                    vertical active-color="primary" active-class="active-tab">
                    <q-tab v-for="role in state.role.items" :key="role.id" :name="role.label" content-class="p-0 w-full"
                        class="w-full p-0 mb-2">
                        <template v-slot:default>
                            <q-btn flat class="button-tab text-font w-full" no-caps :label="role.label" />
                        </template>
                    </q-tab>
                </q-tabs>
            </div>
            <div class="w-full">
                <q-table v-model:pagination="state.pagination" flat :rows="state.rows" :columns="state.columns"
                    row-key="name" separator="vertical">
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="table" :props="props">{{ $t(props.row.table) }}</q-td>
                            <q-td key="create" :props="props"><q-checkbox v-model="props.row.create"
                                    @update:model-value="onChange(key, value, props)" /></q-td>
                        </q-tr>
                    </template>
                </q-table>
            </div>
        </div>
    <q-page>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { inject, onMounted, reactive, watch } from 'vue';
const $api = inject('$api')
const $q = useQuasar()

const state = reactive({
    role: {},
    table: {},
    tab: '',
    tabId: 1,
    privilege: [],
    columns: [{
        name: 'table',
        label: 'Tabla',
        field: 'table',
        align: 'center',
        classes: 'w-[300px]'

    }, {
        name: 'create',
        label: 'Crear',
        field: 'create',
        align: 'center'
    }],
    rows: [],
    pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 100,
    },
})

watch(() => state.tab, async (val) => {
    const [role] = state.role.items.filter(i => i.label === val)
    state.tabId = role.value;
    state.privilege = await $api.get(`privilege/table/${state.tabId}`);
    state.rows = state.privilege.items
})

async function onChange(key, value, props) {

    $api.post('privilege', [{
        c_related_table: props.row.table,
        c_who: state.tabId,
        c_action: 'create',
        c_group: 'role',
    }]);

    $q.notify({
        type: 'success',
        message: 'Privilegio actualizado'
    })

}

onMounted(async () => {
    const tables = await $api.get('/permission/tables')
    state.table = tables.tables_unixperms
    state.role = await $api.get('role')
    state.tab = 'ROOT'
})
</script>