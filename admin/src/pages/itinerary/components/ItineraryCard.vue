<template>
    <div class="relative">
        <div class="rounded-none px-2 py-1 relative flex flex-col gap-1 flex-nowrap line-clamp-2 text-xxs text-left h-full overflow-hidden leading-3 hover:shadow-primary cursor-pointer border-b border-secondary"
            @click.stop.prevent="action || $emit('selected', item.id)">
            <div class="flex items-center border-b pb-1">
                <span v-if="item.insured" class="pt-1 font-bold text-secondary">{{ item.insured }}</span>
                <span>#{{ item.code }}</span>
                <q-badge v-if="item.parent_code" class="line-clamp-1 text-xxs">#{{ item.parent_code }}</q-badge>
            </div>
            <div class="flex flex-nowrap items-center justify-between w-full text-primary font-bold">
                <span class="pr-1">{{ item.event_state }}</span>
                <q-badge :style="{ background: item.color }"
                    class="flex justify-center text-center font-bold text-xxs mb-1">
                    {{ item.event_category }}
                </q-badge>
            </div>
            <span class="border-t pt-1 min-h-[17px]">{{ item.provider_description }}</span>
            <span class="border-t pt-1 min-h-[17px]">{{ item.doctor_description }}</span>

            <div class="subtitle text-xxs px-2 py-0 text-center">Procedimientos</div>
            <div class="flex flex-nowrap gap-1 text-xs" v-for="(r, index) in item.mprocedure" :key="r.id">
                <div class="w-full flex border card shadow-none px-3 py-1 line-clamp-1">
                    <div class="text-xxs uppercase bg-[#f3f1f1] px-1 mr-1">{{ r.code }}</div>
                    <div class="text-xxs uppercase pr-1">{{ r.description }}</div>
                </div>
            </div>

            <div v-if="item.VOB" class="absolute right-1 top-1 text-primary"><q-icon
                    name="fa-duotone fa-solid fa-check-to-slot"></q-icon>
                <q-tooltip class="bg-primary text-white">
                    VOB
                </q-tooltip>
            </div>
            <div v-if="item.medical_guide" class="absolute right-1 top-6 text-primary"><q-icon
                    name="fa-duotone fa-solid fa-book-sparkles"></q-icon>
                <q-tooltip class="bg-primary text-white">
                    Guía médica
                </q-tooltip>
            </div>
            <div class="grid grid-cols-2 gap-1">
                <q-btn flat class="button bg-default text-primary rounded-md w-full" label="consultar" no-caps size="xs"
                    @click.stop="$router.push(`coordinaciones/consultar/${item.id}`)" />
                <q-btn flat class="button bg-default text-primary rounded-md w-full" label="itinerario" no-caps
                    size="xs" @click.stop="$emit('openItinerary', item)" />
            </div>
            <div class="grid grid-cols-2 gap-1">
                <span v-if="item.user_description" class="border-t pt-1 text-xxs">{{ item.user_description }}</span>
                <span v-if="item.request_date_format" class="border-t pt-1 text-xxs text-right">{{ item.request_date_format }}</span>
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

async function onSendPoll() {
    try {
        await $api.post(`comunication/poll`, props.item)
    } catch (error) {
        console.log(error);
    }
}

</script>