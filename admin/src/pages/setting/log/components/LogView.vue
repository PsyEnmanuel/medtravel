<template>
    <div v-if="!state.loading" :style="style">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Consultar historial</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Diagnósis</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <div class="flex flex-col gap-2">
            <div v-if="state.item.ref_key" class="flex flex-col gap-0.5 bg-gray-100 p-2 rounded-lg text-xs">
                <div class="flex gap-2">
                    <div class="font-bold">Módulo:</div>
                    <div>{{ $t(state.item.ref_key) }}</div>
                </div>
                <div class="flex gap-2">
                    <div class="font-bold">ID:</div>
                    <div>{{ $t(state.item.ref_id) }}</div>
                </div>
                <div class="flex gap-2">
                    <div class="font-bold">ACCIONES:</div>
                    <div>{{ $t(state.item.action) }}</div>
                </div>
                <div class="flex gap-2">
                    <div class="font-bold">CREACION:</div>
                    <div>{{ $t(state.item.created) }}</div>
                </div>
            </div>
            <ul class="list-inside text-xs grid grid-cols-2 gap-1">
                <li v-for="(s, key) in state.item.data" :key="s">
                    {{ key }}: {{ s }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
const $api = inject('$api');
const $local = inject('$local')
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })

const initialItem = () => ({
    sub: [],
})

const state = reactive({
    item: initialItem(),
    loading: true,
    local: 'WriteLog',
    sub_log: null,
    roles: []
})

const style = computed(() => {
    return {
        width: props.width,
        padding: props.isDrawer && '6px 8px'
    }
})

async function onInit() {
    if (props.isEdit) {
        state.item = await $api.get(`log/${props.id}`)
    } else {
        if ($local.get(state.local)) {
            // state.item = $local.get(state.local)
        }
    }
    state.loading = false;
}

onMounted(() => {
    onInit()
})
</script>