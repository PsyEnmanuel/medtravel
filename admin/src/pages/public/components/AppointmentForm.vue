<template>
    <div class="bg-[#FBFCFD] h-screen w-full flex justify-center items-center event-public">
        <div class="lg:card flex lg:flex-nowrap lg:w-[80%] w-full min-h-[80%] bg-white text-[#1a1a1a]">

            <div class="lg:p-8 p-4 min-w-[300px] flex flex-col" style="border-right: 1px solid #0000001f;">
                <q-img class="max-h-[256px] max-w-[256px] object-contain mx-auto mb-4" src="~assets/logoText.png"
                    spinner-color="white" />
                <q-separator class="mb-4"></q-separator>
                <span class="text-xl font-bold mb-4">COORDINACIONES {{ state.doctor.description }}</span>
                <div class="flex mb-4">
                    <q-icon class="mr-4" name="sym_o_location_on" size="32px"></q-icon>
                    <div>C. Del Monte y Tejada #90, <br />Bajos de Haina 91000</div>
                </div>
                <p class="mb-4 leading-5">Nos alegra que quieras agendar una coordinación, para nosotros es importante
                    recibirte en Dermathoclinic.</p>
                <p class="mb-4 leading-5">Por favor selecciona la fecha marcada en azul más conveniente para ti,
                    para que puedas ver los horarios
                    disponibles. </p>

                <q-btn class="button-tab rounded-lg mt-auto w-[100px]" outline flat @click="$emit('close')">
                    <div class="flex justify-between items-center w-full">
                        <q-icon name="arrow_back_ios"></q-icon>
                        <span>atrás</span>
                    </div>
                </q-btn>
            </div>

            <div class="p-8 lg:min-w-[400px]" style="border-right: 1px solid #0000001f;">
                <div class="flex flex-col">
                    <VueCal v-show="!state.loading" ref="vuecal" v-model:selected-date="state.start"
                        :events="state.eventsMonth" :disableDays="state.disableDays" :min-date="state.minDate" small
                        hide-view-selector :dblclick-to-navigate="false" :time="false" :transitions="false"
                        active-view="month" :disable-views="['years', 'year', 'week']" locale="es"
                        @cell-click="onCellClick" @ready="fetchEvents" @view-change="fetchEvents">
                        <template #arrow-prev>
                            <i class="icon material-icons">arrow_back</i>
                        </template>

                        <template #arrow-next>
                            <i class="icon material-icons">arrow_forward</i>
                        </template>
                    </VueCal>
                    <div v-show="state.loading" style="height: 400px">
                    </div>
                </div>
            </div>

            <div class="p-4 flex flex-col w-full">
                <div class="w-full mb-4">{{ state.startCalendarReadable }}</div>

                <template v-if="state.selectedEvent">
                    <span class="subtitle w-full mb-2 text-center">{{ state.selectedEvent.start_time }}</span>
                    <q-form class="w-full" ref="writeForm" @submit="onSubmit" @reset="onReset" autofocus>
                        <q-input ref="mainInput" class="mb-2" dense outlined v-model="state.item.ident_no"
                            label="Cédula" :rules="[requiredInput]" hide-bottom-space></q-input>
                        <q-input class="mb-2" dense outlined v-model="state.item.contact_description" label="Nombre*"
                            :rules="[requiredInput]" hide-bottom-space></q-input>
                        <q-input class="mb-2" dense outlined v-model="state.item.phone" label="Teléfono*"
                            :rules="[requiredInput]" hide-bottom-space></q-input>
                        <q-input class="mb-2" dense outlined v-model="state.item.email" label="Correo electrónico"
                            :rules="[requiredInput]" hide-bottom-space></q-input>
                        <q-input class="mb-2" dense outlined v-model="state.item.event_reason"
                            label="Motivo de Consulta*" type="textarea" rows="4" :rules="[requiredInput]"
                            hide-bottom-space></q-input>
                        <q-btn class="button-press bg-primary text-white w-full rounded-lg mb-2 h-[48px]" outline flat
                            type="submit">Programar Coordinación</q-btn>
                    </q-form>
                </template>

                <template v-else-if="state.eventsDay.length">
                    <div class="subtitle mb-2">Horarios Disponibles</div>
                    <q-btn v-for="event in state.eventsDay" :key="event.id" class="button rounded-lg mb-2" outline flat
                        @click="onSelectEvent(event)">{{ event.start_time }}</q-btn>
                </template>
            </div>
        </div>
        <div class="pb-[100px]" ref="availableHour">
            &nbsp;
        </div>
    </div>

    <q-dialog v-model="state.dialog">
        <q-card class="shadow pt-4 px-6 pb-4 flex-col w-[400px]">
            <div class="flex items-center">
                <q-icon name="event" size="32px"></q-icon>
                <div class="font-bold text-lg text-font ml-2">Coordinación agendada</div>
            </div>
            <div>{{ state.startCalendarReadable }} {{ state.selectedEvent.start_time }}</div>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { format, startOfMonth, endOfMonth, addDays, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { requiredInput } from 'src/helpers/validation';
import { inject, onMounted, watch, reactive, ref } from 'vue';
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
const props = defineProps({ id: Number, description: String })
const $api = inject("$api")
const vuecal = ref()
const availableHour = ref()
const minDate = addDays(new Date(), 2)
const mainInput = ref();

const initialItem = () => ({
    ident_no: null,
    contact_description: "",
    event_reason: "",
    phone: "",

})

const state = reactive({
    dialog: false,
    start: new Date(),
    loading: true,
    item: initialItem(),
    doctor: {},
    minDate,
    startCalendar: null,
    startCalendarReadable: null,
    selectedEvent: null,
    eventsMonth: [],
    eventsDay: [],
    disableDays: [],
    queryMonth: {
        order: {
            start: "ASC"
        },
        join: [],
        group_by: 't_event.id',
        where: {
            booking: 1,
            c_status: [4],
            user_id: props.id,
            "gt:start": format(new Date(minDate), 'yyyy-MM-dd HH:mm'),
            "lt:end": format(endOfMonth(new Date()), 'yyyy-MM-dd HH:mm'),
        },
    },
})

watch(() => state.item.ident_no, async (val) => {

    if (val) {
        const ident_no = val.replace(/\D/g, '');
        if (ident_no.length === 11) {
            const result = await $api.get(`insured/public/${ident_no}`);
            state.item.birthdate = result.birthdate;
            state.item.contact_description = result.description;
            state.item.$sex_id = result.$sex_id;
            state.item.phone = result.phone;
            state.item.email = result.email;

        } else {
            state.item.phone = null;
            state.item.email = null;
            state.item.birthdate = null;
            state.item.$sex_id = null;
        }
    }
})

async function fetchEvents(calendar) {
    state.loading = true
    state.queryMonth.where['gt:start'] = calendar.startDate
    state.queryMonth.where['lt:end'] = calendar.endDate
    state.queryMonth.where.user_id = props.id
    const eventsMonth = await $api.get('event/public', {
        params: {
            ...state.queryMonth,
            returnItems: true
        },
    })
    state.eventsMonth = eventsMonth.map(i => ({ ...i, start: i.start_calendar, end: i.end_calendar }))

    const dictionary = state.eventsMonth.reduce((acc, curr) => {
        const targetDate = format(new Date(curr.start), 'yyyy-MM-dd')
        if (!acc[targetDate]) {
            acc[targetDate] = true
        }
        return acc;
    }, {})
    state.disableDays = vuecal.value.allDayBar.cells.filter(i => {
        if (!dictionary[i.formattedDate]) {
            return i.formattedDate
        } else {
            return false;
        }
    }).map(i => i.formattedDate)
    state.loading = false
    mainInput.value.focus()
}


function onCellClick(event) {
    state.selectedEvent = null;
    const start = format(event, 'yyyy-MM-dd')
    state.startCalendar = event
    state.startCalendarReadable = format(event, 'EEEE, d \'de\' MMMM', { locale: es })
    state.eventsDay = state.eventsMonth.filter(i => {
        const targetDate = format(new Date(i.start), 'yyyy-MM-dd')
        return targetDate === start
    })
    availableHour.value.scrollIntoView(true);
}

function onSelectEvent(event) {
    state.selectedEvent = event
}

async function onSubmit() {
    try {
        const response = await $api.put(`event/public/${state.selectedEvent.id}`, state.item);
        if (response) {
            state.dialog = true
            setTimeout(() => {
                location.reload()
            }, 3000);
        }
    } catch (error) {
        console.log(error);
    }
}

onMounted(() => {
    state.doctor.id = props.id
    state.doctor.description = props.description
})

</script>

<style lang="scss">
.event-public {

    .vuecal {
        border: none;
        box-shadow: none;
    }

    .vuecal__cell:before {
        border: none;
    }

    .vuecal__title-bar {
        background-color: transparent;
    }

    .vuecal__flex .vuecal__cell-content {
        height: 48px;
    }

    /* Cell background indicator */
    .vuecal__cell:not(.vuecal__cell--disabled) {
        .vuecal__flex.vuecal__cell-content {
            background-color: #38bdf8;
            color: white;
            font-weight: bold;
            border-radius: 48px;
            cursor: pointer;

            &:hover {
                background-color: #184a6d;
            }
        }
    }

    .vuecal__cell-events-count {
        display: none;
    }
}
</style>