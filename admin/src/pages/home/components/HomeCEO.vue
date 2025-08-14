<template>
    <div v-if="!state.loading" class="grid lg:grid-cols-3 gap-1">
        <div class="lg:col-span-1 col-span-3">
            <CalendarCEO />
        </div>
        <div class="lg:col-span-2 gap-1">
            <div class="grid grid-cols-2 gap-1">
                <template v-for="tab in state.tabs" :key="tab.value">
                    <q-btn v-if="tab.visible" class="button-tab hover:shadow-left-secondary w-full text-xs" align="left" unelevated @click="state.tab = tab.value;"
                        :class="state.tab == tab.value && 'shadow-left-secondary'">
                        <div class="flex items-center w-full">
                            <q-icon :name="tab.icon"></q-icon>
                            <span class="ml-4 text-xxs md:text-md">{{ tab.label }}</span>
                        </div>
                    </q-btn>
                </template>
            </div>
            <div v-if="state.tab === 'event'">
                <ChartEvent></ChartEvent>
            </div>
            <div v-if="state.tab === 'executive_checkups'">
                <ChartChequeosEjectivos></ChartChequeosEjectivos>
            </div>
        </div>

    </div>
</template>

<script setup>
import { inject, onMounted, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ChartEvent from 'src/pages/chart/chart-event.vue';
import CalendarCEO from 'src/pages/chart/components/CalendarCEO.vue';
import ChartChequeosEjectivos from 'src/pages/chart/chart-chequeos-ejectivos.vue';
const { t } = useI18n();


const state = reactive({
    tab: 'event',
    tabs: [
        { label: t('events'), value: 'event', icon: 'fa-duotone fa-solid fa-pie-chart', visible: 1 },
        { label: t('executive_checkups'), value: 'executive_checkups', icon: 'fa-duotone fa-solid fa-pie-chart', visible: 1 },
    ],
})
</script>