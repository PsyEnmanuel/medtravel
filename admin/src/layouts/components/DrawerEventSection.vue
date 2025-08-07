<template>
  <div>
    <div class="border-b px-1 flex items-center justify-between bg-th">
      <div class="flex items-center">
        <span class="text-xs font-semibold uppercase min-w-[80px]">{{ title }}</span>
        <span class="text-xs font-bold ml-2 px-2 py-0.5 rounded shadow-xs" :style="{ backgroundColor: state.color }">
          {{ events.length }}
        </span>
      </div>

      <q-btn v-if="events.length" size=" sm" dense flat icon="keyboard_arrow_down"
        class="transition-transform border-none" :class="{ 'rotate-180': isOpen }" @click="isOpen = !isOpen" />
    </div>

    <q-slide-transition>
      <div v-if="events.length && isOpen">
        <EventCardSideBar v-for="(event, key) in events.slice(0, 2)" :key="key" :event="event"
          @select="$emit('select', event.patient_id)" />
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup>
import { ref } from "vue"
import EventCardSideBar from './EventCardSideBar.vue'
const props = defineProps(['title', 'state', 'events'])
defineEmits(['select'])

const isOpen = ref(props.state.value !== 'SCHEDULED')
</script>
