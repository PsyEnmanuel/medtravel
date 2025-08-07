<template>
    <div class="p-2 w-full">
        <div v-if="state.complete" class="island island-success">
            <h2>¡Gracias por ayudarnos a mejorar!</h2>
            <h3>Encuesta enviada exitosamente.</h3>
            <img class="success" src="~assets/success.jpg" />
        </div>
        <div v-else class="island">
            <q-form class="pb-64" ref="writeForm" @submit="onSubmit" @reset="onReset">
                <div class="flex w-full justify-center">
                    <q-img class="logo" src="~assets/logoText.png" width="220px" />
                </div>
                <p class="mb-5">FEEDBACK -YOUR OPINION IS IMPORTANT TO US!</p>
                <!-- <div class="mb-5 text-md">
                    On behalf of MEDTRAVEL, we would like to ask you a few questions regarding the medical visit you
                    had. Your answers and feedback will help us improve the quality of services provided. Completing the
                    questionnaire will not take more than a minute.
                </div> -->
                <h2 class="mb-5">MEDTRAVEL Team</h2>
                <div class="flex flex-col gap-2">
                    <template v-for="(question) in state.questions" :key="question.id">

                        <div class="subtitle">{{ question.description }}</div>

                        <template v-if="question.$poll_type_id === 279">
                            <q-input dense outlined v-model="state.item[question.id].answer_description"
                                :label="question.description" :rules="[requiredInput]" hide-bottom-space type="textarea"
                                :rows="3" @update:model-value="onAnswerText($event, question)"></q-input>
                        </template>

                        <template v-if="question.$poll_type_id === 280">
                            <q-option-group class="flex" unelevated spread v-model="state.item[question.id].value"
                                toggle-color="secondary" toggle-text-color="text-font" :options="question.answers"
                                option-label="description" @update:model-value="onAnswer($event, question)" />
                        </template>

                        <template v-if="question.$poll_type_id === 281">
                            <q-option-group class="flex" unelevated spread v-model="state.item[question.id].value"
                                toggle-color="secondary" toggle-text-color="text-font" :options="question.answers"
                                option-label="description" type="checkbox" />
                        </template>

                    </template>
                    <q-btn class="button-press w-full text-lg bg-primary text-white" flat label="agregar"
                        type="submit" />
                </div>
            </q-form>
        </div>
    </div>
</template>

<script setup>
import { inject, onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
const $api = inject("$api");

const route = useRoute()
const state = reactive({
    poll_id: 1,
    poll_description: "Encuesta de calidad",
    item: {},
    questions: [],
    loading: false,
    complete: false,
    event: {}
})

function onAnswer(id, question) {
    const index = question.answers.findIndex(i => i.value === id)
    state.item[question.id].answer_description = question.answers[index].description
    state.item[question.id].value = question.answers[index].value
    state.item[question.id].answer_id = question.answers[index].id
}

function onAnswerText($event, question) {
    state.item[question.id].answer_id = question.answers[0].id
}

async function onSubmit() {
    await $api.post("poll/web/1", {
        poll_id: state.poll_id,
        poll_description: state.poll_description,
        questions: state.item,
        ...state.event
    });
    state.item = {};
    state.complete = true;
}

async function onInit() {

    state.event = await $api.get(`comunication/poll/decrypt`, { params: route.query });

    state.questions = await $api.get(`poll/web/${state.poll_id}`);
    console.log('state.questions', state.questions);
    state.item = state.questions.reduce((total, acc) => {
        total[acc.id] = {
            description: acc.description,
            answer_id: null,
            answer_description: null,
        };
        return total;
    }, {});
    console.log('state.questions', state.item);
    state.loading = true;
}

onMounted(() => {
    onInit();
})

</script>