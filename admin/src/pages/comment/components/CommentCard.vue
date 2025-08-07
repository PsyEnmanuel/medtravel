<template>
    <div class="rounded-none px-2 py-1 relative border-b mb-2 flex flex-col gap-1 flex-nowrap line-clamp-2 text-xs text-left h-full overflow-hidden leading-3 hover:shadow-primary cursor-pointer"
        @click.stop.prevent="$emit('open', item.id)">
        <div class="line-clamp-5">{{ item.text }}</div>
        <div class="flex flex-col bg-gray-100 rounded-lg text-xxxs  text-gray-500 px-2">
            <span class="line-clamp-1" v-if="item.comment_state"><span class="font-semibold">Estado: </span>{{
                item.comment_state }}</span>
            <div class="grid grid-cols-2 gap-1">
                <span class="line-clamp-1"><span class="font-semibold">Usuario: </span>{{ item.created_by }}</span>
                <span class="line-clamp-1"><span class="font-semibold">Creación: </span>{{ item.created_format
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