<template>
    <q-page class="px-1.5 py-2 lg:px-5 lg:py-6">
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
                    <div class="font-semibold text-xxs">{{ state.item.code }}</div>
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
                    <q-tab-panel name="medical_guide" class="p-0">
                        <div class="card px-3 py-2">
                            <EventMedicalGuide isEdit :id="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="file" class="p-0">
                        <UploadFileManager :ref_id="state.item.id" table="t_event" file_type="GENERAL" />
                        <FileManager :refId="state.item.id" refKey="t_event" />
                    </q-tab-panel>
                    <q-tab-panel name="itinerary" class="p-0">
                        <ItineraryIndex :eventId="state.item.id" width="100%" />
                    </q-tab-panel>
                    <q-tab-panel name="invoice" class="p-0">
                        <div class="card">
                            <ConciliationIndex :eventId="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="poll" class="p-0">
                        <div class="card px-3 py-2">
                            <PollEvent :id="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="log" class="p-0">
                        <div class="card px-3 py-2">
                            <LogIndex isEdit :id="state.item.id" :ref_id="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                </q-tab-panels>
            </div>
            <div class="flex flex-col w-full  md:max-w-[250px] min-w-[250px]">
                <template v-if="!state.loading">
                    <CommentTable refKey="t_event" :refId="state.item.id" :comment_state="state.item.event_state"
                        :comment_state_id="state.item.$event_state_id" />
                </template>
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import EventWrite from './components/EventWrite.vue'
import UploadFileManager from 'components/file/UploadFileManager.vue'
import FileManager from 'components/file/FileManager.vue'
import { useUpdateStore } from "src/stores/update";
import { useQuasar } from 'quasar';
import ConciliationIndex from 'src/pages/conciliation/conciliation-index.vue';
import EventIndex from 'src/pages/event/event-index.vue';
import CommentTable from 'src/pages/comment/components/CommentTable.vue';
import LogIndex from '../setting/log/log-index.vue';
import PollEvent from '../setting/poll/poll-event.vue';
import ItineraryIndex from '../itinerary/itinerary-index.vue';
import EventMedicalGuide from './components/EventMedicalGuide.vue';
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
        { label: 'Comentarios', value: 'history', icon: 'list' },
    ],
    tabs: [
        { label: 'Editar Coordinación', value: 'edit', icon: 'fa-duotone fa-solid fa-user-pen', visible: 1 },
        { label: 'Itinerario', value: 'itinerary', icon: 'fa-duotone fa-solid fa-calendar-days', visible: 1 },
        { label: 'Conciliaciones', value: 'conciliation', icon: 'fa-duotone fa-solid fa-file-lines', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: 'Guía Médica', value: 'medical_guide', icon: 'fa-duotone fa-solid fa-file-lines', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: 'Archivos', value: 'file', icon: 'fa-duotone fa-solid fa-image', visible: 1 },
        { label: 'Encuesta', value: 'poll', icon: 'fa-duotone fa-solid fa-poll-people', visible: 1 },
        { label: 'Historial', value: 'log', icon: 'fa-duotone fa-solid fa-clock-rotate-left', visible: 1 },
    ],
    tab: 'edit',
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