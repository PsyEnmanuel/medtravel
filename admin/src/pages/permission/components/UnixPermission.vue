<template>
    <div>
        <q-table v-model:pagination="state.pagination" flat :rows="state.rows" :columns="state.columns" row-key="name"
            separator="vertical">
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="label" :props="props">{{ $t(props.row.label) }}</q-td>
                    <q-td v-for="(value, key) in permission.items" :key="key" :props="props"><q-checkbox
                            v-model="props.row[key]" @update:model-value="onChange(key, value, props)" /></q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>
  
<script setup>
import { useQuasar } from 'quasar';
import { inject, onMounted, reactive } from 'vue';
const props = defineProps({ table: Object, permission: Object })
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const $q = useQuasar()

const $api = inject('$api')
const state = reactive({
    columns: [{
        name: 'label',
        label: 'Tabla',
        field: 'label',
        classes: 'w-[100px]',
        align: 'left'
    }],
    rows: [],
    pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 100,
    },
})

onMounted(async () => {
    for (const key in props.permission.items) {
        if (Object.prototype.hasOwnProperty.call(props.permission.items, key)) {
            const permission = props.permission[key];
            state.columns.push({
                name: key,
                label: t(key),
                field: permission,
                align: 'center'
            })
        }
    }
    state.rows = props.table
})

async function onChange(key, value, props) {
    if (props.row[key]) {
        props.row.value = parseInt(props.row.value) + parseInt(value)
    } else {
        props.row.value = parseInt(props.row.value) - parseInt(value)
    }

    $api.put('permission/unixperms', [{
        c_unixperms: props.row.value,
        table: props.row.label
    }]);

    $q.notify({
        type: 'success',
        message: 'Permiso de Unixperms actualizado'
    })
}

</script>
  