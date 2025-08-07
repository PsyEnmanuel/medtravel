<template>
    <q-select class="w-full" ref="refBrokerSelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon
        use-input hide-selected fill-input input-debounce="0" emit-value map-options option-value="id"
        option-label="description" :model-value="brokerModel" :label="label" :options="brokerOptions"
        @input-value="brokerModel = $event" @update:model-value="setBroker" @filter="filterFnBroker"
        @clear="clearBroker">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none" v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex flex-col">
                            <span>{{ scope.opt.description }}</span>
                            <span class="text-xxs">{{ scope.opt.broker_type }}</span>
                            <span class="text-xxs">{{ scope.opt.country }}, {{ scope.opt.city }}, {{ scope.opt.state
                                }}</span>
                            <span class="text-xxs">{{ scope.opt.address }}</span>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !brokerModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>

        <template v-slot:after>
            <q-btn v-if="props.add && !selectedId" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-solid fa-add" @click="state.dialogCreate = true;">
                <q-tooltip class="bg-default text-black text-xs">Agregar Hospedaje</q-tooltip>
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
            <BrokerRead :id="selectedId" isDrawer @close="setBroker($event); state.dialogDetail = false" />
        </q-card>
    </q-dialog>


    <q-dialog class="q-pa-none left-0" v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'"
        full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <BrokerWrite isDrawer @close="setBroker($event); state.dialogCreate = false;"
                :width="$isDesktop ? '1000px' : '100%'" />
        </q-card>
    </q-dialog>

</template>

<script setup>
import BrokerRead from 'src/pages/broker/components/BrokerRead.vue';
import BrokerWrite from 'src/pages/broker/components/BrokerWrite.vue';
import { useBroker } from 'src/use/broker';
import { inject, onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setBroker', 'clearBroker'])
const props = defineProps({
    add: Boolean,
    modelValue: String, id: Number, label: {
        type: String,
        default: 'Elegir Hospedaje',
    }
})
const $api = inject("$api")

const selectedId = ref(props.id)

const state = reactive({
    dialogDetail: false,
    selected: {}
})

watch(() => props.modelValue, (val) => {
    brokerModel.value = val
})

watch(() => props.id, (val) => {
    selectedId.value = val
})

async function openDialogDetail() {
    state.selected = await $api.get(`broker/${selectedId.value}`)
    state.dialogDetail = true;
}

async function setBroker(id) {
    if (!id) {
        refBrokerSelect.value.focus();
        setTimeout(() => {
            refBrokerSelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    if (!brokerOptions.value.length) {
        const broker = await $api.get(`broker/${id}`);
        brokerModel.value = broker.description
    } else {
        brokerModel.value = brokerOptions.value.reduce((acc, curr) => {
            if (curr.id === id) {
                acc = curr.description
            }
            return acc;
        })
    }
    $emit('setBroker', id)
}

function clearBroker() {
    selectedId.value = null
    brokerModel.value = null
    $emit('clearBroker')
}

onMounted(() => {
    brokerModel.value = props.modelValue
})

const { filterFnBroker, refBrokerSelect, brokerOptions, brokerModel } = useBroker(state)

</script>