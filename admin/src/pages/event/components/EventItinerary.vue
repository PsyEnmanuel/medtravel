<template>
    <div :style="style" class="relative" :class="isDrawer ? 'pb-32' : 'pb-4'">
        <div v-if="!hideDetail" class="flex flex-nowrap justify-between items-start gap-2 py-2">
            <div v-if="isEdit">
                <p class="lg:text-2xl text-xl text-info">Editar Itinerario</p>
            </div>
            <div v-else class="flex">
                <div class="flex flex-col">
                    <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Itinerario</b></p>
                </div>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>

        <div class="flex lg:flex-nowrap gap-2">

            <div v-if="!hideDetail" class="lg:min-w-[200px] lg:max-w-[200px] w-full text-xs lg:text-md">
                <div class="grid lg:grid-cols-1 grid-cols-2 gap-2">
                    <div class="card mb-1">
                        <div class="subtitle text-xs lg:text-md">{{ $t('country') }}</div>
                        <div class="px-1">{{ state.item.country }}</div>
                    </div>
                    <div class="card mb-1">
                        <div class="subtitle text-xs lg:text-md">{{ $t('state') }}</div>
                        <div class="px-1">{{ state.item.state }}</div>
                    </div>
                    <div class="card mb-1">
                        <div class="subtitle text-xs lg:text-md">{{ $t('city') }}</div>
                        <div class="px-1">{{ state.item.city }}</div>
                    </div>
                    <div class="card mb-1">
                        <div class="subtitle text-xs lg:text-md">{{ $t('provider_description') }}</div>
                        <div class="px-1">{{ state.item.provider_description }}</div>
                    </div>
                    <div class="card mb-1">
                        <div class="subtitle text-xs lg:text-md">{{ $t('contact_description') }}</div>
                        <div class="px-1">{{ state.item.contact_description }}</div>
                    </div>
                    <div class="card mb-1">
                        <div class="subtitle text-xs lg:text-md">{{ $t('MRN') }}</div>
                        <div class="px-1">{{ state.item.MRN }}</div>
                    </div>
                </div>
            </div>

            <q-form class="w-full" ref="writeForm" autofocus @submit="onSubmit">

                <q-table :grid="!$isDesktop" hide-pagination :rows-per-page-options="[0]" :rows="validRows"
                    :columns="state.columns" row-key="id" ref="tableRef" @request="onRequest" flat
                    :loading="state.loading" :wrap-cells="true">

                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td class="text-xxs" v-for="col in props.cols" :key="col.name" :props="props">
                                <template v-if="col.name === 'action'">
                                    <div class="flex gap-2">
                                    </div>
                                </template>
                                <template v-if="col.name === 'attendance_datetime'">
                                    <div class="flex flex-col gap-1">
                                        <div class="flex flex-nowrap gap-1 w-full">
                                            <q-input class="w-full" dense outlined v-model="props.row.attendance_date"
                                                mask="##-##-####" label="Fecha" @update:model-value="setItinerary">
                                                <template v-slot:append>
                                                    <q-icon name="event" class="cursor-pointer">
                                                        <q-popup-proxy ref="proxy">
                                                            <q-date flat v-model="props.row.attendance_date" no-unset
                                                                years-in-month-view minimal mask="DD-MM-YYYY"
                                                                @update:model-value="$refs.proxy.hide()"
                                                                :options="disableDates"></q-date>
                                                        </q-popup-proxy>
                                                    </q-icon>
                                                </template>
                                            </q-input>

                                            <div class="grid grid-cols-2 gap-1">
                                                <q-btn flat class="button-icon shadow text-[10px] h-[40px]"
                                                    icon="chevron_left"
                                                    @click="prevDate(props.row, 'attendance_date'); setItinerary()">
                                                    <q-tooltip class="bg-default text-black text-xs">Día
                                                        anterior</q-tooltip>
                                                </q-btn>
                                                <q-btn flat class="button-icon shadow text-[10px] h-[40px]"
                                                    icon="chevron_right"
                                                    @click="nextDate(props.row, 'attendance_date'); setItinerary()">
                                                    <q-tooltip class="bg-default text-black text-xs">Día
                                                        siguiente</q-tooltip>
                                                </q-btn>
                                            </div>

                                        </div>

                                        <div class="flex flex-nowrap gap-1">
                                            <q-input class="w-full" v-maska :data-maska="maskaTime"
                                                :data-maska-tokens="maskaTimeToken" dense outlined
                                                v-model="props.row.attendance_time" label="Hora" @blur="validateTime"
                                                @update:model-value="setItinerary">
                                                <template v-slot:append>
                                                    <q-btn-toggle v-model="props.row.attendance_time_format" no-caps
                                                        class="bg-white text-black w-[100px] font-black"
                                                        toggle-color="primary" toggle-text-color="white" size="sm"
                                                        spread dense outlined :options="[
                                                            { label: 'AM', value: 'AM' },
                                                            { label: 'PM', value: 'PM' },
                                                        ]" @update:model-value="setItinerary">
                                                    </q-btn-toggle>
                                                </template>
                                            </q-input>
                                            <div class="grid grid-cols-2 gap-1">
                                                <q-btn flat class="button-icon shadow text-[10px] h-[40px]"
                                                    icon="sym_o_remove"
                                                    @click="subtractMinutes(props.row, 'attendance_time', 15); setItinerary();">
                                                    <q-tooltip class="bg-default text-black text-xs">Substraer 15
                                                        minutos</q-tooltip>
                                                </q-btn>
                                                <q-btn flat class="button-icon shadow text-[10px] h-[40px]"
                                                    icon="sym_o_add"
                                                    @click="addMinutes(props.row, 'attendance_time', 15); setItinerary();">
                                                    <q-tooltip class="bg-default text-black text-xs">Agregar 15
                                                        minutos</q-tooltip>
                                                </q-btn>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                                <template v-else-if="col.name === 'provider_description'">
                                    <ProviderSelect @setProvider="setProvider($event, props.row)"
                                        @clearProvider="clearProvider(props.row)"
                                        :model-value="props.row.provider_description" :id="props.row.provider_id"
                                        :providerId="props.row.provider_id" :countryId="state.item.country_id"
                                        :stateId="state.item.state_id" add />
                                </template>
                                <template v-else-if="col.name === 'doctor_description'">
                                    <DoctorSelect @setDoctor="setDoctor($event, props.row)"
                                        @clearDoctor="clearDoctor(props.row)"
                                        :model-value="props.row.doctor_description" :id="props.row.doctor_id"
                                        :providerId="props.row.provider_id" add />
                                </template>
                                <template v-else-if="col.name === 'procedure_description'">
                                    <ProcedureSelect class="mb-1" @setProcedure="setProcedure($event, props.row)"
                                        @clearProcedure="clearProcedure(props.row)"
                                        :model-value="props.row.procedure_description" />
                                    <div class="flex flex-col gap-1" v-for="(row, index) in props.row.mprocedure"
                                        :key="row.id">
                                        <div class="flex flex-nowrap gap-1 mt-1">
                                            <div
                                                class="w-full flex flex-col justify-between border card shadow-none px-3 py-1">
                                                <div class="text-xs uppercase pr-4 line-clamp-1">{{ row.description
                                                }}
                                                </div>
                                                <div class="text-xs uppercase pr-4 line-clamp-1">{{ row.code }}
                                                </div>
                                            </div>
                                            <q-btn flat class="button-icon bg-primary text-white text-[10px] h-[40px]"
                                                icon="fa-solid fa-xmark" @click="removeProcedure(props.row, row.id)">
                                                <q-tooltip class="bg-default text-black text-xs">Remover
                                                    procedimiento</q-tooltip>
                                            </q-btn>
                                        </div>
                                    </div>
                                </template>
                                <template v-else-if="col.name === 'action'">
                                    <q-btn flat class="button-icon bg-primary text-white text-[10px] h-[40px]"
                                        icon="fa-solid fa-xmark" @click="removeRow(props.row)">
                                        <q-tooltip class="bg-default text-black text-xs">Remover
                                            Itinerario</q-tooltip></q-btn>
                                </template>

                                <template v-else>
                                    {{ col.value }}
                                </template>
                            </q-td>
                        </q-tr>
                    </template>

                    <template v-slot:item="props">
                        <div class="q-py-xs col-xs-12" :style="props.selected ? 'transform: scale(0.95);' : ''">

                            <div class="card p-1 flex flex-col gap-1">

                                <div class="flex flex-nowrap gap-1 w-full">
                                    <q-input class="w-full" dense outlined v-model="props.row.attendance_date"
                                        mask="##-##-####" label="Fecha" @update:model-value="setItinerary">
                                        <template v-slot:append>
                                            <q-icon name="event" class="cursor-pointer">
                                                <q-popup-proxy ref="proxy">
                                                    <q-date flat v-model="props.row.attendance_date" no-unset
                                                        years-in-month-view minimal mask="DD-MM-YYYY"
                                                        @update:model-value="$refs.proxy.hide()"
                                                        :options="disableDates"></q-date>
                                                </q-popup-proxy>
                                            </q-icon>
                                        </template>
                                    </q-input>

                                    <div class="grid grid-cols-2 gap-1">
                                        <q-btn flat class="button-icon shadow text-[10px] h-[40px]" icon="chevron_left"
                                            @click="prevDate(props.row, 'attendance_date'); setItinerary()">
                                            <q-tooltip class="bg-default text-black text-xs">Día
                                                anterior</q-tooltip>
                                        </q-btn>
                                        <q-btn flat class="button-icon shadow text-[10px] h-[40px]" icon="chevron_right"
                                            @click="nextDate(props.row, 'attendance_date'); setItinerary()">
                                            <q-tooltip class="bg-default text-black text-xs">Día
                                                siguiente</q-tooltip>
                                        </q-btn>
                                    </div>
                                </div>

                                <div class="flex flex-nowrap gap-1">
                                    <q-input class="w-full" v-maska :data-maska="maskaTime"
                                        :data-maska-tokens="maskaTimeToken" dense outlined
                                        v-model="props.row.attendance_time" label="Hora" @blur="validateTime"
                                        @update:model-value="setItinerary">
                                        <template v-slot:append>
                                            <q-btn-toggle v-model="props.row.attendance_time_format" no-caps
                                                class="bg-white text-black w-[100px] font-black" toggle-color="primary"
                                                toggle-text-color="white" size="sm" spread dense outlined :options="[
                                                    { label: 'AM', value: 'AM' },
                                                    { label: 'PM', value: 'PM' },
                                                ]" @update:model-value="setItinerary">
                                            </q-btn-toggle>
                                        </template>
                                    </q-input>
                                    <div class="grid grid-cols-2 gap-1">
                                        <q-btn flat class="button-icon shadow text-[10px] h-[40px]" icon="sym_o_remove"
                                            @click="subtractMinutes(props.row, 'attendance_time', 15); setItinerary();">
                                            <q-tooltip class="bg-default text-black text-xs">Substraer 15
                                                minutos</q-tooltip>
                                        </q-btn>
                                        <q-btn flat class="button-icon shadow text-[10px] h-[40px]" icon="sym_o_add"
                                            @click="addMinutes(props.row, 'attendance_time', 15); setItinerary();">
                                            <q-tooltip class="bg-default text-black text-xs">Agregar 15
                                                minutos</q-tooltip>
                                        </q-btn>
                                    </div>
                                </div>

                                <ProviderSelect @setProvider="setProvider($event, props.row)"
                                    @clearProvider="clearProvider(props.row)"
                                    :model-value="props.row.provider_description" :id="props.row.provider_id"
                                    :providerId="props.row.provider_id" :countryId="state.item.country_id"
                                    :stateId="state.item.state_id" add />

                                <DoctorSelect @setDoctor="setDoctor($event, props.row)"
                                    @clearDoctor="clearDoctor(props.row)" :model-value="props.row.doctor_description"
                                    :id="props.row.doctor_id" :providerId="props.row.provider_id" add />

                                <ProcedureSelect class="mb-1" @setProcedure="setProcedure($event, props.row)"
                                    @clearProcedure="clearProcedure(props.row)"
                                    :model-value="props.row.procedure_description" />
                                <div class="flex flex-col gap-1" v-for="(row, index) in props.row.mprocedure"
                                    :key="row.id">
                                    <div class="flex flex-nowrap gap-1">
                                        <div
                                            class="w-full flex flex-col justify-between border card shadow-none px-3 py-1">
                                            <div class="text-xs uppercase pr-4 line-clamp-1">{{ row.description
                                            }}
                                            </div>
                                            <div class="text-xs uppercase pr-4 line-clamp-1">{{ row.code }}
                                            </div>
                                        </div>
                                        <q-btn flat class="button-icon bg-primary text-white text-[10px] h-[40px]"
                                            icon="fa-solid fa-xmark" @click="removeProcedure(props.row, row.id)">
                                            <q-tooltip class="bg-default text-black text-xs">Remover
                                                procedimiento</q-tooltip>
                                        </q-btn>
                                    </div>
                                </div>

                                <q-btn flat class="button bg-primary text-white text-[10px] h-[40px] mt-1 w-full"
                                    @click="removeRow(props.row)" label="Remover
                                            Itinerario">
                                    <q-tooltip class="bg-default text-black text-xs">Remover
                                        Itinerario</q-tooltip></q-btn>
                            </div>


                        </div>
                    </template>

                    <template v-slot:no-data="{ icon, message, filter }">
                        <NoData :icon="icon" :message="message" :filter="filter" />
                    </template>

                    <template v-slot:bottom>
                        <q-btn flat class="button bg-primary-light w-full mt-2" no-caps @click="addRow">Agregar más
                            lineas</q-btn>
                    </template>
                </q-table>

                <div v-if="id">
                    <div v-if="isDrawer" class="fixed bottom-0 lg:right-[10px] right-0 py-2 bg-white w-full"
                        :style="style">
                        <div class="flex flex-nowrap gap-2 lg:ml-[10px] mt-1">
                            <template v-if="props.isEdit">
                                <q-btn :disabled="state.submitting"
                                    class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                                    label="guardar cambios" type="submit" />
                            </template>
                            <q-btn v-else :disabled="state.submitting"
                                class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                                label="guardar cambios" type="submit" />
                        </div>
                    </div>
                    <div v-else>
                        <q-btn v-if="props.isEdit" :disabled="state.submitting"
                            class="button-press w-full text-lg rounded-md" flat label="Guardar cambios" type="submit" />
                        <q-btn v-else :disabled="state.submitting" class="button-press w-full text-lg rounded-md" flat
                            label="agregar" type="submit" />
                    </div>
                </div>
            </q-form>
        </div>
    </div>
</template>

<script setup>
import { computed, inject, nextTick, onMounted, reactive, ref, watch, getCurrentInstance } from "vue"
import { vMaska } from 'maska'
import NoData from "src/components/table/NoData.vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import ProcedureSelect from "src/components/select/ProcedureSelect.vue";
import DoctorSelect from "src/components/select/DoctorSelect.vue";
import ProviderSelect from "src/components/select/ProviderSelect.vue";
import { format } from "date-fns";
import { useInputDate } from "src/use/inputDate";
import { convertDateFormat, isValidDate, isValidTime } from "src/helpers/date";

const { t } = useI18n()
const $q = useQuasar()

const tableRef = ref()
const $api = inject('$api')

const props = defineProps({ id: Number, isEdit: Boolean, isDrawer: Boolean, width: String, displayAdd: Boolean, hideDetail: Boolean })
const $emit = defineEmits(['setItems', 'update', 'close'])

const state = reactive({
    item: {},
    items: [],
    submitting: false,
    timeout: null,
    timeoutRow: null,
    columns: [
        { name: 'attendance_datetime', label: t(`attendance_datetime`), field: 'attendance_datetime', align: 'left', classes: 'w-[300px]' },
        { name: 'provider_description', label: t(`provider_description`), field: 'provider_description', align: 'left', classes: 'w-[250px]' },
        { name: 'doctor_description', label: t(`doctor_description`), field: 'doctor_description', align: 'left', classes: 'w-[250px]' },
        { name: 'procedure_description', label: t(`procedure_description`), field: 'procedure_description', align: 'left' },
        { name: 'action', label: '', field: 'action', align: 'left', classes: 'w-[50px]' },
    ],
    rows: []
})

const validRows = computed(() => {
    return state.rows.filter(i => i.c_status & 4)
})

watch(() => state.rows, (val) => {

}, { deep: true })

function setItinerary() {
    state.rows = state.rows.map(i => {
        i.attendance_date_format = convertDateFormat(i.attendance_date)
        return i;
    })
    $emit("setItems", state.rows)
}

const { addMinutes, subtractMinutes, nextDate, prevDate } = useInputDate(state)

async function setDoctor(id, row) {
    try {
        const doctor = await $api.get(`doctor/${id}`)
        row.doctor_id = doctor.id;
        row.doctor_description = doctor.description;
        setItinerary()
    } catch (error) {
        console.log(error);
    }
}

function clearDoctor(row) {
    try {
        row.doctor_id = null;
        row.doctor_description = null;
        setItinerary()
    } catch (error) {
        console.log(error);
    }
}

async function setProcedure(id, row) {
    try {
        const procedure = await $api.get(`CPT/${id}`)
        const index = row.mprocedure.findIndex((i) => i.id == id)
        if (index !== -1) {
            $q.notify({
                type: 'warning',
                message: 'Procedimiento ya esta agregado'
            })
            return;
        }
        row.procedure_description = procedure.description
        row.mprocedure.push({
            id: String(procedure.id),
            code: String(procedure.code),
            description: procedure.description
        })

        setItinerary()

        setTimeout(() => {
            clearProcedure(row)
        }, 200)

    } catch (error) {
        console.log(error);
    }
}

function removeProcedure(row, id) {
    try {
        const index = row.mprocedure.findIndex((i) => i.id == id)
        row.mprocedure.splice(index, 1)
        setItinerary()
    } catch (error) {
        console.log(error);
    }
}

function clearProcedure(row) {
    try {
        row.procedure_id = null;
        row.procedure_description = null;
        setItinerary()
    } catch (error) {
        console.log(error);
    }
}

async function setProvider(id, row) {
    try {
        const provider = await $api.get(`provider/${id}`)
        row.provider_id = String(provider.id);
        row.provider_description = provider.description;
        setItinerary()

    } catch (error) {
        console.log(error);
    }
}

function clearProvider(row) {
    try {
        row.provider_id = null;
        row.provider_description = null;
        setItinerary()
    } catch (error) {
        console.log(error);
    }
}

async function removeRow(row) {
    try {
        const result = await $q.dialog({
            title: 'Confirmar',
            message: 'Deseas borrar esta fecha?',
            cancel: true,
            persistent: true
        })
        result.onOk(async () => {
            if (row.event_id) {
                await $api.delete(`itinerary/${row.id}`);
                await getItineraries()
                state.rows = state.items.map(i => {
                    if (!i.provider_description) {
                        i.provider_description = null
                        i.provider_id = null
                    }
                    if (!i.c_status) {
                        i.c_status = 4
                    }
                    return i
                });
            } else {
                const index = state.rows.findIndex(i => i.id === row.id)
                state.rows.splice(index, 1)
            }
            $q.notify({
                type: 'success',
                message: 'Fecha Removida'
            })
            setItinerary()
        })
    } catch (error) {
        console.log(error);
    }
}

async function onSubmit() {
    state.submitting = true
    try {

        for (let i = 0; i < state.rows.length; i++) {
            const item = state.rows[i];
            if (!isValidDate(item.attendance_date) || !isValidTime(item.attendance_time)) {
                continue;
            }
            if (item.event_id) {
                await $api.put(`itinerary/${item.id}`, item)
            } else {
                item.event_id = props.id;
                const response = await $api.post(`itinerary`, item)
                state.rows[i] = await $api.get(`itinerary/${response.id}`)
            }

        }
        $q.notify({
            type: 'success',
            message: 'Itinerarios Guardados'
        })
        $emit('close');
        $emit('setItems', state.rows);

    } catch (error) {
        console.log(error);
    }
    state.submitting = false;
}

const defaultItem = () => ({
    c_status: 4,
    provider_description: null,
    doctor_description: null,
    procedure_description: null,
    mprocedure: [],
    attendance_date: format(new Date(), 'dd-MM-yyyy'),
    attendance_time: '11:00',
    attendance_time_format: 'AM',
    note: null,
    new: 1
})

function addRow() {
    state.rows.push(defaultItem())
}

const style = computed(() => {
    return {
        width: props.width,
        'padding-right': props.isDrawer && '0px',
        'padding-left': props.isDrawer && '0px'
    }
})

async function getItineraries() {
    state.items = await $api.get(`itinerary`, {
        params: {
            where: {
                c_status: 4,
                event_id: state.item.id,
            },
            returnItems: true
        }
    })
}

onMounted(async () => {
    if (props.id) {
        state.item = await $api.get(`event/${props.id}`)
        await getItineraries();
    }

    if (!state.items.length) {
        state.rows = state.items.concat(Array.from({ length: 1 }, () => defaultItem()))
    } else {
        state.rows = state.items.map(i => {
            if (!i.provider_description) {
                i.provider_description = null
                i.provider_id = null
            }
            if (!i.c_status) {
                i.c_status = 4
            }
            return i
        });
    }
})

</script>