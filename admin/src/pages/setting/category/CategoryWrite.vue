<template>
    <div :style="style" class="pb-32">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar Categoría</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Categoría</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <q-input class="mb-2" dense outlined v-model="state.item.description" :label="$t('description')"
                :rules="[requiredInput]" hide-bottom-space></q-input>
            <q-input v-if="$me.unixroles & 1" class="mb-2" dense outlined v-model="state.item.ref" :label="$t('reference')" :rules="[requiredInput]"
                hide-bottom-space></q-input>
            <q-input v-if="$me.unixroles & 1" dense outlined v-model="state.item.color" :label="$t('color')" hide-bottom-space></q-input>
            <q-checkbox v-if="$me.unixroles & 1" size="xs" v-model="state.item.root" label="Root" :true-value="1"
                :false-value="0" />
            <div class="fixed bottom-0 right-0 py-2 bg-white" :style="style">
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md bg-btn-drawer-green" flat
                    label="Guardar cambios" type="submit" />
                <q-btn v-else class="button-press w-full text-lg rounded-md bg-btn-drawer-sky" flat label="agregar"
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
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })

const initialItem = () => ({
    filterable: 0,
    root: 0
})

const state = reactive({
    item: initialItem(),
    local: 'CategoryWrite',
    categories: [],
})

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

async function onSubmit() {
    if (state.item.parent_id) {
        const [res] = state.categories.filter(i => i.id === state.item.parent_id)
        state.item.parent_description = res.description;
    }
    if (props.isEdit) {
        const response = await $api.put(`Category/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Categoría Editada'
            })
        }
    } else {
        const response = await $api.post('category', {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Categoría Agregada'
            })
            onReset()
        }
    }
}

async function onInit() {
    if (props.isEdit) {
        state.item = await $api.get(`category/${props.id}`)
    } else {
        if ($local.get(state.local)) {
            // state.item = $local.get(state.local)
        }
    }
    let { items } = await $api.get('category', {
        params: {
            where: {
                level: 0,
                c_status: [4],
            }
        }
    })
    state.categories = items
}

const style = computed(() => {
    return {
        width: props.width,
        'padding-right': props.isDrawer && '8px',
        'padding-left': props.isDrawer && '8px'
    }
})

onMounted(() => {
    onInit()
})
</script>