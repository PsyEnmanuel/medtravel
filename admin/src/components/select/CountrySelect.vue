<template>
    <q-select ref="refCountrySelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon use-input
        hide-selected fill-input input-debounce="0" emit-value map-options option-value="id" option-label="description"
        :model-value="countryModel" label="Elegir País" :options="countryOptions" @input-value="countryModel = $event"
        @update:model-value="setCountry" @filter="filterFnCountry" @clear="clearCountry">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none" v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex items-center justify-between">
                            <div class="flex">
                                <span>{{ scope.opt.description }}</span>
                            </div>
                            <span>{{ unicodeStringToEmoji(scope.opt.emojiU) }}</span>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !countryModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>
    </q-select>
</template>

<script setup>
import { useCountry } from 'src/use/country';
import { onMounted, ref, watch } from 'vue';
const $emit = defineEmits(['setCountry', 'clearCountry'])
const props = defineProps({ modelValue: String })

function unicodeStringToEmoji(unicodeString) {
    // Split the string into individual Unicode points
    const unicodeArray = unicodeString.split(' ').map(code => code.replace('U+', ''));

    // Convert each Unicode point to a character
    const emoji = unicodeArray.map(code => String.fromCodePoint(parseInt(code, 16))).join('');

    return emoji;
}

const selectedId = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
    countryModel.value = val
})

function setCountry(id) {
    if (!id) {
        refCountrySelect.value.focus();
        setTimeout(() => {
            refCountrySelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    countryModel.value = countryOptions.value.reduce((acc, curr) => {
        if (curr.id === id) {
            acc = curr.description
        }
        return acc;
    })
    $emit('setCountry', id)
}

function clearCountry() {
    selectedId.value = null
    countryModel.value = null
    $emit('clearCountry')
}

onMounted(() => {
    countryModel.value = props.modelValue
})

const { filterFnCountry, saveCountry, refCountrySelect, countryOptions, countryModel } = useCountry()

</script>