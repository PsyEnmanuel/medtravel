<template>
    <div class="absolute w-full h-full bg-black z-30 opacity-30 flex justify-center items-center">
        <div class="text-8xl font-bold z-40 text-white transform -rotate-45">{{ props.text }}</div>
        <div class="text-8xl font-bold z-40 text-white transform -rotate-45">{{ props.text }}</div>
        <div class="text-8xl font-bold z-40 text-white transform -rotate-45">{{ props.text }}</div>
        <div class="text-8xl font-bold z-40 text-white transform -rotate-45">{{ props.text }}</div>
    </div>
</template>

<script setup>
const props = defineProps({ text: String })
</script>