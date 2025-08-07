<template>
    <q-select :class="props.class" ref="refInsuredSelect" :required="required" :readonly="readonly" dense outlined
        clearable="" behavior="menu" hide-dropdown-icon use-input hide-selected fill-input input-debounce="0" emit-value
        map-options option-value="id" option-label="description" :model-value="insuredModel" :label="label"
        :options="insuredOptions" @input-value="insuredModel = $event" @update:model-value="setInsured"
        @filter="filterFnInsured" @clear="clearInsured" :rules="[requiredSelect && requiredInput]" hide-bottom-space>

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none" v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex flex-col">
                            <span>{{ scope.opt.fullname }}</span>
                            <span class="text-xxs">{{ scope.opt.age }}</span>
                            <span class="text-xxs">{{ scope.opt.sex }}</span>
                            <span class="text-xxs"># Pólizas: {{ scope.opt.policies.length }}</span>
                            <div v-if="scope.opt.language" class="flex gap-1">
                                <div v-for="(row, index) in scope.opt.language" :key="row.id">
                                    <q-badge outline color="font" class="text-xxs">{{ row }}</q-badge>
                                </div>
                            </div>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !insuredModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>

        <template v-slot:after>
            <q-btn v-if="props.add" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-solid fa-add" @click="state.insuredDialog = true;">
                <q-tooltip class="bg-default text-black text-xs">Agregar Asegurado</q-tooltip>
            </q-btn>
            <q-btn v-if="selectedId" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-duotone fa-solid fa-magnifying-glass" @click="openDialogDetail">
                <q-tooltip class="bg-default text-black text-xs">Ver detalles y pólizas</q-tooltip>
            </q-btn>
        </template>

    </q-select>

    <q-dialog class="q-pa-none left-0" v-model="state.dialogDetail" full-height full-width maximized
        :transition-duration="$isDesktop ? 100 : 0">
        <q-card class="shadow pt-2 px-3 pb-2 flex-col">
            <InsuredRead :id="selectedId" isDrawer @close="setInsured($event); state.dialogDetail = false" />
        </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'"
        full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <InsuredWrite isDrawer :providerId="providerId" @close="setInsured($event); state.dialogCreate = false;"
                :width="$isDesktop ? '1000px' : '100%'" />
        </q-card>
    </q-dialog>

</template>

<script setup>
import InsuredRead from 'src/pages/insured/components/InsuredRead.vue';
import InsuredWrite from 'src/pages/insured/components/InsuredWrite.vue';
import { requiredInput } from 'src/helpers/validation';

import { useInsured } from 'src/use/insured';
import { inject, onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setInsured', 'clearInsured'])
const $api = inject("$api")

const state = reactive({
    dialogDetail: false,
    insuredDialog: false,
    selected: {}
})

const props = defineProps({
    modelValue: String, label: {
        type: String,
        default: 'Elegir Asegurado'
    },
    required: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    requiredSelect: Boolean,
    add: Boolean,
    id: Number,
    class: {
        type: String,
        default: ''
    }
})

const selectedId = ref(props.id)

watch(() => props.modelValue, (val) => {
    insuredModel.value = val
})

watch(() => props.id, (val) => {
    if (val) {
        selectedId.value = val
    } else {
        insuredModel.value = null
    }
})

async function openDialogDetail() {
    state.selected = await $api.get(`insured/${selectedId.value}`)

    state.dialogDetail = true;
}

async function setInsured(id) {
    if (!id) {
        return;
    }
    selectedId.value = id
    if (!insuredOptions.value.length) {
        const insured = await $api.get(`insured/${id}`);
        insuredModel.value = insured.fullname
    } else {
        insuredModel.value = insuredOptions.value.reduce((acc, curr) => {
            if (curr.id === id) {
                acc = curr.fullname
            }
            return acc;
        })
    }
    $emit('setInsured', id)
}

function clearInsured() {
    $emit('clearInsured')
    selectedId.value = null
    insuredModel.value = null
}

onMounted(() => {
    insuredModel.value = props.modelValue
})

const { filterFnInsured, saveInsured, refInsuredSelect, insuredOptions, insuredModel } = useInsured()

</script>