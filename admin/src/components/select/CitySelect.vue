<template>
    <q-select :disable="!refId" ref="refCitySelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon
        use-input hide-selected fill-input input-debounce="0" emit-value map-options option-value="id"
        option-label="description" :model-value="cityModel" label="Elegir Ciudad" :options="cityOptions"
        @input-value="cityModel = $event" @update:model-value="setCity" @filter="filterFnCity" @clear="clearCity">

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
            <div v-if="selectedId || !cityModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>
    </q-select>
</template>

<script setup>
import { useCity } from 'src/use/city';
import { onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setCity', 'clearCity'])
const props = defineProps({ modelValue: String, refId: String })

const selectedId = ref(props.modelValue)

const state = reactive({
    refId: props.refId
})

watch(() => props.modelValue, (val) => {
    cityModel.value = val
})

watch(() => props.refId, (val) => {
    state.refId = val
})

function setCity(id) {
    if (!id) {
        refCitySelect.value.focus();
        setTimeout(() => {
            refCitySelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    cityModel.value = cityOptions.value.reduce((acc, curr) => {
        if (curr.id === id) {
            acc = curr.description
        }
        return acc;
    })
    $emit('setCity', id)
}

function clearCity() {
    selectedId.value = null
    cityModel.value = null
    $emit('clearCity')
}

onMounted(() => {
    cityModel.value = props.modelValue
})

const { filterFnCity, saveCity, refCitySelect, cityOptions, cityModel } = useCity(state)

</script>