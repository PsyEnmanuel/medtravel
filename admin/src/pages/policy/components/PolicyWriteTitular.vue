<template>
    <div :style="style">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar Titular</p>
                <b class="font-bold text-brand">{{ state.item.insured_description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Titular</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">


            <div class="flex flex-col gap-1">

                <InsuredSelect label="Elegir Titular*" @setInsured="setInsured($event, row)"
                    @clearInsured="clearInsured(row)" :model-value="state.item.insured_description" add
                    requiredSelect />

                <q-input dense outlined v-model="state.item.insured_code" :label="$t('insured_code')"></q-input>

            </div>

            <div v-if="isDrawer" class="fixed bottom-0 right-[10px] py-2 bg-white w-full" :style="style">
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                    label="Guardar cambios" type="submit" />
                <q-btn v-else class="button-press w-full text-lg rounded-md bg-primary text-white" flat label="agregar"
                    type="submit" />
            </div>
            <div v-else class="mt-2">
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                    label="Guardar cambios" type="submit" />
                <q-btn v-else class="button-press w-full text-lg rounded-md bg-primary text-white" flat label="agregar"
                    type="submit" />
            </div>

        </q-form>
    </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';

import InsuredSelect from 'src/components/select/InsuredSelect.vue';

const $api = inject('$api');
const $cats = inject('$cats');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean, policy: Object })

const initialItem = () => ({
    policy_id: props.id,
    $relationship_id: 157,
    $insured_type_id: 165
})

const state = reactive({
    item: initialItem(),
    local: 'WriteInsurance',
    categories: [],
    plan: null,
    plan_type: null
})

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

async function setInsured(id) {
    try {

        const insured = await $api.get(`insured/${id}`)

        state.item.insured_id = insured.id;
        state.item.insured_description = insured.fullname;
        state.item.titular_id = insured.id;
        state.item.titular_description = insured.fullname;

    } catch (error) {
        console.log(error);
    }
}

function clearInsured() {
    try {
        state.item.insured_id = null;
        state.item.insured_description = null;
        state.item.titular_id = null;
        state.item.titular_description = null;
    } catch (error) {
        console.log(error);
    }
}

async function onSubmit() {

    if (props.isEdit) {
        const response = await $api.put(`policy/insured/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Póliza Editada'
            })
        }
    } else {
        const response = await $api.post('policy/insured', {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Póliza Agregada'
            })
            onReset()
        }
    }
}

async function onInit() {
    if (props.isEdit) {
        state.item = await $api.get(`policy/insured/${props.id}`)
    }
}

const style = computed(() => {
    return {
        width: props.width,
        padding: props.isDrawer && '6px 8px'
    }
})

onMounted(() => {
    onInit()
})
</script>