<template>
    <div v-if="!state.loading" :style="style" :class="isDrawer && 'pb-32'">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit">
                <p class="text-2xl text-info">Editar comentario</p>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar comentario</p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <div class="grid grid-cols-1 gap-2">
                <div class="bg-default p-1 rounded-md text-center font-bold mb-2">Administrativo</div>
                <q-input dense outlined v-model="state.item.text" :label="$t('comment') + '*'" :rules="[requiredInput]"
                    hide-bottom-space type="textarea"></q-input>
                <q-input v-if="props.isEdit" readonly dense outlined v-model="state.item.comment_state" :label="$t('comment_state') + '*'"
                    :rules="[requiredInput]" hide-bottom-space></q-input>
                <q-input v-if="props.isEdit" readonly dense outlined v-model="state.item.created_format" :label="$t('created') + '*'"
                    :rules="[requiredInput]" hide-bottom-space></q-input>
                <q-input v-if="props.isEdit" readonly dense outlined v-model="state.item.created_by" :label="$t('created_by') + '*'"
                    :rules="[requiredInput]" hide-bottom-space></q-input>
            </div>
            <div v-if="isDrawer" class="fixed bottom-0 lg:right-[10px] right-0 py-2 bg-white mt-10" :style="style">
                <div v-if="props.isEdit" class="flex flex-nowrap gap-2">
                    <q-btn v-if="$me.unixroles & 3" class="button-icon text-lg rounded-md bg-primary text-white" flat
                        icon="fa-solid fa-close" size="xs" @click="removeRow" />
                    <q-btn class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                        label="Guardar cambios" type="submit" />
                </div>
                <q-btn v-else class="button-press w-full text-lg rounded-md bg-primary text-white" flat label="agregar"
                    type="submit" />
            </div>
            <div class="mt-10" v-else>
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
import { requiredInput } from 'src/helpers/validation';
import { useQuasar } from 'quasar';
import { useFilter } from 'src/use/filter';

const $api = inject('$api');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })
const $emit = defineEmits(['close', 'submit'])
const $cats = inject('$cats');

const options = reactive({
    attention_type: $cats.value.attention_type,
    postnominal: $cats.value.postnominal,
    ident_type: $cats.value.ident_type.filter(i => {
        return [7, 8, 9].includes(i.id)
    }),
})

const initialItem = () => ({
    speciality: [{
        id: null,
        description: null,
        sub: [],
    }],
    provider: [{
        id: null,
        description: null,
    }]
})

const state = reactive({
    loading: true,
    item: initialItem(),
    local: 'CommentWrite',
})

async function removeRow() {
    try {
        const result = await $q.dialog({
            title: 'Confirmar',
            message: 'Deseas borrar este comentario?',
            cancel: true,
            persistent: true
        })
        result.onOk(async () => {
            const response = await $api.delete(`comment/${props.id}`);

            if (response) {
                $q.notify({
                    type: 'success',
                    message: 'Comentario Borrado'
                })
                $emit('close')
            }
        })
    } catch (error) {
        console.log(error);
    }
}

async function onInit() {
    if (props.isEdit) {
        state.item = await $api.get(`comment/${props.id}`)
    } else {
        if ($local.get(state.local)) {
            // state.item = $local.get(state.local)
        }
    }
    state.loading = false
}

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

async function onSubmit() {
    if (props.isEdit) {
        const response = await $api.put(`comment/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Comentario Editado'
            })
        }
    } else {
        const response = await $emit('submit', state.item.text);
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Comentario Agregado'
            })
            onReset()
        }
    }
}

const { filterFnCategory } = useFilter(options)

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