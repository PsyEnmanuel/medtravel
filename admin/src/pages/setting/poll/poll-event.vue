<template>
    <div class="grid lg:grid-cols-2 gap-4">
        <div v-for="(stat, key) in state.stats" :key="key" class="card mb-2">
            <ChartPoll :key="`poll-${stat.description}`" :data="stat.answers" :name="`poll-${stat.description}`"
                :title="stat.description" :subtitle="``" />
        </div>
    </div>
</template>

<script setup>
import { inject, onMounted, reactive, ref, watch } from "vue"
import { useUpdateStore } from "src/stores/update";
import ChartPoll from "src/components/chart/ChartPoll.vue";
const tableRef = ref()
const props = defineProps({ id: Number })
const $api = inject('$api')
const state = reactive({
    average: {},
    stats: {},
})

async function getPollStats() {
    const { list, average } = await $api(`poll/stats/event_id/${props.id}`);
    console.log(state.stats);
    state.stats = list
    state.average = average
}

onMounted(() => {
    getPollStats();
})

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_poll, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>