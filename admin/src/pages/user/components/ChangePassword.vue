<template>
    <div :style="style">
        <div class="mb-2">
            <p class="text-2xl text-info">Cambiar contraseña, <b class="font-bold text-brand">{{ state.item.description
                    }}</b></p>
            <p>Los campos requeridos tienen un (*)</p>
        </div>
        <q-form ref="writeForm" @submit="onSubmit" @reset="onReset">
            <q-input class="mb-2" dense outlined v-model="state.item.password_token" :label="$t('password_token') + '*'"
                :rules="[requiredInput]" hide-bottom-space></q-input>
            <div class="subtitle mt-2">Pasos a seguir para cambiar la contraseña:</div>
            <ul>
                <li>Esta contraseña es temporal</li>
                <li>Al iniciar sesión se debe ingresar la contraseña temporal</li>
                <li>Luego le redireccionara a una nueva vista para cambiar la contraseña por una mas segura</li>
                <li>Le pedira que escriba la nueva contraseña seguro</li>
                <li>Al acceder nuevamente al sistema necesitara acceder con la contraseña segura</li>
            </ul>
            <div class="flex justify-end">
                <q-btn class="button-press" flat label="cambiar contraseña" type="submit" />
            </div>
        </q-form>
    </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { requiredInput } from 'src/helpers/validation';
import { useQuasar } from 'quasar';
const $api = inject('$api');
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, width: String, isDrawer: Boolean })

const initialItem = () => ({
    roles: []
})

const state = reactive({
    item: initialItem(),
})

async function onInit() {
    state.item = await $api.get(`user/${props.id}`)
}

function onReset() {
    state.item = initialItem()
    writeForm.value.resetValidation()
}

async function onSubmit() {
    const response = await $api.put(`user/new-password-code/${props.id}`, state.item);
    if (response) {
        $q.notify({
            type: 'success',
            message: 'Contraseña Editada'
        })
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