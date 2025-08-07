<template>
    <div :style="style" class="pb-32">
        <div class="flex justify-between items-start gap-2 py-2">
            <div class="mb-2">
                <p class="text-2xl text-info">Listado Categoría</p>
                <b class="font-bold text-brand">{{ state.category.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <q-form ref="writeForm" @submit="onSubmit" @reset="onReset">
            <div class="mt-2">
                <q-input class="mb-2" dense outlined v-model="state.item.description" :label="$t('description')"
                    hide-bottom-space :rules="[requiredInput]"></q-input>
                <q-btn flat class="button-press w-full bg-default text-primary text-sm font-bold tracking-normal mb-2"
                    type="submit">
                    CREAR CATEGORÍA
                </q-btn>
            </div>
        </q-form>
        <q-input class="mb-2" dense outlined v-model="state.search" :label="$t('search')" hide-bottom-space><template
                #append><q-icon name="search" /></template></q-input>
        <div v-for="item in state.items" :key="item.id">
            <q-list :key="item.id" class="mb-2" separator>
                <q-item class="p-0" dense center>
                    <q-item-section class="relative">
                        <q-input dense outlined v-model="item.description" :label="$t('description')"
                            hide-bottom-space></q-input>
                        <q-input v-if="state.category.color" dense outlined v-model="item.color" :label="$t('color')"
                            hide-bottom-space></q-input>
                        <q-item-label class="absolute top-1 right-2" caption>{{ item.id }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <div class="flex justify-end">
                            <q-btn class="bg-default text-primary mr-2" text-color="font" size="12px" flat round
                                icon="sym_o_edit_note" @click="onEdit(item)" />
                            <q-btn class="bg-default text-primary" text-color="font" size="12px" flat round
                                icon="sym_o_remove" @click="onDelete(item)" />
                        </div>
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
    </div>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { useUpdateStore } from "src/stores/update";
import { requiredInput } from 'src/helpers/validation';
import { cloneObj } from 'src/helpers';
const $q = useQuasar()
const $api = inject('$api');
const updateStore = useUpdateStore()
const writeForm = ref()
const props = defineProps({ id: Number, width: String, isDrawer: Boolean })
const initialItem = () => ({
    description: null,
    parent_id: props.id
})

const state = reactive({
    category: {},
    items: [],
    staticItems: [],
    item: initialItem(),
    total: 0,
    selected: {},
    search: '',
    query: {
        order: {
            description: 'ASC'
        },
        where: {
            c_status: 4,
            parent_id: props.id
        },
    },
})

watch(() => updateStore.t_category, () => {
    onInit()
})

watch(
    () => state.search,
    (val) => {
        if (!val) {
            state.items = cloneObj(state.staticItems);
            return;
        }
        state.items = state.staticItems.filter(i => i.description.includes(val))
    }
);

async function onInit() {
    try {
        state.category = await $api.get(`category/${props.id}`)
        const res = await $api.get('category', { params: { ...state.query } })
        state.staticItems = cloneObj(res.items)
        state.items = res.items;
        state.total = res.total;
    } catch (error) {
        console.log(error)
    }
}

function onReset() {
    state.item = initialItem()
    writeForm.value.resetValidation()
}

async function onSubmit() {
    try {
        const response = await $api.post('category', state.item);
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Categoría Agregada'
            })
        }
        onInit()
        onReset()
    } catch (error) {
        console.log(error)
    }
}

async function onDelete(item) {
    try {
        const response = await $api.delete(`category/${item.id}`, item);
        onInit()
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Categoría removida'
            })
        }
    } catch (error) {
        console.log(error)
    }
}

async function onEdit(item) {
    try {
        const response = await $api.put(`category/${item.id}`, item);
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Categoría editada'
            })
        }
    } catch (error) {
        console.log(error)
    }
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