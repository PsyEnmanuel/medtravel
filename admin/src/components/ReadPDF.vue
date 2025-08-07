<template>
    <div class="card no-shadow border overflow-hidden p-4" :style="style">
        <div class="flex justify-between items-end">
            <div class="flex flex-col">
                <span class="text-lg font-bold text-primary">{{ description }}</span>
            </div>
            <div class="flex">
                <q-btn class="button mr-3" flat label="Imprimir" icon="sym_o_print" @click="printPdf(item)" />
                <q-btn flat class="button mr-2" label="Descargar" icon="sym_o_download"
                    @click="downloadResource(item.url, item.description)"></q-btn>
                <q-btn flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
            </div>
        </div>
        <div class="card border my-4 p-4 rounded-xl overflow-hidden">
            <div v-if="!state.loading">
                <div v-for="page in state.numOfPages" :key="page">
                    <VuePdf :src="item.url" :page="page" />
                    <div class="mt-10 border border-gray-200"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import printJS from 'print-js';
import { downloadResource } from 'src/helpers';
import { VuePdf, createLoadingTask } from 'vue3-pdfjs';
import { onMounted, reactive, ref, computed } from 'vue';
const props = defineProps({ item: Object, width: String })

const state = reactive({
    loading: true,
    visible: true,
    item: {},
    pdfSrc: null,
    numOfPages: 0
})

function printPdf(row) {
    printJS({ printable: row.url, type: 'pdf', showModal: false });
}

onMounted(async () => {
    console.log(props.item);
    const loadingTask = createLoadingTask(props.item.url)
    loadingTask.promise.then((pdf) => {
        state.numOfPages = pdf.numPages
    })

    state.loading = false
})

const style = computed(() => {
    return {
        width: props.width
    }
})

</script>