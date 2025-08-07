<template>
    <q-select ref="refDiagnosisSelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon use-input
        hide-selected fill-input input-debounce="0" emit-value map-options option-value="id" option-label="description"
        :model-value="diagnosisModel" :label="label" :options="diagnosisOptions" @input-value="diagnosisModel = $event"
        @update:model-value="setDiagnosis" @filter="filterFnDiagnosis" @clear="clearDiagnosis">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none"
                :style="{ 'border-left': scope.opt.color ? `8px solid ${scope.opt.color}` : null }"
                v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex flex-col gap-1">
                            <!-- <span class="min-w-[40px]">{{ scope.index + 1 }})</span> -->
                            <span class="flex flex-nowrap">{{ scope.opt.code }} - {{ scope.opt.description }}</span>
                            <div class="flex items-center justify-start gap-1 text-xxs" v-if="scope.opt.cancer">
                                <q-badge :style="{ 'background': scope.opt.cancer.color }"></q-badge>
                                <span>{{ scope.opt.cancer.desc }}</span>
                                <!-- <span>{{ scope.opt.cancer.date }}</span> -->
                            </div>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !diagnosisModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>
    </q-select>
</template>

<script setup>
import { useDiagnosis } from 'src/use/diagnosis';
import { onMounted, ref, watch } from 'vue';
const $emit = defineEmits(['setDiagnosis', 'clearDiagnosis'])
const props = defineProps({
    modelValue: String, label: {
        type: String,
        default: 'Elegir ICD10'
    }
})

const selectedId = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
    diagnosisModel.value = val
})

function setDiagnosis(id) {
    if (!id) {
        refDiagnosisSelect.value.focus();
        setTimeout(() => {
            refDiagnosisSelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    diagnosisModel.value = diagnosisOptions.value.reduce((acc, curr) => {
        if (curr.id === id) {
            acc = curr.description
        }
        return acc;
    })
    $emit('setDiagnosis', id)
}

function clearDiagnosis() {
    selectedId.value = null
    diagnosisModel.value = null
    $emit('clearDiagnosis')
}

onMounted(() => {
    diagnosisModel.value = props.modelValue
})

const { filterFnDiagnosis, refDiagnosisSelect, diagnosisOptions, diagnosisModel } = useDiagnosis()

</script>