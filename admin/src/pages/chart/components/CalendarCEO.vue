<template>
    <div class="flex flex-col gap-1">
        <div class="subtitle bg-primary text-white">ITINERARIO DEL DÍA</div>
        <div class="h-[150px]">
            <vue-cal class="vuecal-small" ref="vuecal" :events="state.eventsMonth"
                v-model:selected-date="state.selectedDate" hide-view-selector :time="false" active-view="month" xsmall
                locale="es" :transitions="false" @cell-click="onCellClickSmall" @ready="fetchEventsMonth"
                @view-change="fetchEventsMonth" :disableViews="['week', 'day']">
                <template #arrow-prev>
                    <i class="icon material-icons">arrow_back</i>
                </template>
                <template #arrow-next>
                    <i class="icon material-icons">arrow_forward</i>
                </template>
            </vue-cal>
        </div>
        <div class="flex flex-col gap-1">
            <UserSelect @setUser="state.query.where.user_id = $event" @clearUser="state.query.where.user_id = null"
                :model-value="state.user_description" label="Coordinador" :unixroles="24"
                @update:model-value="getStats()" />
            <ProcedureSelect class="mb-1" @setProcedure="setProcedure($event)" @clearProcedure="clearProcedure()"
                :model-value="state.procedure_description" />
        </div>
        <div class="bg-white card rounded-xs main-calendar">
            <VueCal ref="vuecal" :time="false" :events="state.events" v-model:selected-date="state.startCalendar"
                v-model:active-view="state.activeView" hideViewSelector locale="es" :disable-views="['years', 'year']"
                :twelve-hour="true" :editable-events="false" :hide-weekdays="state.calendar.hideWeekDay"
                :drag-to-create-event="false" :dblclick-to-navigate="false" @ready="fetchEvents"
                @cell-click="onCellClick" @view-change="fetchEvents" events-on-month-view="short">

                <template v-slot:weekday-heading="scope">
                    <div class="flex items-center">
                        <template v-if="scope.view.id === 'month'">
                            {{ scope.heading.label }}
                        </template>
                        <template v-else>
                            {{ scope.heading.label }} {{ getDate(scope.heading.date) }}
                            <q-btn class="button-icon bg-default ml-2" flat icon="fa-solid fa-magnifying-glass"
                                size="xs" @click.stop="state.dayDate = scope.heading.date; state.dialogDetail = true;"
                                round><q-tooltip class="bg-default text-black text-xs">Vista tabla</q-tooltip></q-btn>
                        </template>
                    </div>
                </template>

                <template v-slot:event="scope">
                    <template v-if="['day', 'week'].includes(scope.view)">
                        <ItineraryCard :item="scope.event" @selected="state.selectedId = $event; state.dialogWrite = true;"
                            @openItinerary="onOpenItinerary" />
                    </template>
                    <div class="flex w-full cursor-pointer relative" v-else>
                        <span class="text-[10px] w-full text-left px-1 line-clamp-1 ml-1"
                            @click.stop.prevent="state.selectedId = scope.event.id; state.dialogWrite = true;">{{
                                scope.event.request_time
                            }} {{ scope.event.contact_description }}</span>
                        <div class="absolute left-0 top-0 h-full w-[4px]" :class="scope.event.color"></div>
                    </div>
                </template>

                <template #cell-content="scope">
                    <span v-if="['week'].includes(scope.view.id)">
                        <div v-if="!scope.events.length">
                            No Hay Coordinaciones
                        </div>
                    </span>
                </template>

            </VueCal>
        </div>
    </div>
    <q-dialog class="q-pa-none left-0" v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'"
        full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <EventWrite isDrawer @close="state.dialogCreate = false" :width="$isDesktop ? '100%' : '100%'"
                :timestamp="state.timestampSelected" :userId="state.query.where.user_id" />
        </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'"
        full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <EventWrite isDrawer @submit="state.dialogWrite = false" @close="state.dialogWrite = false" isEdit
                :id="state.selectedId" :width="$isDesktop ? '100%' : '100%'" />
        </q-card>
    </q-dialog>
    <q-dialog class="q-pa-none left-0" v-model="state.dialogWriteItinerary"
        :position="$isDesktop ? 'right' : 'standard'" full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <EventWriteItinerary isDrawer @submit="state.dialogWriteItinerary = false"
                @close="state.dialogWriteItinerary = false;" isEdit :id="state.selectedItinerary"
                :width="$isDesktop ? '400px' : '100%'" />
        </q-card>
    </q-dialog>
    <q-dialog class="q-pa-none left-0" no-refocus v-model="state.dialogSearchEvent"
        :position="$isDesktop ? 'right' : 'standard'" full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <ItineraryList @close="state.dialogSearchEvent = false" isDrawer
                @edit="state.dialogSearchEvent = false; state.selectedId = $event; state.dialogWrite = true;"
                :width="$isDesktop ? '400px' : '100%'" />
        </q-card>
    </q-dialog>
    <q-dialog v-model="state.dialogDetail" full-width>
        <div class="bg-white card p-4">
            <EventTableDay :user="state.user" :date="state.dayDate"
                @edit="state.selectedItinerary = $event; state.dialogWriteItinerary = true" />
        </div>
    </q-dialog>
    <q-dialog class="q-pa-none left-0" no-refocus v-model="state.dialogInsuredList"
        :position="$isDesktop ? 'right' : 'standard'" full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <InsuredList :event="state.selectedEvent" :width="$isDesktop ? '400px' : '100%'" />
        </q-card>
    </q-dialog>

    <q-dialog v-model="state.dialogItinerary" full-height maximized>
        <q-card class="shadow pt-4 px-6 pb-4 flex-col w-[400px]">
            <EventItinerary displayAdd isEdit :id="state.eventSelectedId" isDrawer
                @close="state.dialogItinerary = false" @update="updateCalendar" />
        </q-card>
    </q-dialog>

</template>

<script setup>
import { ref, reactive, computed, onMounted, inject, watch, nextTick } from 'vue';
import { format, getDate, isValid, startOfMonth, startOfDay } from 'date-fns';
import EventWrite from 'src/pages/event/components/EventWrite.vue';
import EventTableDay from 'src/pages/event/components/EventTableDay.vue';
import InsuredList from 'src/pages/insured/components/InsuredList.vue';
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
const $api = inject('$api')
const $isDesktop = inject('$isDesktop')
const vuecal = ref()
import { useUpdateStore } from 'src/stores/update';
import EventItinerary from 'src/pages/event/components/EventItinerary.vue';
import EventWriteItinerary from 'src/pages/event/components/EventWriteItinerary.vue';
import UserSelect from 'src/components/select/UserSelect.vue';
import ProcedureSelect from 'src/components/select/ProcedureSelect.vue';
import ItineraryCard from 'src/pages/itinerary/components/ItineraryCard.vue';
import ItineraryList from 'src/pages/itinerary/components/ItineraryList.vue';

const state = reactive({
    yesterday: startOfDay(new Date()),
    eventsMonth: [],
    selectedId: 0,
    selectedItinerary: 0,
    searchKeys: '',
    activeView: 'day',
    startCalendar: new Date(),
    users: [],
    user: {},
    dialogItinerary: false,
    dialogWriteItinerary: false,
    dialogDetail: false,
    dialogCreate: false,
    dialogInsuredList: false,
    columnSelected: 0,
    timestampSelected: 0,
    eventSelectedId: null,
    selectedEvent: {},
    events: [],
    loading: true,
    dialogSearchEvent: false,
    dayDate: null,
    calendar: {
        timeStep: 15,
        snapToTime: 30,
        timeCellHeight: 70,
        timeFrom: 8 * 60,
        timeTo: 19 * 60,
        hideWeekDay: [],
    },
    query: {
        order: {
            attendance_datetime: "ASC"
        },
        join: [{
            table: 't_event',
            relationA: 't_event.id',
            relationB: 't_itinerary.event_id',
        }],
        group_by: 't_itinerary.id',
        where: {
            't_itinerary.c_status': [4],
            't_event.c_status': [4],
            user_id: null,
            "gt:attendance_datetime": format(startOfDay(new Date()), 'yyyy-MM-dd'),
            "lt:attendance_datetime": format(startOfDay(new Date()), 'yyyy-MM-dd'),
        },
    },
    queryMonth: {
        order: {
            attendance_datetime: "ASC"
        },
        join: [],
        group_by: 't_itinerary.id',
        where: {
            c_status: [4],
            user_id: null,
            "gt:attendance_datetime": format(startOfMonth(new Date()), 'yyyy-MM-dd'),
            "lt:attendance_datetime": format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        },
    },
})

watch(() => state.query.where, async (curr) => {
    getEvents()
    getEventsMonth()
}, { deep: true })

watch(() => state.queryMonth.where, async (curr) => {
    getEventsMonth()
}, { deep: true })

async function setProcedure(id) {
    try {
        state.query.where['js:mprocedure'] = id
    } catch (error) {
        console.log(error);
    }
}

function clearProcedure() {
    try {
        state.query.where['js:mprocedure'] = null
    } catch (error) {
        console.log(error);
    }
}

async function onOpenItinerary(item) {
    try {
        state.eventSelectedId = item.id;
        state.dialogItinerary = true;
    } catch (error) {
        console.log(error);
    }
}

function isActiveView(key) {
    return state.activeView === key
}

function onCellClick(event) {
    if (vuecal.value.isMonthView) {
        return;
    } else {
        if (!isValid(event)) {
            return;
        }
        state.timestampSelected = event
        state.dialogCreate = true;
    }
}

async function onInit() {

    const res = await $api.get('user', {
        params: {
            order: {
                description: "ASC"
            },
            group_by: 't_user.id',
            where: {
                c_status: 4,
                'bi:unixroles': 4
            },
        }
    })

    state.users = res.items.map((opt) => ({
        ...opt,
        value: opt.id,
        label: opt.description,
    }));

}

async function getEvents() {
    const itineraries = await $api.get('itinerary', {
        params: {
            ...state.query,
            returnItems: true
        },
    })
    state.events = itineraries.map(i => ({ ...i, start: i.start_calendar, end: i.start_calendar }))
}

async function getEventsMonth() {
    const eventsMonth = await $api.get('itinerary', {
        params: {
            ...state.queryMonth,
            returnItems: true
        },
    })
    state.eventsMonth = eventsMonth.map(i => ({ ...i, start: i.start_calendar, end: i.start_calendar }))
}

async function fetchEvents(calendar) {
    try {
        state.query.where['gt:attendance_datetime'] = calendar.startDate
        state.query.where['lt:attendance_datetime'] = calendar.endDate
    } catch (error) {
        console.log(error)
    }

}

async function fetchEventsMonth(calendar) {
    try {
        state.queryMonth.where['gt:attendance_datetime'] = calendar.startDate
        state.queryMonth.where['lt:attendance_datetime'] = calendar.endDate
    } catch (error) {
        console.log(error)
    }

}

function onCellClickSmall(event) {
    state.startCalendar = event
    state.activeView = 'day'
}

function updateCalendar() {
    getEvents()
}

onMounted(() => {
    onInit()
})

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_event, (data) => {
    getEvents()
    // getEventsMonth()
}, { deep: true })

</script>