<template>
    <q-select ref="refSpecialitySelect" dense
        outlined clearable="" behavior="menu" hide-dropdown-icon use-input hide-selected fill-input input-debounce="0"
        emit-value map-options option-value="id" option-label="description"
        :model-value="specialityModel" label="Elegir Especialidad" :options="specialityOptions"
        @input-value="specialityModel = $event" @update:model-value="setSpeciality"
        @filter="filterFnSpeciality" @clear="clearSpeciality">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none"
                v-bind="scope.itemProps">
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
            <div v-if="selectedId || !specialityModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>
    </q-select>
</template>

<script setup>
import { useSpeciality } from 'src/use/speciality';
import { onMounted, ref, watch } from 'vue';
const $emit = defineEmits(['setSpeciality', 'clearSpeciality'])
const props = defineProps({ modelValue: String })

const selectedId = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
    specialityModel.value = val
})

function setSpeciality(id) {
    if (!id) {
            refSpecialitySelect.value.focus();
        setTimeout(() => {
            refSpecialitySelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    specialityModel.value = specialityOptions.value.reduce((acc, curr) => {
        if(curr.id === id) {
            acc = curr.description
        }
        return acc;
    })
    $emit('setSpeciality', id)
}

function clearSpeciality() {
    selectedId.value = null
    specialityModel.value = null
    $emit('clearSpeciality')
}

onMounted(() => {
    specialityModel.value = props.modelValue
})

const { filterFnSpeciality, saveSpeciality, refSpecialitySelect, specialityOptions, specialityModel } = useSpeciality()

</script>