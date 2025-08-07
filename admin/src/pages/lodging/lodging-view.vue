<template>
    <q-page class="px-1.5 py-2 lg:px-5 lg:py-6">
        <LodgingRead :id="id" />
    </q-page>
</template>

<script setup>
import LodgingRead from './components/LodgingRead.vue';

const props = defineProps({ id: Number })
</script>