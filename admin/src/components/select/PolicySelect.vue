<template>
    <q-select ref="refPolicySelect" :required="required" :readonly="readonly" dense outlined clearable=""
        behavior="menu" hide-dropdown-icon use-input hide-selected fill-input input-debounce="0" emit-value map-options
        option-value="id" option-label="description" :model-value="policyModel" :label="label" :options="policyOptions"
        @input-value="policyModel = $event" @update:model-value="setPolicy" @filter="filterFnPolicy"
        @clear="clearPolicy">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none" v-bind="scope.itemProps">
                <q-item-section v-if="titular">
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex flex-col">
                            <span>{{ scope.opt.titular_description }}</span>
                        </div>
                    </q-item-label>
                </q-item-section>
                <q-item-section v-else>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex flex-col">
                            <span>{{ scope.opt.id }}</span>
                            <span>{{ scope.opt.policy_number }}</span>
                            <span class="text-xxs">{{ scope.opt.insurance }}</span>
                            <span class="text-xxs">Vigencia hasta: {{ scope.opt.validity_date_end }}</span>
                            <span class="text-xxs">Deducible: {{ $currency(scope.opt.deductible) }}</span>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !policyModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>

        <template v-slot:after>
            <q-btn v-if="props.add" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-solid fa-add" @click="state.policyDialog = true;">
                <q-tooltip class="bg-default text-black text-xs">Agregar Póliza</q-tooltip>
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
            <PolicyRead :id="selectedId" isDrawer @close="setPolicy($event); state.dialogDetail = false" />
        </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'"
        full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <PolicyWrite isDrawer :providerId="providerId" @close="setPolicy($event); state.dialogCreate = false;"
                :width="$isDesktop ? '1000px' : '100%'" />
        </q-card>
    </q-dialog>

</template>

<script setup>
import PolicyRead from 'src/pages/policy/components/PolicyRead.vue';
import PolicyWrite from 'src/pages/policy/components/PolicyWrite.vue';

import { usePolicy } from 'src/use/policy';
import { inject, onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setPolicy', 'clearPolicy'])
const $api = inject("$api")

const props = defineProps({
    modelValue: String, label: {
        type: String,
        default: 'Elegir Póliza'
    },
    required: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    policy_number: String,
    policy_id: Number,
    titular: {
        type: Boolean,
        default: false,
    },
    add: Boolean,
    id: Number,
    insuredId: Number,
    InsuranceId: Number
})

const state = reactive({
    dialogDetail: false,
    policyDialog: false,
    selected: {},
    titular: props.titular,
    searchKey: props.titular ? "orlike:titular_description" : "orlike:policy_number",
    insuredId: props.insuredId,
    providerId: props.providerId,
    policy_number: props.policy_number,
    policy_id: props.policy_id
})

const selectedId = ref(props.id)

watch(() => props.modelValue, (val) => {
    policyModel.value = val
})

watch(() => props.policy_number, (val) => {
    state.policy_number = val
})

watch(() => props.policy_id, (val) => {
    state.policy_id = val
})

watch(() => props.titular, (val) => {
    state.titular = val
    if (val) {
        state.searchKey = "orlike:titular_description"
    } else {
        state.searchKey = "orlike:policy_number"
    }
})

watch(() => props.id, (val) => {
    if (val) {
        selectedId.value = val
    } else {
        policyModel.value = null
    }
})

async function openDialogDetail() {
    state.selected = await $api.get(`policy/${selectedId.value}`)

    state.dialogDetail = true;
}

async function setPolicy(id) {
    if (!id) {
        refPolicySelect.value.focus();
        setTimeout(() => {
            refPolicySelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    if (!policyOptions.value.length) {
        const policy = await $api.get(`policy/${id}`);
        console.log(policy);
        policyModel.value = policy.description
    } else {
        policyModel.value = policyOptions.value.reduce((acc, curr) => {
            if (curr.id === id) {
                acc = curr.fullname
            }
            return acc;
        })
    }
    $emit('setPolicy', id)
}

function clearPolicy() {
    selectedId.value = null
    policyModel.value = null
    $emit('clearPolicy')
}

onMounted(() => {
    policyModel.value = props.modelValue
})

const { filterFnPolicy, savePolicy, refPolicySelect, policyOptions, policyModel } = usePolicy(state)

</script>