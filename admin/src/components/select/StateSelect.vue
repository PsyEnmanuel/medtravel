<template>
    <q-select :disable="!refId" ref="refStateSelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon
        use-input hide-selected fill-input input-debounce="0" emit-value map-options option-value="id"
        option-label="description" :model-value="stateModel" label="Elegir Estado/Provincia" :options="stateOptions"
        @input-value="stateModel = $event" @update:model-value="setState" @filter="filterFnState" @clear="clearState">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none" v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex items-center justify-between">
                            <div class="flex">
                                <span>{{ scope.opt.description }}</span>
                            </div>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !stateModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>
    </q-select>
</template>

<script setup>
import { useState } from 'src/use/state';
import { onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setState', 'clearState'])
const props = defineProps({ modelValue: String, refId: String })

const selectedId = ref(props.modelValue)
const state = reactive({
    refId: props.refId
})

watch(() => props.modelValue, (val) => {
    stateModel.value = val
})

watch(() => props.refId, (val) => {
    state.refId = val
})

function setState(id) {
    if (!id) {
        refStateSelect.value.focus();
        setTimeout(() => {
            refStateSelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    stateModel.value = stateOptions.value.reduce((acc, curr) => {
        if (curr.id === id) {
            acc = curr.description
        }
        return acc;
    })
    $emit('setState', id)
}

function clearState() {
    selectedId.value = null
    stateModel.value = null
    $emit('clearState')
}

onMounted(() => {
    stateModel.value = props.modelValue
})

const { filterFnState, saveState, refStateSelect, stateOptions, stateModel } = useState(state)

</script>