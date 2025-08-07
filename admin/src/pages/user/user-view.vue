<template>
    <q-page class="px-1.5 py-2 lg:px-5 lg:py-6">
        <UserRead :id="id" />
    </q-page>
</template>

<script setup>
import UserRead from './components/UserRead.vue';

const props = defineProps({ id: Number })
</script>