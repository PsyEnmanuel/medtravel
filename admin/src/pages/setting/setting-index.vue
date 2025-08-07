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
                <div class="text-gray-800 my-2 subtitle font-bold text-center">Librerias</div>
                <div class="grid grid-cols-2 md:grid-cols-1 gap-1">
                    <template v-for="tab in state.tabsMedical" :key="tab.value">
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
                <!-- <div class="text-gray-800 my-2 subtitle font-bold text-center">
                    Herramientas</div>
                <div class="grid grid-cols-2 md:grid-cols-1 gap-1">
                    <template v-for="tab in state.tabsTools" :key="tab.value">
                        <q-btn v-if="tab.visible" class="button-tab hover:shadow-left-secondary w-full text-xs"
                            align="left" unelevated @click="state.tab = tab.value; $router.push(tab.path)"
                            :class="state.tab == tab.value && 'shadow-left-secondary'">
                            <div class="flex items-center w-full">
                                <q-icon :name="tab.icon"></q-icon>
                                <span class="ml-4 text-xxs md:text-md">{{ tab.label }}</span>
                            </div>
                        </q-btn>
                    </template>
                </div> -->
                <div class="text-gray-800 my-2 subtitle font-bold text-center">
                    Accesos</div>
                <div class="grid grid-cols-2 md:grid-cols-1 gap-1">
                    <template v-for="tab in state.tabsAccess" :key="tab.value">
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
                    <div class="text-gray-800 my-2 subtitle font-bold text-center">Datos Médicos</div>
                    <div class="grid grid-cols-2 md:grid-cols-1 gap-1">
                        <template v-for="tab in state.tabsMedical" :key="tab.value">
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
                    <div class="text-gray-800 my-2 subtitle font-bold text-center">
                        Accesos</div>
                    <div class="grid grid-cols-2 md:grid-cols-1 gap-1">
                        <template v-for="tab in state.tabsAccess" :key="tab.value">
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
        { label: t('files'), value: 'file', path: `${$path.setting}/${$path.setting_file}`, icon: 'fa-duotone fa-solid fa-sliders-simple', visible: $me.unixroles & 7 ? 1 : 1 },
    ],
    tabsMedical: [
        { label: t('speciality'), value: 'speciality', path: `${$path.setting}/${$path.setting_speciality}`, icon: 'fa-duotone fa-solid fa-stethoscope', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: t('ICD10'), value: 'ICD10', path: `${$path.setting}/${$path.setting_ICD10}`, icon: 'fa-duotone fa-solid fa-stethoscope', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: t('CPT'), value: 'CPT', path: `${$path.setting}/${$path.setting_CPT}`, icon: 'fa-duotone fa-solid fa-stethoscope', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: t('categories'), value: 'categories', path: `${$path.setting}/${$path.setting_category}`, icon: 'fa-duotone fa-solid fa-list-tree', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: t('poll'), value: 'polls', path: `${$path.setting}/${$path.setting_poll}`, icon: 'fa-duotone fa-solid fa-poll-people', visible: $me.unixroles & 3 ? 1 : 1 },
    ],
    tabsAccess: [
        { label: t('users'), value: 'users', path: `${$path.setting}/${$path.setting_user}`, icon: 'fa-duotone fa-solid fa-user-lock', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: t('roles'), value: 'roles', path: `${$path.setting}/${$path.setting_role}`, icon: 'fa-duotone fa-solid fa-shield-halved', visible: $me.unixroles & 3 ? 1 : 0 },
        { label: t('role_access'), value: 'role_access', path: `${$path.setting}/${$path.setting_accessrole}`, icon: 'fa-duotone fa-solid fa-key', visible: $me.unixroles & 1 ? 1 : 0 },
        { label: t('permission'), value: 'permission', path: `${$path.setting}/${$path.setting_permission}`, icon: 'fa-duotone fa-solid fa-user-group-simple', visible: $me.unixroles & 1 ? 1 : 0 },
        { label: t('privilege'), value: 'privilege', path: `${$path.setting}/${$path.setting_privilege}`, icon: 'fa-duotone fa-solid fa-lock', visible: $me.unixroles & 1 ? 1 : 0 },
        { label: t('logs'), value: 'logs', path: `${$path.setting}/${$path.setting_log}`, icon: 'fa-duotone fa-solid fa-user-lock', visible: $me.unixroles & 3 ? 1 : 0 },
    ],
    // tabsTools: [
    //     { label: t('Importar Polizas'), value: 'tools', path: `${$path.setting}/${$path.setting_tool_policy}`, icon: 'fa-duotone fa-solid fa-upload', visible: $me.unixroles & 3 ? 1 : 1 },
    // ],
    item: {},
    loading: true,
})

</script>