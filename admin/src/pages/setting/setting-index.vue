<template>
    <q-page class="md:px-5 px-2 py-6">
        <div class="flex md:flex-nowrap gap-2 break-all">
            <div v-if="$isDesktop" class="md:min-w-[200px] md:w-[200px] w-full">
                <div class="grid grid-cols-2 md:grid-cols-1 gap-1">
                    <template v-for="tab in state.tabsDic" :key="tab.value">
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
            <q-btn v-else flat class="button bg-primary-light w-full" no-caps @click="state.menuDialog = true">Menu de
                Ajuste</q-btn>
            <q-dialog v-model="state.menuDialog" position="standard">
                <div class="bg-white border-b p-2">
                    <div class="grid grid-cols-2 md:grid-cols-1 gap-1">
                        <template v-for="tab in state.tabsDic" :key="tab.value">
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
            </q-dialog>

            <div class="w-full overflow-auto">
                <router-view />
            </div>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { inject, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const $path = inject('$path')
const $me = inject('$me')

const state = reactive({
    menuDialog: false,
    tab: 'general',
    tabsDic: [
        { label: t('generals'), value: 'general', path: `${$path.setting}/${$path.setting_general}`, icon: 'fa-duotone fa-solid fa-sliders-simple', visible: $me.unixroles & 3 ? 1 : 1 },
    ],
    item: {},
    loading: true,
})

</script>