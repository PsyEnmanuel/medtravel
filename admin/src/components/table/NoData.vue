<template>
    <div class="flex w-full items-center justify-center text-teal-800 mb-4">
        <q-img class="mr-2" src="~assets/empty.svg" alt="" style="height: 40px; max-width: 40px" object-contain />
        <div class="flex mt-4">
            <span class="text-sm">
                {{ message }}
            </span>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    message: String, filter: String, icon: String
})
</script>