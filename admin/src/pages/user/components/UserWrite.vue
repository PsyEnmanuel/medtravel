<template>
    <div :style="style">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar Usuario</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Usuario</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form ref="writeForm" @submit="onSubmit" @reset="onReset">

            <q-option-group v-if="$me.unixroles & 7" class="mb-2 flex" size="sm" unelevated spread
                v-model="state.item.roles" toggle-color="primary" :options="state.roles" type="checkbox" />
            <q-input class="mb-2" dense outlined v-model="state.item.description" :label="$t('fullname') + '*'"
                :rules="[requiredInput]" hide-bottom-space></q-input>
            <q-input class="mb-2" dense outlined v-model="state.item.email" :label="$t('email') + '*'"
                :rules="[requiredInput]" hide-bottom-space></q-input>
            <q-input class="mb-2" dense outlined v-model="state.item.username" :label="$t('username') + '*'"
                :rules="[requiredInput]" hide-bottom-space></q-input>
            <q-input class="mb-2" dense outlined v-model="state.item.phone" :label="$t('phone')"></q-input>
            <q-input class="mb-2" dense outlined v-model="state.item.ident_no" :label="$t('ident_no')"></q-input>
            <template v-if="state.item.unixroles & 4">
                <q-input class="mb-2" dense outlined v-model="state.item.exequatur" :label="$t('exequatur')"></q-input>
            </template>
            <q-option-group class="mb-2 flex" size="sm" unelevated spread v-model="state.item.$sex_id"
                toggle-color="primary" :options="$cats.sex" />
            <q-checkbox v-if="$me.unixroles & 7" class="border border-dashed mt-1 px-4" v-model="state.item.high_profile" :true-value="1"
                :false-value="0">Acceso a asegurados de alto perfil</q-checkbox>
            <div v-if="isDrawer" class="fixed bottom-0 right-0 py-2 bg-white" :style="style">
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg bg-primary text-white" flat
                    label="Guardar cambios" type="submit" />
                <q-btn v-else class="button-press w-full text-lg bg-primary text-white" flat label="agregar"
                    type="submit" />
            </div>
            <div v-else>
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg" flat label="Guardar cambios"
                    type="submit" />
                <q-btn v-else class="button-press w-full text-lg" flat label="agregar" type="submit" />
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
    roles: [],
    calendar: 0
})

const state = reactive({
    item: initialItem(),
    local: 'WriteUser',
    roles: []
})

async function onInit() {
    state.roles = await getRoles()
    console.log(state.roles);
    if (props.isEdit) {
        state.item = await $api.get(`user/${props.id}`)
    } else {
        if ($local.get(state.local)) {
            state.item = $local.get(state.local)
        }
    }
}

async function getRoles() {
    return await $api.get(`role`, {
        params: {
            where: {
                c_status: 4,
                'bi:value': 508
            },
            returnItems: true
        }
    })
}

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

async function onSubmit() {
    if (state.item.insurance_id) {
        const index = state.insurances.findIndex(i => i.id === state.item.insurance_id)
        state.item.insurance = state.insurances[index].description
    }

    if (props.isEdit) {
        const response = await $api.put(`user/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Usuario Editado'
            })
        }
    } else {
        const response = await $api.post('user', {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Usuario Agregado'
            })
            onReset()
        }
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