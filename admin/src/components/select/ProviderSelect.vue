<template>
    <q-select class="w-full" ref="refProviderSelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon
        use-input hide-selected fill-input input-debounce="0" emit-value map-options option-value="id"
        option-label="description" :model-value="providerModel" :label="label" :options="providerOptions"
        @input-value="providerModel = $event" @update:model-value="setProvider" @filter="filterFnProvider"
        @clear="clearProvider">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none" v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex flex-col">
                            <span>{{ scope.opt.description }}</span>
                            <span class="text-xxs">{{ scope.opt.provider_type }}</span>
                            <span class="text-xxs">{{ scope.opt.country }}, {{ scope.opt.city }}, {{ scope.opt.state }}</span>
                            <span class="text-xxs">{{ scope.opt.address }}</span>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !providerModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>

        <template v-slot:after>
            <q-btn v-if="props.add && !selectedId" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-solid fa-add" @click="state.dialogCreate = true;">
                <q-tooltip class="bg-default text-black text-xs">Agregar Proveedor</q-tooltip>
            </q-btn>
            <q-btn v-if="selectedId" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-duotone fa-solid fa-magnifying-glass" size="xs" @click="openDialogDetail">
                <q-tooltip class="bg-default text-black text-xs">Ver detalles</q-tooltip>
            </q-btn>
        </template>

    </q-select>

    <q-dialog class="q-pa-none left-0" v-model="state.dialogDetail" full-height full-width maximized
        :transition-duration="$isDesktop ? 100 : 0">
        <q-card class="shadow pt-2 px-3 pb-2 flex-col">
            <ProviderRead :id="selectedId" isDrawer @close="setProvider($event); state.dialogDetail = false" />
        </q-card>
    </q-dialog>


    <q-dialog class="q-pa-none left-0" v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'"
        full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <ProviderWrite isDrawer @close="setProvider($event); state.dialogCreate = false;"
                :width="$isDesktop ? '1000px' : '100%'" />
        </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'"
        full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <ProviderWrite isDrawer :id="selectedId" isEdit @close="setProvider($event); state.dialogWrite = false;"
                :width="$isDesktop ? '1000px' : '100%'" />
        </q-card>
    </q-dialog>

</template>

<script setup>
import ProviderRead from 'src/pages/provider/components/ProviderRead.vue';
import ProviderWrite from 'src/pages/provider/components/ProviderWrite.vue';
import { useProvider } from 'src/use/provider';
import { inject, onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setProvider', 'clearProvider'])
const props = defineProps({
    add: Boolean,
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
    state.stateId = val
})

watch(() => props.modelValue, (val) => {
    providerModel.value = val
})

watch(() => props.id, (val) => {
    selectedId.value = val
})

async function openDialogDetail() {
    state.selected = await $api.get(`provider/${selectedId.value}`)
    state.dialogDetail = true;
}

async function openDialogWrite() {
    state.selected = await $api.get(`provider/${selectedId.value}`)
    state.dialogWrite = true;
}

async function setProvider(id) {
    console.log(id);
    if (!id) {
        refProviderSelect.value.focus();
        setTimeout(() => {
            refProviderSelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    if (!providerOptions.value.length) {
        const provider = await $api.get(`provider/${id}`);
        providerModel.value = provider.description
    } else {
        providerModel.value = providerOptions.value.reduce((acc, curr) => {
            if (curr.id === id) {
                acc = curr.description
            }
            return acc;
        })
    }
    $emit('setProvider', id)
}

function clearProvider() {
    selectedId.value = null
    providerModel.value = null
    $emit('clearProvider')
}

onMounted(() => {
    providerModel.value = props.modelValue
})

const { filterFnProvider, saveProvider, refProviderSelect, providerOptions, providerModel } = useProvider(state)

</script>