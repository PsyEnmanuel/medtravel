<template>
    <q-page class="px-1.5 py-2 lg:px-5 lg:py-6">
        <DoctorRead :id="id" />
    </q-page>
</template>

<script setup>
import DoctorRead from './components/DoctorRead.vue';

const props = defineProps({ id: Number })
</script>