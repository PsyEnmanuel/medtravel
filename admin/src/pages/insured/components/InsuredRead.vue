<template>
    <div :style="style">
        
        <div v-if="isDrawer" class="flex justify-between items-start gap-2 py-2">
            <div class="mb-2">
                <p class="text-2xl text-info">Consultar Asegurado</p>
            </div>
            <q-btn flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="flex md:flex-nowrap gap-2 break-all">
            <div class="w-full md:max-w-[200px] min-w-[200px]">
                <div v-if="state.item.profile" class="relative">
                    <q-img class="card h-[200px]" fit="contain" :src="state.item.profile.url" spinner-color="white" />
                    <q-btn flat class="absolute top-0 right-0 button-icon bg-primary text-white rounded-md" size="sm"
                        no-caps @click="removeProfile" icon="fa-solid fa-xmark">
                        <q-tooltip class="bg-default text-black text-xs">Remover Linea</q-tooltip>
                    </q-btn>
                </div>
                <UploadFileManager v-else :ref_id="state.item.id" table="t_insured"
                    icon="fa-duotone fa-solid fa-camera-retro" :avaliable_file_text="false" text="Subir foto de perfil"
                    file_type="FOTO PERFIL" />
                <div class="card rounded-md flex flex-col py-2 px-3 mb-1 mt-1">
                    <div class="font-semibold text-xs">{{ state.item.fullname }}</div>
                    <div class="font-semibold text-xxs">{{ state.item.ident_no }}</div>
                    <div class="flex justify-between gap-2 text-xxs">
                        <div>{{ state.item.sex }}</div>
                        <div>{{ state.item.age }}</div>
                    </div>
                    <div class="flex justify-between gap-2 text-xxs">
                        <div>#{{ state.item.code }}</div>
                        <div>{{ state.item.birthdate }}</div>
                    </div>
                    <div class="flex gap-1">
                        <q-badge class="text-xxs" v-for="language in state.item.language" :key="language">
                            {{ language }}
                        </q-badge>
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
                <RowStatus :item="state.item" :isEdit="true" />
                <q-tab-panels v-if="!state.loading" v-model="state.tab" class="bg-transparent">
                    <q-tab-panel name="edit" class="p-0">
                        <div class="card px-3 py-2">
                            <InsuredWrite isEdit :id="state.item.id" width="100%" @close="$emit('close', $event)" />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="policy" class="p-0">
                        <PolicyIndex :insuredId="state.item.id" width="100%" />
                    </q-tab-panel>
                    <q-tab-panel name="dependant" class="p-0">
                        <PolicyDependant :insuredId="state.item.id" width="100%" />
                    </q-tab-panel>
                    <q-tab-panel name="provider" class="p-0">
                        <ProviderTable :provider="state.item.provider" width="100%" />
                    </q-tab-panel>
                    <q-tab-panel name="file" class="p-0">
                        <UploadFileManager :ref_id="state.item.id" table="t_insured" file_type="GENERAL" />
                        <FileManager :refId="state.item.id" refKey="t_insured" />
                    </q-tab-panel>
                    <q-tab-panel name="itinerary" class="p-0">
                        <ItineraryInsured :insuredId="state.item.id" width="100%" />
                    </q-tab-panel>
                    <q-tab-panel name="event" class="p-0">
                        <EventTable :insuredId="state.item.id" width="100%" />
                    </q-tab-panel>
                    <q-tab-panel name="prescription" class="p-0">
                        <div class="card px-3 py-2">
                            <PrescriptionIndex :insuredId="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="conciliation" class="p-0">
                        <div class="card">
                            <ConciliationIndex :insuredId="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                </q-tab-panels>
            </div>
            <div class="flex flex-col w-full  md:max-w-[250px] min-w-[250px]">
                <template v-if="!state.loading">
                    <CommentTable refKey="t_insured" :refId="state.item.id" />
                </template>
            </div>
        </div>

    </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import InsuredWrite from 'src/pages/insured/components/InsuredWrite.vue'
import UploadFileManager from 'components/file/UploadFileManager.vue'
import FileManager from 'components/file/FileManager.vue'
import { useUpdateStore } from "src/stores/update";
import { useQuasar } from 'quasar';
import ConciliationIndex from 'src/pages/conciliation/conciliation-index.vue';
import PolicyIndex from 'src/pages/policy/policy-index.vue';
import EventTable from 'src/pages/event/components/EventTable.vue';
import PolicyDependant from 'src/pages/policy/components/PolicyDependant.vue';
import ProviderTable from 'src/pages/provider/components/ProviderTable.vue';
import CommentTable from 'src/pages/comment/components/CommentTable.vue';
import PrescriptionIndex from 'src/pages/prescription/prescription-index.vue';
import WritePrescription from 'src/pages/prescription/components/WritePrescription.vue';
import ItineraryInsured from 'src/pages/itinerary/components/ItineraryInsured.vue';
import RowStatus from 'src/components/RowStatus.vue';

const $q = useQuasar()
const $api = inject('$api')
const $me = inject('$me')
const props = defineProps({
    id: String,
    isDrawer: Boolean,
    width: String
})

const state = reactive({
    loading: true,
    timeout: null,
    tabs: [
        { label: 'Editar Asegurado', value: 'edit', icon: 'fa-duotone fa-solid fa-user-pen', visible: 1 },
        { label: 'Pólizas', value: 'policy', icon: 'fa-duotone fa-solid fa-heart-circle-plus', visible: 1 },
        { label: 'Dependientes', value: 'dependant', icon: 'fa-duotone fa-solid fa-family', visible: 1 },
        { label: 'Proveedores', value: 'provider', icon: 'fa-duotone fa-solid fa-hospitals', visible: 1 },
        { label: 'Coordinaciones', value: 'event', icon: 'fa-duotone fa-solid fa-arrow-progress', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: 'Itinerarios', value: 'itinerary', icon: 'fa-duotone fa-solid fa-calendar-days', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: 'Conciliaciones', value: 'conciliation', icon: 'fa-duotone fa-solid fa-file-lines', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: 'Prescripción', value: 'prescription', icon: 'fa-duotone fa-solid fa-prescription', visible: $me.unixroles & 3 ? 1 : 1 },
        { label: 'Archivos', value: 'file', icon: 'fa-duotone fa-solid fa-image', visible: 1 },
    ],
    tab: 'edit',
    item: {},
    dialogWrite: false,
    dialogPassword: false,
})

async function onInit() {
    state.item = await $api.get(`insured/${props.id}`)
    state.loading = false
}

async function removeProfile() {
    try {
        const response = await $api.delete(`file/${state.item.profile.id}`, { data: { ref_key: 't_insured', ref_id: state.item.id } })
    } catch (error) {
        console.log(error);
    }
}

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_insured, (data) => {
    if (data.id === state.item.id) {
        onInit()
    }
}, { deep: true })

onMounted(() => {
    onInit()
})

const style = computed(() => {
    return {
        width: props.width,
        'padding-right': props.isDrawer && '8px',
        'padding-left': props.isDrawer && '8px'
    }
})

</script>