<template>
    <q-select ref="refLanguageSelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon
        use-input hide-selected fill-input input-debounce="0" emit-value map-options option-value="id"
        option-label="description" :model-value="languageModel" :label="label" :options="languageOptions"
        @input-value="languageModel = $event" @update:model-value="setLanguage" @filter="filterFnLanguage"
        @clear="clearLanguage">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none" v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex">
                            <span>{{ scope.opt.description }}</span>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !languageModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>

        <template v-slot:after>
            <q-btn v-if="selectedId" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-duotone fa-solid fa-magnifying-glass" @click="openDialogDetail">
                <q-tooltip class="bg-default text-black text-xs">Ver detalles</q-tooltip>
            </q-btn>
        </template>

    </q-select>

    <q-dialog v-model="state.dialogDetail">
        <q-card class="shadow pt-4 px-6 pb-4 flex-col w-[400px]">
            <div class="font-bold">{{ state.selected.description }}</div>
            <div>{{ state.selected.country }}</div>
            <div>{{ state.selected.city }}</div>
            <div>{{ state.selected.address }}</div>
            <div class="flex items-center gap-2">
                <q-icon name="fa-duotone fa-solid fa-globe-pointer"></q-icon>
                <a class="text-primary" :href="state.selected.webpage" target="_blank">Google Map</a>
            </div>
            <div class="flex items-center gap-2">
                <q-icon name="fa-duotone fa-solid fa-map-location-dot"></q-icon>
                <a class="text-primary" :href="state.selected.link_gps" target="_blank">Página Web</a>
            </div>
        </q-card>
    </q-dialog>

</template>

<script setup>
import { useLanguage } from 'src/use/language';
import { inject, onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setLanguage', 'clearLanguage'])
const props = defineProps({
    modelValue: String, id: Number, label: {
        type: String,
        default: 'Elegir Proveedor',
    }, countryId: Number, stateId: Number
})
const $api = inject("$api")

const selectedId = ref(props.id)

const state = reactive({
    countryId: props.countryId,
    stateId: props.stateId,
    dialogDetail: false,
    selected: {}
})

watch(() => props.countryId, (val) => {
    state.countryId = val
})

watch(() => props.stateId, (val) => {
    console.log(val);
    state.stateId = val
})

watch(() => props.modelValue, (val) => {
    languageModel.value = val
})

async function openDialogDetail() {
    state.selected = await $api.get(`language/${selectedId.value}`)
    console.log(state.selected);
    state.dialogDetail = true;
}

function setLanguage(id) {
    if (!id) {
        refLanguageSelect.value.focus();
        setTimeout(() => {
            refLanguageSelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    languageModel.value = languageOptions.value.reduce((acc, curr) => {
        if (curr.id === id) {
            acc = curr.description
        }
        return acc;
    })
    $emit('setLanguage', id)
}

function clearLanguage() {
    selectedId.value = null
    languageModel.value = null
    $emit('clearLanguage')
}

onMounted(() => {
    languageModel.value = props.modelValue
})

const { filterFnLanguage, saveLanguage, refLanguageSelect, languageOptions, languageModel } = useLanguage(state)

</script>