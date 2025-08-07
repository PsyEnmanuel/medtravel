<template>
    <q-page :class="!$isDesktop ? 'px-1.5 py-2' : insuredId ? 'px-2 py-3' : 'px-1.5 py-2 lg:px-5 lg:py-6'">
        <q-table v-model:pagination="state.pagination" flat :rows="state.rows" :columns="state.columns" row-key="name"
            separator="vertical">
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="label" :props="props">{{ $t(props.row.label) }}</q-td>
                    <q-td v-for="row in state.role.items" :key="row.label" :props="props"><q-checkbox
                            v-model="props.row[row.label]" @update:model-value="onChange(row, props)" /></q-td>
                </q-tr>
            </template>
        </q-table>
    </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { inject, onMounted, reactive } from 'vue';

const props = defineProps({ table: Object, role: Object })
const $api = inject('$api')
const $q = useQuasar()
const state = reactive({
    table: [],
    role: [],
    columns: [],
    rows: [],
    pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 100,
    },
})

onMounted(async () => {
    state.tables = await $api.get('/permission/tables')
    state.role = await $api.get('role')

    state.columns = state.role.items.reduce((acc, curr) => {
        acc.push({
            name: curr.label,
            label: `${curr.label} (${curr.value})`,
            field: curr.label,
            align: 'center'
        })
        return acc;
    }, [{
        name: 'label',
        label: 'TABLA',
        field: 'label',
        classes: 'w-[100px]',
        align: 'left'
    }])

    state.rows = state.tables.tables_roles
})

async function onChange(role, props) {
    if (props.row[role.label]) {
        props.row.value = parseInt(props.row.value) + parseInt(role.value)
    } else {
        props.row.value = parseInt(props.row.value) - parseInt(role.value)
    }
    $api.put('permission/roles-permission', [{
        c_group: props.row.value,
        table: props.row.label
    }]);

    $q.notify({
        type: 'success',
        message: 'Permiso de Role actualizado'
    })
}

</script>