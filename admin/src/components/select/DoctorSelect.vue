<template>
    <q-select ref="refDoctorSelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon use-input
        hide-selected fill-input input-debounce="0" emit-value map-options option-value="id" option-label="description"
        :model-value="doctorModel" label="Elegir Médico" :options="doctorOptions" @input-value="doctorModel = $event"
        @update:model-value="setDoctor" @filter="filterFnDoctor" @clear="clearDoctor">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none" v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex flex-col">
                            <span>{{ scope.opt.description }}</span>
                            <span class="text-xxs">{{ scope.opt.postnominal.join(",") }}</span>
                            <span class="text-xxs" v-if="scope.opt.attention_type">{{ scope.opt.attention_type.join(", ") }}</span>
                            <span class="text-xxs" v-if="scope.opt.language">{{ scope.opt.language.join(", ") }}</span>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !doctorModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>

        <template v-slot:after>
            <q-btn v-if="props.add && !selectedId" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-solid fa-add" @click="state.dialogCreate = true;">
                <q-tooltip class="bg-default text-black text-xs">Agregar Médico</q-tooltip>
            </q-btn>
            <q-btn v-if="selectedId" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-duotone fa-solid fa-magnifying-glass" @click="openDialogDetail">
                <q-tooltip class="bg-default text-black text-xs">Ver detalles</q-tooltip>
            </q-btn>
        </template>

        <q-dialog class="q-pa-none left-0" v-model="state.dialogDetail" full-height full-width maximized
            :transition-duration="$isDesktop ? 100 : 0">
            <q-card class="shadow pt-2 px-3 pb-2 flex-col">
                <DoctorRead :id="selectedId" isDrawer @close="setDoctor($event); state.dialogDetail = false" />
            </q-card>
        </q-dialog>

        <q-dialog class="q-pa-none left-0" v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'"
            full-height maximized :transition-duration="$isDesktop ? 100 : 0">
            <q-card>
                <DoctorWrite isDrawer :providerId="providerId" @close="setDoctor($event); state.dialogCreate = false;"
                    :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>

    </q-select>
</template>

<script setup>
import DoctorRead from 'src/pages/doctor/components/DoctorRead.vue';
import DoctorWrite from 'src/pages/doctor/components/DoctorWrite.vue';
import { useDoctor } from 'src/use/doctor';
import { inject, onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setDoctor', 'clearDoctor'])
const $api = inject("$api")

const props = defineProps({ modelValue: String, id: Number, add: Boolean, providerId: Number })
const selectedId = ref(props.id)

const state = reactive({
    dialogDetail: false,
    selected: {},
    refId: props.providerId
})

watch(() => props.providerId, (val) => {
    state.refId = val
})

watch(() => props.modelValue, (val) => {
    doctorModel.value = val
})

watch(() => props.id, (val) => {
    selectedId.value = val
})

async function openDialogDetail() {
    state.selected = await $api.get(`doctor/${selectedId.value}`)
    state.dialogDetail = true;
}

async function setDoctor(id) {
    if (!id) {
        // refDoctorSelect.value.focus();
        // setTimeout(() => {
        //     refDoctorSelect.value.blur();
        // });
        return;
    }
    selectedId.value = id
    if (!doctorOptions.value.length) {
        const doctor = await $api.get(`doctor/${id}`);
        doctorModel.value = doctor.description
    } else {
        doctorModel.value = doctorOptions.value.reduce((acc, curr) => {
            if (curr.id === id) {
                acc = curr.description
            }
            return acc;
        })
    }
    $emit('setDoctor', id)
}

function clearDoctor() {
    selectedId.value = null
    doctorModel.value = null
    $emit('clearDoctor')
}

onMounted(() => {
    doctorModel.value = props.modelValue
})

const { filterFnDoctor, refDoctorSelect, doctorOptions, doctorModel } = useDoctor(state)

</script>