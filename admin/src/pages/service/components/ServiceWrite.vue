<template>
    <div v-if="!state.loading" :style="style" class="relative">
        <div class="flex flex-nowrap justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar Servicio</p>
                <b class="font-bold text-brand line-clamp-1">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Servicio</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <div class="pb-20 pt-2">
            <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
                <div>


                    <q-input class="mb-2" dense outlined v-model="state.item.description" :label="$t('description') + '*'"
                        :rules="[requiredInput]" hide-bottom-space type="textarea" :rows="3"></q-input>

                    <q-input class="mb-2" input-class="text-right" dense outlined v-model="state.item.price"
                        :label="$t('price')" v-maska:[optionsMoney] data-maska="0.99" :data-maska-tokens="maskaMoney">
                    </q-input>

                    <q-input class="mb-2" input-class="text-right" dense outlined v-model="state.item.coverage"
                        :label="$t('coverage')" hide-bottom-space v-maska:[optionsMoney] data-maska="0.99"
                        :data-maska-tokens="maskaMoney"></q-input>

                    <q-input class="mb-2" dense outlined v-model="state.item.detail" :label="$t('detail')"
                        type="textarea"></q-input>
                </div>
                <div v-if="isDrawer" class="fixed bottom-0 right-0 py-2 bg-white" :style="style">
                    <RowStatus :item="state.item" :isEdit="isEdit" />
                    <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                        label="Guardar cambios" type="submit" />
                    <q-btn v-else class="button-press w-full text-lg rounded-md bg-primary text-white" flat label="agregar"
                        type="submit" />
                </div>
                <div v-else>
                    <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md" flat label="Guardar cambios"
                        type="submit" />
                    <q-btn v-else class="button-press w-full text-lg rounded-md" flat label="agregar" type="submit" />
                </div>
            </q-form>
        </div>
    </div>
</template>

<script setup>
import CategoryDialog from 'src/pages/setting/category/CategoryDialog.vue';
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { maskaMoney, optionsMoney, maskaNumberToken, maskaNumber } from 'src/helpers/mask'
import { requiredInput } from 'src/helpers/validation';
import { useQuasar } from 'quasar';
const $api = inject('$api');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const $cats = inject('$cats');
const props = defineProps({ id: Number, isEdit: Boolean, width: String, catalogue_category_id: Number, isDrawer: Boolean })
import { vMaska } from 'maska'
import { calculatePercentValue, cleanCurrency, getPercent, roundToPrecision } from "src/helpers";
const options = reactive({
    catalogue_category: $cats.value.catalogue_category.sort((a, b) => a.description.localeCompare(b.description)),
    binary: [
        {
            label: 'Si',
            value: 1,
        },
        {
            label: 'No',
            value: 1,
        },
    ]
})

const initialItem = () => ({
    inventory: 0,
    is_procedure: 1,
    $catalogue_category_id: 42,
    c_status: 4,
})

const state = reactive({
    loading: true,
    item: initialItem(),
    local: 'catalogue',
    categories: [],
})

watch(() => state.item, (val) => {
    if (!props.isEdit) {
        $local.set(state.local, val)
    }
}, { deep: true })


function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

async function onSubmit() {
    if (props.isEdit) {
        const response = await $api.put(`catalogue/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Catálogo Editada'
            })
        }
    } else {
        const response = await $api.post('catalogue', {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Catálogo Agregada'
            })
            onReset()
        }
    }
}

async function onInit() {
    state.loading = true;
    if (props.isEdit) {
        state.item = await $api.get(`catalogue/${props.id}`)
    } else {
        if ($local.get(state.local)) {
            // state.item = $local.get(state.local)
        }
    }
    state.loading = false;
}

const style = computed(() => {
    return {
        width: props.width,
        'padding-right': props.isDrawer && '8px',
        'padding-left': props.isDrawer && '8px'
    }
})


import { useFilter } from 'src/use/filter';
import RowStatus from 'src/components/RowStatus.vue';
const { filterFnCategory, filterFn } = useFilter(options)

onMounted(() => {
    onInit()
})
</script>