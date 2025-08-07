<template>
    <q-page class="px-1.5 py-2 lg:px-5 lg:py-6">
        <div class="flex md:flex-nowrap gap-2 break-all">
            <div class="w-full md:max-w-[200px] min-w-[200px]">
                <div class="card rounded-md flex flex-col py-2 px-3 mb-1">
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
            <div class="w-full">
                <q-tab-panels v-if="!state.loading" v-model="state.tab" class="bg-transparent">
                    <q-tab-panel name="edit" class="p-0">
                        <div class="card px-3 py-2">
                            <InsuranceWrite isEdit :id="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="insured" class="p-0">
                        <InsuranceInsuredTable isEdit :id="state.item.id" :insurance_id="state.item.id"
                            width="100%" />
                    </q-tab-panel>
                    <q-tab-panel name="policy" class="p-0">
                        <InsurancePolicyTable isEdit :id="state.item.id" :insurance_id="state.item.id"
                            width="100%" />
                    </q-tab-panel>
                    <q-tab-panel name="file" class="p-0">
                        <UploadFileManager :ref_id="state.item.id" table="t_insurance" file_type="GENERAL" />
                        <FileManager :refId="state.item.id" refKey="t_insurance" />
                    </q-tab-panel>
                    <!-- <q-tab-panel name="event" class="p-0">
                        <EventTable :insuranceId="state.item.id" width="100%" />
                    </q-tab-panel> -->
                </q-tab-panels>
            </div>
            <div class="flex flex-col w-full  md:max-w-[250px] min-w-[250px]">
                <template v-if="!state.loading">
                    <CommentTable refKey="t_insurance" :refId="state.item.id" />
                </template>
            </div>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import InsuranceWrite from './components/InsuranceWrite.vue'
import InsuranceInsuredTable from 'src/pages/insurance/components/InsuranceInsuredTable.vue'
import InsurancePolicyTable from 'src/pages/insurance/components/InsurancePolicyTable.vue'
import UploadFileManager from 'components/file/UploadFileManager.vue'
import FileManager from 'components/file/FileManager.vue'
import { useUpdateStore } from "src/stores/update";
import { useQuasar } from 'quasar';
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
    tabsList: [
        { label: 'Seguimiento', value: 'history', icon: 'list' },
        { label: 'Prescripciones', value: 'prescription', icon: 'list' },
    ],
    tabs: [
        { label: 'Editar Asegurado', value: 'edit', icon: 'fa-duotone fa-solid fa-user-pen', visible: 1 },
        { label: 'Archivos', value: 'file', icon: 'fa-duotone fa-solid fa-image', visible: 1 },
        { label: 'Asegurados', value: 'insured', icon: 'fa-duotone fa-solid fa-hospital-user', visible: $me.unixroles & 265 ? 1 : 1 },
        { label: 'Pólizas', value: 'policy', icon: 'fa-duotone fa-solid fa-heart-circle-plus', visible: $me.unixroles & 265 ? 1 : 1 },
        { label: 'Coodinaciones', value: 'event', icon: 'fa-duotone fa-solid fa-calendar', visible: $me.unixroles & 265 ? 1 : 1 },
        { label: 'Liquidaciones', value: 'settlement', icon: 'fa-duotone fa-solid fa-file-lines', visible: $me.unixroles & 265 ? 1 : 1 },
        { label: 'Reembolsos', value: 'refund', icon: 'fa-duotone fa-solid fa-file-lines', visible: $me.unixroles & 265 ? 1 : 1 },
    ],
    tab: 'edit',
    tabList: 'history',
    item: {},
    dialogWrite: false,
    dialogPassword: false,
})

async function onInit() {
    state.item = await $api.get(`insurance/${props.id}`)
    state.loading = false
}

function saveInsurance() {
    clearTimeout(state.timeout);
    state.timeout = setTimeout(async () => {
        await $api.put(`insurance/${props.id}`, state.item)
        $q.notify({
            type: 'success',
            message: 'Seguro Actualizado'
        })
    }, 1000)
}

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_insurance, (data) => {
    if (data.id === state.item.id) {
        onInit()
    }
}, { deep: true })

onMounted(() => {
    onInit()
})

</script>