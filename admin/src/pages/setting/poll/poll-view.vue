<template>
    <div class="grid lg:grid-cols-2 gap-4">
        <div>
            <q-btn flat class="button-press bg-primary text-white rounded-md" size="sm" :label="state.item.description"
                no-caps @click="state.diaglogPoll = true" />
            <div class="subtitle py-1">Agregar Pregunta</div>
            <q-input class="w-full border-none" dense outlined v-model="state.question.description"
                :label="$t('question')" :rules="[requiredInput]" hide-bottom-space></q-input>
            <q-btn flat class="button-press bg-primary text-white rounded-md my-2 w-full" size="sm" :label="$t('save')"
                no-caps @click="onSubmitQuestion" />
            <div v-for="question in state.questions" :key="question.id"
                class="flex items-start flex-nowrap gap-1 mb-2 bg-neutral-100 p-2 rounded-md">
                <div class="card px-1 mr-1">
                    <q-icon name="fa-duotone fa-solid fa-question"></q-icon>
                </div>
                <span class="text-xs">{{ question.description }}</span>
                <q-btn flat class="button-press bg-primary text-white rounded-md ml-auto" size="sm" :label="$t('edit')"
                    no-caps @click="state.selectedQuestionId = question.id; state.diaglogQuestion = true;" />
            </div>
        </div>
        <div v-for="(stat, key) in state.stats" :key="key" class="card mb-2">
            <ChartPoll :key="`poll-${stat.description}`" :data="stat.answers" :name="`poll-${stat.description}`"
                :title="stat.description" :subtitle="``" />
        </div>
        <q-dialog class="q-pa-none left-0" no-refocus v-model="state.diaglogQuestion"
            :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="$isDesktop ? 100 : 0">
            <q-card>
                <QuestionWrite @close="state.diaglogQuestion = false" isDrawer :id="state.selectedQuestionId" isEdit
                    :width="$isDesktop ? '400px' : '100%'" />
            </q-card>
        </q-dialog>
        <q-dialog class="q-pa-none left-0" no-refocus v-model="state.diaglogPoll"
            :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="$isDesktop ? 100 : 0">
            <q-card>
                <PollWrite @close="state.diaglogPoll = false" isDrawer :id="props.id" isEdit
                    :width="$isDesktop ? '400px' : '100%'" />
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import { inject, onMounted, reactive, ref, watch } from "vue"
import { requiredInput } from 'src/helpers/validation';
import { useUpdateStore } from "src/stores/update";
import ChartPoll from "src/components/chart/ChartPoll.vue";
import PollWrite from "./components/PollWrite.vue";
import QuestionWrite from "./components/QuestionWrite.vue";
const tableRef = ref()
const props = defineProps({ id: Number })
const $api = inject('$api')
const state = reactive({
    diaglogPoll: false,
    selectedPollId: null,
    diaglogQuestion: false,
    selectedQuestionId: null,
    item: {},
    drawer: false,
    question: {},
    stats: {},
    questions: [],
})

async function onInit() {
    state.item = await $api(`poll/${props.id}`);
}

async function getPollStats() {
    state.stats = await $api(`poll/stats`, {
        params: {
            where: {
                c_status: 4,
            },
            returnItems: true
        }
    });
    console.log(state.stats);
}

async function getQuestions() {
    state.questions = await $api(`poll-question`, {
        params: {
            where: {
                c_status: 4,
                poll_id: props.id,
            },
            returnItems: true
        }
    });
}

async function onSubmitQuestion() {
    console.log(12);
    await $api.post(`poll-question`, {
        poll_id: props.id,
        ...state.question,
    });
}

onMounted(() => {
    onInit();
    getQuestions();
    getPollStats();
})

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_poll, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>