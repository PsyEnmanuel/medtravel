<template>
    <q-select class="w-full" ref="refInsuranceSelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon
        use-input hide-selected fill-input input-debounce="0" emit-value map-options option-value="id"
        option-label="description" :model-value="insuranceModel" label="Elegir Seguro" :options="insuranceOptions"
        @input-value="insuranceModel = $event" @update:model-value="setInsurance" @filter="filterFnInsurance"
        @clear="clearInsurance" :rules="[requiredSelect && requiredInput]" hide-bottom-space>

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
            <div v-if="selectedId || !insuranceModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>
    </q-select>
</template>

<script setup>
import { useInsurance } from 'src/use/insurance';
import { onMounted, ref, watch } from 'vue';
const $emit = defineEmits(['setInsurance', 'clearInsurance'])
const props = defineProps({ modelValue: String, requiredSelect: Boolean })
import { requiredInput } from 'src/helpers/validation';

const selectedId = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
    insuranceModel.value = val
})

function setInsurance(id) {
    if (!id) {
        refInsuranceSelect.value.focus();
        setTimeout(() => {
            refInsuranceSelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    insuranceModel.value = insuranceOptions.value.reduce((acc, curr) => {
        if (curr.id === id) {
            acc = curr.description
        }
        return acc;
    })
    $emit('setInsurance', id)
}

function clearInsurance() {
    selectedId.value = null
    insuranceModel.value = null
    $emit('clearInsurance')
}

onMounted(() => {
    insuranceModel.value = props.modelValue
})

const { filterFnInsurance, refInsuranceSelect, insuranceOptions, insuranceModel } = useInsurance()

</script>