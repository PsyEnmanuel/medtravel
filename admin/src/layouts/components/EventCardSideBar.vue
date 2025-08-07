<template>
    <div class="flex flex-col border-b border-default"
        :style="{ borderLeft: `4px solid ${event?.color}` || '#E8E4FC' }">
        <div class="flex flex-nowrap justify-between items-center w-full cursor-pointer hover:bg-gray-100 px-2 py-1"
            @click="$emit('select', event.patient_id)">
            <div class="flex flex-col leading-4 w-full">
                <div class="text-xs font-semibold line-clamp-1 uppercase">{{ event.patient_description }}</div>
                <div class="grid grid-cols-3 text-xxs gap-1">
                    <div class="flex flex-nowrap gap-1">
                        <span>
                            <q-icon v-if="event.sex === 'MALE'"><i class="fa-solid fa-venus"></i></q-icon>
                            <q-icon v-if="event.sex === 'FEMALE'"><i class="fa-solid fa-mars"></i></q-icon>
                        </span>
                        <span>{{ event.age }}</span>
                    </div>
                    <span class="text-xxs">
                        {{ event.insurance_description }}
                    </span>
                    <span class="text-xxs">
                        {{ event.start_time || '' }}
                    </span>
                </div>
            </div>
            <q-icon name="fa-duotone fa-chevron-right"></q-icon>
        </div>
    </div>
</template>

<script setup>
defineProps({ event: Object })
</script>