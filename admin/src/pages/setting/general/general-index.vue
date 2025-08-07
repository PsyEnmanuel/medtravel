<template>
    <div>
        <q-form ref="writeForm" @submit="onSubmit" @reset="onReset">
            <div class="grid md:grid-cols-2 grid-cols-1 gap-2">
                <div class="flex flex-col">
                    <q-option-group class="mb-2 flex" size="xs" unelevated spread v-model="state.item.$ident_type_id"
                        toggle-color="secondary" toggle-text-color="text-font" :options="$cats.ident_type" />
                    <q-input v-if="state.item.$ident_type_id !== 147" ref="mainInput" class="mb-2" dense outlined
                        v-model="state.item.ident_no" :label="$t('ident_no')"></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.description" :label="$t('description')"
                        :rules="[requiredInput]" hide-bottom-space></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.domain" :label="$t('domain')"
                        :rules="[requiredInput]" hide-bottom-space></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.motto" :label="$t('motto')"
                        type="textarea"></q-input>
                </div>
                <div class="flex flex-col">
                    <div class="bg-default p-1 rounded-md text-center font-bold mb-2">Contacto</div>
                    <q-input class="mb-2" dense outlined v-model="state.item.email" :label="$t('email')"
                        :rules="[requiredInput]" hide-bottom-space></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.phone" :label="$t('phone')"></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.cel" :label="$t('Whatsapp')"></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.address" :label="$t('address')"></q-input>
                </div>
            </div>
            <div class="mb-2">
                <div class="subtitle mb-2 text-center">Redes Sociales</div>
                <q-input class="mb-2" dense outlined v-model="state.item.instagram" label="Instagram"></q-input>
                <q-input class="mb-2" dense outlined v-model="state.item.facebook" label="facebook"></q-input>
                <q-input class="mb-2" dense outlined v-model="state.item.twitter" label="twitter"></q-input>
            </div>
            <q-btn class="button-press w-full text-lg rounded-md bg-primary text-white" flat label="Guardar cambios" type="submit" />
        </q-form>
    </div>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { inject, onMounted, reactive } from 'vue';

const $me = inject('$me');
const $api = inject('$api');
const $cats = inject('$cats');

const $q = useQuasar()

const state = reactive({
    item: {
        printer: {
            invoice: '',
            label: '',
            main: 'L3250-Series',
        },
    }
})

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

async function onSubmit() {
    const response = await $api.put(`account/${state.item.id}`, {
        ...state.item,
    });
    if (response) {
        $q.notify({
            type: 'success',
            message: 'Ajustes Editados'
        })
    }
}

async function onInit() {
    state.item = await $api.get(`account/${$me.account_id}`)
}

onMounted(() => {
    onInit()
})

</script>