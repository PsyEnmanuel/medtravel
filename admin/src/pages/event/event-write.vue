<template>
    <q-page class="px-1.5 py-2 lg:px-5 lg:py-6">
        <div class=""></div>
        <div class="flex md:flex-nowrap gap-2 break-all">
            <div class="w-full md:max-w-[200px] min-w-[200px]">
                <div v-if="state.item.profile" class="relative">
                    <q-img class="card w-full max-h-[128px] object-contain" :src="state.item.profile.url"
                        spinner-color="white" />
                    <q-btn flat class="absolute top-0 right-0 button-icon bg-primary text-white rounded-md" size="sm"
                        no-caps @click="removeProfile" icon="fa-solid fa-xmark">
                        <q-tooltip class="bg-default text-black text-xs">Remover Linea</q-tooltip>
                    </q-btn>
                </div>
                <div class="card rounded-md flex flex-col py-2 px-3 mb-1 mt-1">
                    <div class="font-semibold text-xs">{{ state.item.event_state }}</div>
                    <div class="font-semibold text-xxs">{{ state.item.ident_no }}</div>
                    <div class="flex justify-between gap-2">
                        <div>{{ state.item.sex }}</div>
                        <div>{{ state.item.age }}</div>
                    </div>
                    <div class="flex justify-between gap-2">
                        <div>#{{ state.item.code }}</div>
                        <div>{{ state.item.birthdate }}</div>
                    </div>
                </div>
                <div class="grid gap-1 my-1">
                    <template v-for="tab in state.tabs" :key="tab.value">
                        <q-btn v-if="tab.visible" class="button-tab hover:shadow-left-secondary w-full text-xs"
                            align="left" unelevated @click="state.tab = tab.value"
                            :class="state.tab == tab.value && 'shadow-left-secondary bg-primary text-white'">
                            <div class="flex items-center justify-between w-full">
                                <div class="flex items-center w-full">
                                    <q-icon :name="tab.icon"></q-icon>
                                    <span class="ml-4 md:text-md font-bold pt-1.5">{{ tab.label }}</span>
                                </div>
                            </div>
                        </q-btn>
                    </template>
                </div>
            </div>
            <div class="w-full overflow-hidden">
                <q-tab-panels v-if="!state.loading" v-model="state.tab" class="bg-transparent">
                    <q-tab-panel name="edit" class="p-0">
                        <div class="card px-3 py-2">
                            <EventWrite isEdit :id="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="event" class="p-0">
                        <EventIndex :eventId="state.item.id" width="100%" />
                    </q-tab-panel>
                    <q-tab-panel name="file" class="p-0">
                        <UploadFileManager :ref_id="state.item.id" table="t_event" file_type="GENERAL" />
                        <FileManager :refId="state.item.id" refKey="t_event" />
                    </q-tab-panel>
                    <q-tab-panel name="event" class="p-0">
                        <EventTable :eventId="state.item.id" width="100%" />
                    </q-tab-panel>
                    <q-tab-panel name="invoice" class="p-0">
                        <div class="card">
                            <ConciliationIndex :eventId="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                </q-tab-panels>
            </div>
            <!-- <div class="flex flex-col w-full  md:max-w-[350px] min-w-[350px]">
                <div class="grid grid-cols-2 gap-1">
                    <q-btn class="button-tab hover:shadow-secondary w-full text-xs" align="left" unelevated
                        v-for="tab in state.tabsList" :key="tab.value" @click="state.tabList = tab.value"
                        :class="state.tabList == tab.value && 'shadow-secondary'">
                        <div class="flex flex-nowrap justify-between w-full">
                            <span class="md:text-xs line-clamp-1">{{ tab.label }}</span>
                            <q-icon :name="tab.icon" size="xs"></q-icon>
                        </div>
                    </q-btn>
                </div>
                <template v-if="!state.loading">
                    <ListHistory v-if="state.tabList === 'history'" :id="state.item.id" />
                    <ListPrescription v-if="state.tabList === 'prescription'" :id="state.item.id" />
                </template>
            </div> -->
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import EventWrite from './components/EventWrite.vue'
import UploadFileManager from 'components/file/UploadFileManager.vue'
import FileManager from 'components/file/FileManager.vue'
import { useUpdateStore } from "src/stores/update";
import { useQuasar } from 'quasar';
import ConciliationIndex from 'src/pages/conciliation/conciliation-index.vue';
import EventIndex from 'src/pages/event/event-index.vue';
import EventTable from '../event/components/EventTable.vue';
const $q = useQuasar()
const $api = inject('$api')
const $me = inject('$me')
const props = defineProps({
    id: String
})

const state = reactive({
    loading: true,
    timeout: null,
    tabsList: [
        { label: 'Seguimiento', value: 'history', icon: 'list' },
        { label: 'Prescripciones', value: 'prescription', icon: 'list' },
    ],
    tabs: [
        { label: 'Editar Coordinación', value: 'edit', icon: 'fa-duotone fa-solid fa-user-pen', visible: 1 },
        { label: 'Coordinaciones', value: 'event', icon: 'fa-duotone fa-solid fa-arrow-progress', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: 'Calendario', value: 'calendar', icon: 'fa-duotone fa-solid fa-calendar', visible: $me.unixroles & 3 ? 1 : 0 },
        { label: 'Conciliaciones', value: 'conciliation', icon: 'fa-duotone fa-solid fa-file-lines', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: 'Archivos', value: 'file', icon: 'fa-duotone fa-solid fa-image', visible: 1 },
    ],
    tab: 'edit',
    tabList: 'history',
    item: {},
    dialogWrite: false,
    dialogPassword: false,
})

async function onInit() {
    state.item = await $api.get(`event/${props.id}`)
    state.loading = false
}

async function removeProfile() {
    try {
        const response = await $api.delete(`file/${state.item.profile.id}`, { data: { ref_key: 't_event', ref_id: state.item.id } })
    } catch (error) {
        console.log(error);
    }
}

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_event, (data) => {
    if (data.id === state.item.id) {
        onInit()
    }
}, { deep: true })

onMounted(() => {
    onInit()
})

</script>