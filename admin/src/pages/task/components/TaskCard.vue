<template>
    <div class="relative">
        <div class="rounded-none px-2 py-1 relative card flex flex-col gap-1 flex-nowrap line-clamp-2 text-xs text-left h-full overflow-hidden leading-3 hover:shadow-primary cursor-pointer"
            @click.stop.prevent="$emit('open', item.id)">
            <div class="line-clamp-5 font-bold">{{ item.row.user_description }}</div>
            <div class="line-clamp-2 font-semibold">{{ item.row.description }}</div>
            <div>{{ item.row.detail }}</div>
            <div class="flex gap-1">
                <q-badge class="bg-default text-black">{{ item.row.task_section }}</q-badge>
                <q-badge  :style="{ 'background-color': item.row.color }">{{ item.row.task_state }}</q-badge>
            </div>
            <div class="flex ml-auto gap-1 mt-1">
                <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
                    @click="$emit('selectedId', item.row.id)" />
            </div>
            <div class="flex flex-col gap-0.5 bg-gray-100 p-2 rounded-lg text-xxs">
                <span class="line-clamp-1"><span class="font-semibold">Usuario: </span>{{ item.row.created_by }}</span>
                <span class="line-clamp-1"><span class="font-semibold">Creación: </span>{{ item.row.created_format
                }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { inject } from 'vue';

const props = defineProps({
    item: Object, showOptions: {
        type: Boolean,
        default: false
    },
    action: {
        type: Boolean,
        default: false
    }
})
const $cats = inject("$cats")
const $api = inject("$api")
const $q = useQuasar()

async function updateEventState(row) {
    await $api.put(`event/general/${row.id}`, {
        $event_state_id: row.$event_state_id,
    })
    $q.notify({
        type: 'success',
        message: 'Coordinación Actualizada'
    })
}

</script>