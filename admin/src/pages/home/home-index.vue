<template>
    <q-page class="px-1.5 py-2 lg:px-5 lg:py-6">
        <div class="w-full">
            <HomeCEO v-if="$me.unixroles & 2" />
            <!-- <EventTableExecutive v-else-if="$me.unixroles & 16" /> -->
            <EventTable v-else />
        </div>
    </q-page>
</template>

<script setup>
import { inject } from 'vue';
import EventTable from '../event/components/EventTable.vue';
import HomeCEO from './components/HomeCEO.vue';
const $me = inject("$me")
defineOptions({
    name: 'IndexPage'
});
</script>