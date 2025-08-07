<template>
    <div v-if="!state.loading" :style="style" :class="isDrawer && 'pb-32'">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar Itinerario</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Itinerario</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <div class="flex flex-col gap-1">
                <div class="flex flex-col gap-1">
                    <div class="flex flex-nowrap gap-1 w-full">
                        <q-input class="w-full" dense outlined v-model="state.item.attendance_date" mask="##-##-####"
                            label="Fecha">
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy ref="proxy">
                                        <q-date flat v-model="state.item.attendance_date" no-unset years-in-month-view
                                            minimal mask="DD-MM-YYYY" @update:model-value="$refs.proxy.hide()"
                                            :options="disableDates"></q-date>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>

                        <div class="grid grid-cols-2 gap-1">
                            <q-btn flat class="button-icon shadow text-[10px] h-[40px]" icon="chevron_left"
                                @click="prevDate(state.item, 'attendance_date')">
                                <q-tooltip class="bg-default text-black text-xs">Día
                                    anterior</q-tooltip>
                            </q-btn>
                            <q-btn flat class="button-icon shadow text-[10px] h-[40px]" icon="chevron_right"
                                @click="nextDate(state.item, 'attendance_date')">
                                <q-tooltip class="bg-default text-black text-xs">Día
                                    siguiente</q-tooltip>
                            </q-btn>
                        </div>

                    </div>

                    <div class="flex flex-nowrap gap-1">
                        <q-input class="w-full" v-maska :data-maska="maskaTime" :data-maska-tokens="maskaTimeToken"
                            dense outlined v-model="state.item.attendance_time" label="Hora" @blur="validateTime">
                            <template v-slot:append>
                                <q-btn-toggle v-model="state.item.attendance_time_format" no-caps
                                    class="bg-white text-black w-[100px] font-black" toggle-color="primary"
                                    toggle-text-color="white" size="sm" spread dense outlined :options="[
                                        { label: 'AM', value: 'AM' },
                                        { label: 'PM', value: 'PM' },
                                    ]">
                                </q-btn-toggle>
                            </template>
                        </q-input>
                        <div class="grid grid-cols-2 gap-1">
                            <q-btn flat class="button-icon shadow text-[10px] h-[40px]" icon="sym_o_remove"
                                @click="subtractMinutes(state.item, 'attendance_time', 15)">
                                <q-tooltip class="bg-default text-black text-xs">Substraer 15
                                    minutos</q-tooltip>
                            </q-btn>
                            <q-btn flat class="button-icon shadow text-[10px] h-[40px]" icon="sym_o_add"
                                @click="addMinutes(state.item, 'attendance_time', 15)">
                                <q-tooltip class="bg-default text-black text-xs">Agregar 15
                                    minutos</q-tooltip>
                            </q-btn>
                        </div>
                    </div>
                </div>
                <ProviderSelect @setProvider="setProvider($event, state.item)"
                    @clearProvider="clearProvider(state.item)" :model-value="state.item.provider_description"
                    :id="state.item.provider_id" :providerId="state.item.provider_id" :countryId="state.item.country_id"
                    :stateId="state.item.state_id" />
                <DoctorSelect @setDoctor="setDoctor($event, state.item)" @clearDoctor="clearDoctor(state.item)"
                    :model-value="state.item.doctor_description" :id="state.item.doctor_id"
                    :providerId="state.item.provider_id" />
                <ProcedureSelect class="mb-1" @setProcedure="setProcedure($event, state.item)"
                    @clearInsured="clearProcedure(state.item)" :model-value="state.item.procedure_description" />
                <div class="flex flex-nowrap gap-1" v-for="(row, index) in state.item.mprocedure" :key="row.id">
                    <div class="w-full flex flex-col justify-between border card shadow-none px-3 py-1">
                        <div class="text-xs uppercase pr-4 line-clamp-1">{{ row.description
                        }}
                        </div>
                        <div class="text-xs uppercase pr-4 line-clamp-1">{{ row.code }}
                        </div>
                    </div>
                    <q-btn flat class="button-icon bg-primary text-white text-[10px] h-[40px]" icon="fa-solid fa-xmark"
                        @click="removeProcedure(state.item, row.id)">
                        <q-tooltip class="bg-default text-black text-xs">Remover
                            procedimiento</q-tooltip>
                    </q-btn>
                </div>
                <div v-if="isDrawer" class="fixed bottom-0 lg:right-[10px] right-0 py-2 bg-white" :style="style">
                    <RowStatus :item="state.item" :isEdit="isEdit" />
                    <div class="flex flex-nowrap gap-2 lg:ml-[10px] mt-1">
                        <template v-if="props.isEdit">
                            <q-btn class="button-icon bg-primary text-white py-0" icon="fa-solid fa-xmark" rounded
                                @click.stop="onDelete(state.item.id)" size="sm"><q-tooltip class="bg-default text-black"
                                    size="xs">Remover</q-tooltip></q-btn>
                            <q-btn class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                                label="guardar cambios" type="submit" />
                        </template>
                        <q-btn v-else class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                            label="guardar cambios" type="submit" />
                    </div>
                </div>
                <div v-else>
                    <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md" flat
                        label="Guardar cambios" type="submit" />
                    <q-btn v-else class="button-press w-full text-lg rounded-md" flat label="agregar" type="submit" />
                </div>
            </div>
            <!-- <div class="fixed bottom-0 right-0 py-2 bg-white" :style="style">
                <q-btn class="button-press w-full text-lg bg-primary text-white" flat
                    label="Guardar cambios" type="submit" />
            </div> -->
        </q-form>
    </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { requiredInput } from 'src/helpers/validation';
import { useQuasar } from 'quasar';
import ProviderSelect from 'src/components/select/ProviderSelect.vue';
import DoctorSelect from 'src/components/select/DoctorSelect.vue';
import ProcedureSelect from 'src/components/select/ProcedureSelect.vue';
import { useInputDate } from 'src/use/inputDate';

const $api = inject('$api');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })
const emit = defineEmits(["close"])

const state = reactive({
    loading: true,
    item: {},
    local: 'DoctorWrite',
})

watch(() => state.item, (val) => {
    if (!props.isEdit) {
        $local.set(state.local, val)
    }
}, { deep: true })

const { addMinutes, subtractMinutes, nextDate, prevDate } = useInputDate(state)

async function setProcedure(id, row) {
    try {
        const procedure = await $api.get(`CPT/${id}`)
        const index = row.mprocedure.findIndex((i) => i.id === id)
        if (index !== -1) {
            $q.notify({
                type: 'warning',
                message: 'Procedimiento ya esta agregado'
            })
        }
        row.mprocedure.push({
            id: String(procedure.id),
            code: String(procedure.code),
            description: procedure.description
        })

        setTimeout(() => {
            clearProcedure(row)
        }, 2000);

    } catch (error) {
        console.log(error);
    }
}

function removeProcedure(row, id) {
    try {
        const index = row.mprocedure.findIndex((i) => i.id === id)
        row.mprocedure.splice(index, 1)
    } catch (error) {
        console.log(error);
    }
}

function clearProcedure(row) {
    try {
        row.procedure_id = null;
        row.procedure_description = null;
    } catch (error) {
        console.log(error);
    }
}

async function setDoctor(id, row) {
    try {
        const doctor = await $api.get(`doctor/${id}`)
        row.doctor_id = doctor.id;
        row.doctor_description = doctor.description;

    } catch (error) {
        console.log(error);
    }
}

function clearDoctor(row) {
    try {
        row.doctor_id = null;
        row.doctor_description = null;
    } catch (error) {
        console.log(error);
    }
}

async function setProvider(id, row) {
    try {
        const provider = await $api.get(`provider/${id}`)
        row.provider_id = String(provider.id);
        row.provider_description = provider.description;

    } catch (error) {
        console.log(error);
    }
}

function clearProvider(row) {
    try {
        row.provider_id = null;
        row.provider_description = null;
    } catch (error) {
        console.log(error);
    }
}

async function onSubmit() {
    state.submitting = true
    try {
        if (props.isEdit) {
            const response = await $api.put(`itinerary/${props.id}`, state.item);
            if (response) {
                $q.notify({
                    type: 'success',
                    message: 'Itinerario Editado'
                })
            }
        } else {
            const response = await $api.post('itinerary', state.item);
            if (response) {
                $q.notify({
                    type: 'success',
                    message: 'Itinerario Agregado'
                })
                onReset()
                onInit()
            }
        }
        emit('close')
    } catch (error) {
        console.log(error);
    }
    state.submitting = false;
}

async function onDelete(id) {
    try {
        const response = await $api.delete(`itinerary/${id}`);
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Itinerario Removido'
            })
        }
        emit('close')
    } catch (error) {
        console.log(error);
    }
}

async function onInit() {
    state.item = await $api.get(`itinerary/${props.id}`)
    state.loading = false
}

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

const style = computed(() => {
    return {
        width: props.width,
        'padding-right': props.isDrawer && '8px',
        'padding-left': props.isDrawer && '8px'
    }
})

onMounted(() => {
    onInit()
})
</script>