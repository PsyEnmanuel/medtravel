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
                <UploadFileManager v-else :ref_id="state.item.id" table="t_contact"
                    icon="fa-duotone fa-solid fa-camera-retro" :avaliable_file_text="false" text="Subir foto de perfil"
                    file_type="FOTO PERFIL" />
                <div class="card rounded-md flex flex-col py-2 px-3 mb-1 mt-1">
                    <div class="font-semibold text-xs">{{ state.item.description }}</div>
                    <div class="flex justify-between gap-2">
                        <div>{{ state.item.sex }}</div>
                        <div>{{ state.item.age }}</div>
                    </div>
                    <div class="flex justify-between gap-2">
                        <div>#{{ state.item.code }}</div>
                        <div>{{ state.item.insurance }}</div>
                    </div>
                </div>
                <div class="grid gap-1 my-1">
                    <template v-for="tab in state.tabs" :key="tab.value">
                        <q-btn v-if="tab.visible" class="button-tab hover:shadow-left-primary w-full text-xs"
                            align="left" unelevated @click="state.tab = tab.value"
                            :class="state.tab == tab.value && 'shadow-left-primary bg-default text-primary'">
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
            <div class="w-full">
                <q-tab-panels v-if="!state.loading" v-model="state.tab" class="bg-transparent">
                    <q-tab-panel name="edit" class="p-0">
                        <div class="card px-3 py-2">
                            <ContactWrite isEdit :id="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="file" class="p-0">
                        <UploadFileManager :ref_id="state.item.id" table="t_contact" file_type="GENERAL" />
                        <FileManager :refId="state.item.id" refKey="t_contact" />
                    </q-tab-panel>
                    <q-tab-panel name="event" class="p-0">
                        <EventTable :contactId="state.item.id" width="100%" />
                    </q-tab-panel>
                    <q-tab-panel name="invoice" class="p-0">
                        <div class="card">
                            <ConciliationIndex :contactId="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                </q-tab-panels>
            </div>
            <div class="flex flex-col w-full  md:max-w-[250px] min-w-[250px]">
                <template v-if="!state.loading">
                    <CommentTable refKey="t_contact" :refId="state.item.id" />
                </template>
            </div>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import ContactWrite from './components/ContactWrite.vue'
import UploadFileManager from 'components/file/UploadFileManager.vue'
import FileManager from 'components/file/FileManager.vue'
import { useUpdateStore } from "src/stores/update";
import { useQuasar } from 'quasar';
import ConciliationIndex from 'src/pages/conciliation/conciliation-index.vue';
import EventTable from '../event/components/EventTable.vue';
import CommentTable from '../comment/components/CommentTable.vue';
const $q = useQuasar()
const $api = inject('$api')
const $me = inject('$me')

const props = defineProps({
    id: String
})

const state = reactive({
    loading: true,
    timeout: null,
    tabs: [
        { label: 'Editar Contacto', value: 'edit', icon: 'fa-duotone fa-solid fa-user-pen', visible: 1 },
        { label: 'Coordinaciones', value: 'event', icon: 'fa-duotone fa-solid fa-calendar', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: 'Archivos', value: 'file', icon: 'fa-duotone fa-solid fa-image', visible: 1 },
    ],
    tab: 'edit',
    tabList: 'history',
    item: {},
    dialogWrite: false,
})

async function onInit() {
    state.item = await $api.get(`contact/${props.id}`)
    console.log(state.item.files);
    state.loading = false
}

async function removeProfile() {
    try {
        const response = await $api.delete(`file/${state.item.profile.id}`, { data: { ref_key: 't_contact', ref_id: state.item.id } })
        console.log(response);
    } catch (error) {
        console.log(error);
    }
}

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_contact, (data) => {
    if (data.id === state.item.id) {
        onInit()
    }
}, { deep: true })

onMounted(() => {
    onInit()
})

</script>