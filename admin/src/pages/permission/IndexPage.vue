<template>
    <div class="p-2" v-if="!state.loading">
        <q-tabs v-model="state.tab" dense stretch indicator-color="transparent" align="left" :mobile-arrows="false"
            active-color="primary" active-class="active-tab">
            <q-tab name="role" content-class="p-0 w-full h-full" class="w-full">
                <template v-slot:default>
                    <q-btn flat class="button-tab text-font w-full lg:text-base text-xs" no-caps label="Roles" />
                </template>
            </q-tab>
            <q-tab name="unix" content-class="p-0 w-full ml-2" class="w-full">
                <template v-slot:default>
                    <q-btn flat class="button-tab text-font w-full lg:text-base text-xs" no-caps label="Unixperms" />
                </template>
            </q-tab>
            <q-tab name="privilege" content-class="p-0 w-full ml-2" class="w-full">
                <template v-slot:default>
                    <q-btn flat class="button-tab text-font w-full lg:text-base text-xs" no-caps label="Privilegios Roles" />
                </template>
            </q-tab>
        </q-tabs>
        <q-tab-panels v-model="state.tab" class="bg-transparent">
            <q-tab-panel name="role" class="p-0">
                <RolePermission :table="state.tables.tables_roles" :role="state.role" />
            </q-tab-panel>
            <q-tab-panel name="unix" class="p-0">
                <UnixPermission :table="state.tables.tables_unixperms" :permission="state.permission" />
            </q-tab-panel>
            <q-tab-panel name="privilege" class="p-0">
                <RolePrivilege :table="state.tables.tables_unixperms" :role="state.role" />
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>

<script setup>
import { inject, onMounted, reactive } from 'vue';
import RolePermission from './components/RolePermission.vue'
import UnixPermission from './components/UnixPermission.vue'
import RolePrivilege from './components/RolePrivilege.vue'

const $api = inject('$api')

const state = reactive({
    loading: true,
    tab: 'role',
    tables: {},
    permission: {},
    role: []
})

onMounted(async () => {
    state.tables = await $api.get('/permission/tables')
    state.role = await $api.get('role')
    state.permission = await $api.get('permission');
    state.loading = false
})
</script>