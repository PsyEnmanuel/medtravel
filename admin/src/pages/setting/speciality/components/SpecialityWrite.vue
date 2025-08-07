<template>
    <div :style="style">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar Especialidad</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Diagnósis</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <q-input class="my-2" dense outlined v-model="state.item.description" :label="$t('speciality') + '*'"
                :rules="[requiredInput]" hide-bottom-space></q-input>
            <q-input class="mb-2" dense outlined v-model="state.sub_speciality" label="Agregar sub especialidad">
                <template v-slot:append>
                    <q-btn type="button" class="button w-full bg-default text-font" size="sm" flat label="agregar"
                        @click="addSub" />
                </template>
            </q-input>
            <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">Listado de sub especialidades</div>
            <div v-for="row in state.item.sub" :key="row">
                <div class="flex flex-nowrap justify-between items-center gap-2 card p-1 mb-2">
                    <q-input class="w-full border-none" dense outlined v-model="row.description"
                        :label="$t('sub_speciality')" :rules="[requiredInput]" hide-bottom-space></q-input>
                    <q-btn class="button-icon bg-primary text-white rounded-full mx-2" size="xs" flat
                        icon="fa-solid fa-xmark" @click="removeSub(row)" />
                </div>
            </div>
            <div v-if="isDrawer" class="fixed bottom-0 right-[10px] py-2 bg-white" :style="style">
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg bg-primary text-white" flat label="Guardar cambios"
                    type="submit" />
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
    sub: [],
})

const state = reactive({
    item: initialItem(),
    local: 'WriteSpeciality',
    sub_speciality: null,
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
        state.item = await $api.get(`speciality/${props.id}`)
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

function addSub() {
    console.log(11, state.sub_speciality);
    if (!state.sub_speciality) {
        $q.notify({
            type: 'warning',
            message: 'Campo especialidad no puede estar vacio'
        })
        return;
    }
    const index = state.item.sub.findIndex(i => i.description === state.sub_speciality)
    if (index === -1) {
        state.item.sub.push({ description: state.sub_speciality })
        state.sub_speciality = null
        return;
    }
    $q.notify({
        type: 'warning',
        message: 'Especialidad ya esta agregado'
    })
}

function removeSub(plan) {
    const index = state.item.sub.findIndex(i => i.description === plan.description)
    if (index !== -1) {
        state.item.sub.splice(index, 1)
    }
}

async function onSubmit() {
    if (state.item.insurance_id) {
        const index = state.insurances.findIndex(i => i.id === state.item.insurance_id)
        state.item.insurance = state.insurances[index].description
    }
    if (props.isEdit) {
        const response = await $api.put(`speciality/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Especialidad Editado'
            })
        }
    } else {
        const response = await $api.post('speciality', {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Especialidad Agregado'
            })
            onReset()
        }
    }
}

onMounted(() => {
    onInit()
})
</script>