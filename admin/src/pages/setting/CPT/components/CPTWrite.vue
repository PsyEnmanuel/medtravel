<template>
    <div :style="style">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar CPT</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">CPT</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <q-input class="my-2" dense outlined v-model="state.item.code" :label="$t('code') + '*'"
                :rules="[requiredInput]" hide-bottom-space></q-input>
            <q-input class="my-2" dense outlined v-model="state.item.description" :label="$t('description') + '*'"
                :rules="[requiredInput]" hide-bottom-space></q-input>

            <div v-if="isDrawer" class="fixed bottom-0 right-[10px] py-2 bg-white" :style="style">
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg bg-primary text-white" flat
                    label="Guardar cambios" type="submit" />
                <q-btn v-else class="button-press w-full text-lg bg-primary text-white" flat label="agregar"
                    type="submit" />
            </div>
        </q-form>
    </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { requiredInput } from 'src/helpers/validation';
import { useQuasar } from 'quasar';
const $api = inject('$api');
const $cats = inject('$cats');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })

const initialItem = () => ({
})

const state = reactive({
    item: initialItem(),
    local: 'WriteCPT',
})

const style = computed(() => {
    return {
        width: props.width,
        padding: props.isDrawer && '6px 8px'
    }
})

watch(() => state.item, (val) => {
    if (!props.isEdit) {
        $local.set(state.local, val)
    }
}, { deep: true })

async function onInit() {
    if (props.isEdit) {
        state.item = await $api.get(`CPT/${props.id}`)
    } else {
        if ($local.get(state.local)) {
            // state.item = $local.get(state.local)
        }
    }
}

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

async function onSubmit() {
    if (props.isEdit) {
        const response = await $api.put(`CPT/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'CPT Editado'
            })
        }
    } else {
        const response = await $api.post('CPT', {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'CPT Agregado'
            })
            onReset()
        }
    }
}

onMounted(() => {
    onInit()
})
</script>