<template>
    <div v-if="isEdit" class="w-full text-xxs bg-gray-100 px-4 flex justify-between">
        <div>{{ item.created_by }}</div>
        <div>C: {{ item.created_format }}</div>
    </div>
    <div v-if="isEdit && item.modified_by" class="w-full text-xxs bg-pink-100 px-4 flex justify-between">
        <div>{{ item.modified_by }}</div>
        <div>M: {{ item.modified_format }}</div>
    </div>
</template>

<script setup>
const props = defineProps({ item: Object, isEdit: Boolean })
</script>