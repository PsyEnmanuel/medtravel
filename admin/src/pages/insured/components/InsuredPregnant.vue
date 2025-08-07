<template>
    <div class="flex flex-nowrap justify-between items-start gap-2 py-2">
        <div class="flex flex-col justify-end gap-1 leading-3">
            <p class="text-2xl text-info">Editar Maternidad por Semanas</p>
            <div>Semana de embarazo: <q-badge>{{ state.week }}</q-badge></div>
        </div>
        <q-btn flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
    </div>
    <div class="grid grid-cols-2 gap-2">
        <div v-for="item in props.pregnant_data" :key="item.weeks" :class="isWeekInRange(state.week, item.weeks) ? 'bg-sky-50' : ''">
            <div>
                <div class="subtitle bg-primary text-white flex justify-between gap-1 px-4 mb-2">
                    <span>{{ item.title }}</span>
                    <span>Semanas: {{ item.weeks }}</span>
                </div>

                <q-date class="w-full " ref="desirable_dates" flat v-model="item.range" range multiple
                    years-in-month-view minimal event-color="orange" />
                <div class="grid grid-cols-5 gap-4 mb-2" v-for="row in item.items" :key="row.text">
                    <q-checkbox class="col-span-3" v-model="row.completed">{{ row.text }}</q-checkbox>
                    <q-input v-if="row.completed" class="col-span-2" dense outlined v-model="row.value"
                        placeholder="Comentario"></q-input>
                </div>
            </div>
        </div>
    </div>
    <div></div>
</template>

<script setup>
import { convertToValidDate } from 'src/helpers/date';
import { onMounted, reactive } from 'vue';

const props = defineProps({ id: Number, pregnant_data: Array, pregnant_start: Date })

const state = reactive({
    weeks: [],
    week: null
})

function isWeekInRange(week, rangeStr) {
    const cleaned = rangeStr.trim().replace('+', '');
    const [startStr, endStr] = cleaned.split(/[-–]/);

    const start = parseInt(startStr);
    const end = endStr ? parseInt(endStr) : 99; // if it's "41+" or "41", treat upper limit as 99

    return week >= start && week <= end;
}

function generatePregnancyWeeks(fum, totalWeeks = 40) {
    fum = convertToValidDate(fum)
    const startDate = new Date(fum);

    const weeks = [];

    for (let i = 0; i < totalWeeks; i++) {
        const startOfWeek = new Date(startDate);
        startOfWeek.setDate(startDate.getDate() + i * 7);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        weeks.push({
            week: i + 1,
            start: startOfWeek.toISOString().slice(0, 10),
            end: endOfWeek.toISOString().slice(0, 10),
        });
    }

    return weeks;
}

function getCurrentPregnancyWeek(startDateStr) {
    startDateStr = convertToValidDate(startDateStr)
    const start = new Date(startDateStr);
    const today = new Date();

    if (isNaN(start)) return null;

    const diffInMs = today - start;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const week = Math.floor(diffInDays / 7) + 1;

    return week > 0 ? week : 0;
}

function getDateRangeFromWeekRange(startDateStr, weekRangeStr) {
    startDateStr = convertToValidDate(startDateStr)
    if (!startDateStr || !weekRangeStr) return [null, null];

    const normalized = weekRangeStr.replace('+', '');
    const [startWeek, endWeekRaw] = normalized.split(/[-–]/).map(Number);
    const endWeek = endWeekRaw || startWeek; // if it's just "41+", treat as week 41 only

    const startDate = new Date(startDateStr);
    if (isNaN(startDate)) return [null, null];

    const start = new Date(startDate);
    start.setDate(start.getDate() + (startWeek - 1) * 7);

    const end = new Date(startDate);
    end.setDate(end.getDate() + (endWeek - 1) * 7 + 6);

    return [{
        from: start.toISOString().slice(0, 10).replace(/-/g, "/"),
        to: end.toISOString().slice(0, 10).replace(/-/g, "/"),
    }];
}

onMounted(() => {
    state.week = getCurrentPregnancyWeek(props.pregnant_start)
    console.log(1, state.week);
    state.weeks = generatePregnancyWeeks(props.pregnant_start);
    for (let i = 0; i < props.pregnant_data.length; i++) {
        const data = props.pregnant_data[i];
        props.pregnant_data[i].range = getDateRangeFromWeekRange(props.pregnant_start, data.weeks)
    }
})

</script>