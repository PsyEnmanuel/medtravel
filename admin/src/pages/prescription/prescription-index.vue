<template>
    <div v-if="!state.loading" class="flex md:flex-nowrap gap-2 break-all">
        <div class="w-full">
            <WritePrescription :insured="state.item" width="100%" />
        </div>
        <div class="flex flex-col w-full  md:max-w-[250px] min-w-[250px]">
            <ListPrescription :id="state.item.id" />
        </div>
    </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import WritePrescription from 'src/pages/prescription/components/WritePrescription.vue';
import ListPrescription from 'src/pages/prescription/components/ListPrescription.vue';
import { useUpdateStore } from "src/stores/update";
import { useQuasar } from 'quasar';
const $q = useQuasar()
const $api = inject('$api')
const $local = inject('$local')
const $me = inject('$me')
const props = defineProps({
    insuredId: Number
})

const state = reactive({
    loading: true,
    timeout: null,
    item: {},
    dialogWrite: false,
    dialogPassword: false,
})

async function onInit() {
    state.item = await $api.get(`insured/${props.insuredId}`)
    state.loading = false
}

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_insured, (data) => {
    if (data.id === state.item.id) {
        onInit()
    }
}, { deep: true })

onMounted(() => {
    onInit()
})

</script>