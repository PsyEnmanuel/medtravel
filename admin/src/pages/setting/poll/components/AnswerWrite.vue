<template>
    <div v-if="!state.loading" :style="style" class="pb-32">
        <div class="flex justify-between items-start flex-nowrap gap-2 py-2">
            <div class="mb-2">
                <p class="text-2xl text-info">Editar Pregunta</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <q-form ref="writeForm" @submit="onSubmit" @reset="onReset">
            <div class="mt-2">
                <q-input class="mb-2" dense outlined v-model="state.item.description" :label="$t('question')"
                    hide-bottom-space :rules="[requiredInput]" type="textarea" :rows="4"></q-input>
                <CategorySelect :model-value="state.item.poll_type" refKey="poll_type"
                    @setCategory="state.item.$poll_type_id = $event" @clearCategory="state.item.$poll_type_id = null" />
                <div class="flex flex-nowrap gap-2 items-start mt-2">
                    <q-btn flat
                        class="button-press w-full bg-default text-primary text-sm font-bold tracking-normal mb-2"
                        type="submit">
                        GUARDAR CAMBIOS
                    </q-btn>
                    <q-btn class="button-icon bg-primary text-white py-0" icon="fa-solid fa-xmark" rounded
                        @click="onRemoveQuestion" size="sm"><q-tooltip class="bg-default text-black"
                            size="xs">Remover</q-tooltip></q-btn>
                </div>
            </div>
        </q-form>
        <div v-for="(item, index) in state.items" :key="item.id">
            <div class="flex flex-nowrap gap-2 items-start mb-2 p-1">
                <div class="w-[20px]">
                    <div class="card px-1 w-full">
                        {{ index + 1 }}
                    </div>
                </div>
                <div class="w-full text-xs">
                    <q-input class="w-full" dense outlined v-model="item.description" :label="$t('description')"
                        hide-bottom-space></q-input>
                </div>
                <div class="flex justify-end flex-nowrap h-auto">
                    <q-btn class="bg-default text-primary mr-2" text-color="font" size="xs" flat icon="sym_o_edit_note"
                        @click="onEdit(item)" />
                    <q-btn class="bg-default text-primary" text-color="font" size="xs" flat icon="sym_o_remove"
                        @click="onDelete(item)" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { useUpdateStore } from "src/stores/update";
import { requiredInput } from 'src/helpers/validation';
import { cloneObj } from 'src/helpers';
import CategorySelect from 'src/components/select/CategorySelect.vue';
const $q = useQuasar()
const $api = inject('$api');
const updateStore = useUpdateStore()
const writeForm = ref()
const props = defineProps({ id: Number, width: String, isDrawer: Boolean })
const initialItem = () => ({
    description: null,
})

const state = reactive({
    loading: true,
    items: [],
    item: initialItem(),
    total: 0,
    selected: {},
    search: '',
})

watch(() => updateStore.t_poll, () => {
    onInit()
})

async function onInit() {
    try {
        state.item = await $api.get(`poll-question/${props.id}`)
        const res = await $api.get('poll-answer', {
            params: {
                order: {
                    description: 'ASC',
                },
                where: {
                    poll_question_id: props.id,
                    c_status: 4,
                },
            }
        })
        console.log(res);
        state.items = res.items;
        state.total = res.total;
        state.loading = false
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
        const response = await $api.post('poll-question', state.item);
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
        const response = await $api.delete(`poll-answer/${item.id}`, item);
        onInit()
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Respuesta removida'
            })
        }
    } catch (error) {
        console.log(error)
    }
}

async function onEdit(item) {
    try {
        const response = await $api.put(`poll-answer/${item.id}`, item);
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Respuesta editada'
            })
        }
    } catch (error) {
        console.log(error)
    }
}

async function onRemoveQuestion() {
    try {
        await $api.delete(`poll-question/${props.id}`);
    } catch (error) {
        console.log(error);
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