<template>
    <q-page class="md:px-5 px-2 py-6">
        <div class="flex md:flex-nowrap gap-2 break-all">
            <div class="md:min-w-[200px] md:w-[200px] w-full">
                <div class="grid grid-cols-2 md:grid-cols-1 gap-1">
                    <template v-for="tab in state.tabs" :key="tab.value">
                        <q-btn v-if="tab.visible" class="button-tab hover:shadow-left-secondary w-full text-xs"
                            align="left" unelevated @click="state.tab = tab.value; $router.push(tab.path)"
                            :class="state.tab == tab.value && 'shadow-left-secondary'">
                            <div class="flex items-center w-full">
                                <q-icon :name="tab.icon"></q-icon>
                                <span class="ml-4 text-xxs md:text-md">{{ tab.label }}</span>
                            </div>
                        </q-btn>
                    </template>
                </div>
            </div>
            <div class="w-full overflow-auto">
                <router-view />
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { inject, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
const $path = inject('$path')
const { t } = useI18n()
const $me = inject("$me")

const state = reactive({
    tab: $me.unixroles & 16 ? 'executive_checkups' : 'event',
    tabs: [
        { label: t('insureds'), value: 'insured', path: `${$path.chart}/${$path.chart_insured}`, icon: 'fa-duotone fa-solid fa-pie-chart', visible: $me.unixroles & 5 ? 1 : 0 },
        { label: t('events'), value: 'event', path: `${$path.chart}/${$path.chart_event}`, icon: 'fa-duotone fa-solid fa-pie-chart', visible: $me.unixroles & 15 ? 1 : 0 },
        { label: t('executive_checkups'), value: 'executive_checkups', path: `${$path.chart}/${$path.chart_executive_checkups}`, icon: 'fa-duotone fa-solid fa-pie-chart', visible: $me.unixroles & 21 ? 1 : 0 },
        { label: t('policies'), value: 'policy', path: `${$path.chart}/${$path.chart_policy}`, icon: 'fa-duotone fa-solid fa-pie-chart', visible: $me.unixroles & 7 ? 1 : 0 },
    ],
    item: {},
    loading: true,
})

</script>