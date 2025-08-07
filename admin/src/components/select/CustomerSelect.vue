<template>
    <q-select ref="refCustomerSelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon use-input
        hide-selected fill-input input-debounce="0" emit-value map-options option-value="id" option-label="description"
        :model-value="customerModel" label="Elegir Cliente" :options="customerOptions"
        @input-value="customerModel = $event" @update:model-value="setCustomer" @filter="filterFnCustomer"
        @clear="clearCustomer"  :rules="[requiredSelect && requiredInput]" hide-bottom-space>

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
            <div v-if="selectedId || !customerModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>

        <template v-slot:after>
            <q-btn v-if="props.add" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-solid fa-add" @click="state.customerDialog = true;">
                <q-tooltip class="bg-default text-black text-xs">Agregar Cliente</q-tooltip>
            </q-btn>
        </template>

    </q-select>

    <q-dialog class="q-pa-none left-0" v-model="state.customerDialog" :position="$isDesktop ? 'right' : 'standard'"
        full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <CustomerWrite isDrawer @close="state.customerDialog = false" :width="$isDesktop ? '1000px' : '100%'" />
        </q-card>
    </q-dialog>

</template>

<script setup>
import CustomerWrite from 'src/pages/customer/components/CustomerWrite.vue';
import { useCustomer } from 'src/use/customer';
import { onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setCustomer', 'clearCustomer'])
const props = defineProps({ modelValue: String, add: Boolean, requiredSelect: Boolean })
import { requiredInput } from 'src/helpers/validation';

const selectedId = ref(props.modelValue)

const state = reactive({
    customerDialog: false
})

watch(() => props.modelValue, (val) => {
    customerModel.value = val
})

function setCustomer(id) {
    if (!id) {
        refCustomerSelect.value.focus();
        setTimeout(() => {
            refCustomerSelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    customerModel.value = customerOptions.value.reduce((acc, curr) => {
        if (curr.id === id) {
            acc = curr.description
        }
        return acc;
    })
    $emit('setCustomer', id)
}

function clearCustomer() {
    selectedId.value = null
    customerModel.value = null
    $emit('clearCustomer')
}

onMounted(() => {
    customerModel.value = props.modelValue
})

const { filterFnCustomer, saveCustomer, refCustomerSelect, customerOptions, customerModel } = useCustomer()

</script>