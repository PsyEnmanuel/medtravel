<template>
    <div bordered flat class="no-shadow relative flex flex-col whitespace-pre-wrap text-xs">
        <div v-if="props.row?.analytic?.length" class="flex flex-col mt-1">
            <div class="mb-1 flex flex-col">
                <div v-for="(analytic, index) in props.row?.analytic" :key="analytic" class="flex">
                    {{ index + 1 }}. <div color="default" class="text-font font-semibold">{{ analytic.description }}
                    </div>
                    <div class="text-font">{{ analytic.detail }}</div>
                </div>
            </div>
        </div>
        <div v-if="props.row?.treatment?.length" class="flex flex-col mt-1">
            <div class="mb-1 flex flex-col">
                <div v-for="(treatment, index) in props.row?.treatment" :key="treatment" class="flex flex-col">
                    <span class="flex">
                        <span>{{ index + 1 }}.</span>
                        <div color="default" class="text-font font-semibold">{{ treatment.description }}</div>
                    </span>
                    <div class="text-font">Uso: {{ treatment.detail }}</div>
                </div>
            </div>
        </div>
        <div v-if="props.row?.recomendation?.length" class="flex flex-col mt-1">
            <div class="mb-1 flex flex-col">
                <div v-for="(recomendation, index) in props.row?.recomendation" :key="recomendation"
                    class="flex flex-col">
                    <span class="flex">
                        <span>{{ index + 1 }}.</span>
                        <div color="default" class="text-font font-semibold">{{ recomendation.description }}</div>
                    </span>
                    <div class="text-font">{{ recomendation.detail }}</div>
                </div>
            </div>
        </div>
        <div v-if="props.row?.mprocedure?.length" class="flex flex-col mt-1">
            <div class="mb-1 flex flex-col">
                <div v-for="(mprocedure, index) in props.row?.mprocedure" :key="mprocedure" class="flex flex-col">
                    <span class="flex">
                        <span>{{ index + 1 }}.</span>
                        <div color="default" class="text-font font-semibold">{{ mprocedure.description }}</div>
                    </span>
                    <div class="text-font">{{ mprocedure.detail }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

import { computed, inject, onMounted, reactive } from 'vue';

const $api = inject("$api")
const props = defineProps({ row: Object })
</script>