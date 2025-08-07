<template>
    <div class="flex md:flex-nowrap gap-2 break-all">
        <div class="w-full md:max-w-[200px]">
            <div class="card rounded-md flex flex-col py-2 px-3 mb-1">
                <div class="font-semibold text-xs">{{ state.item.description }}</div>
                <div class="flex gap-2 text-xxs">
                    <div>#{{ state.item.code }}</div>
                    <div>{{ state.item.insurance }}</div>
                </div>
            </div>
            <q-input class="mb-1 text-xxs" dense outlined v-model="state.item.allergy" :label="$t('allergy')"
                type="textarea" :rows="4" @update:model-value="saveInsured">
            </q-input>
            <div class="grid gap-1 my-1">
                <q-btn class="button-tab hover:shadow-left-secondary w-full text-xs" align="left" unelevated
                    v-for="tab in state.tabs" :key="tab.value" @click="state.tab = tab.value"
                    :class="state.tab == tab.value && 'shadow-left-secondary'">
                    <div class="flex items-center justify-between w-full">
                        <span>{{ tab.label }}</span>
                    </div>
                </q-btn>
            </div>
        </div>
        <div class="w-full">
            <q-tab-panels v-if="!state.loading" v-model="state.tab" class="bg-transparent">
                <q-tab-panel name="edit" class="p-0">
                    <div class="card px-3 py-2">
                        <ContactWrite isEdit :id="state.item.id" width="100%" />
                    </div>
                </q-tab-panel>
                <q-tab-panel name="history" class="p-0">
                    <div class="card px-3 py-2">
                        <WriteHistory :insured="state.item" width="100%" />
                    </div>
                </q-tab-panel>
                <q-tab-panel name="follow" class="p-0">
                    <div class="card px-3 py-2">
                        <WriteHistoryFollow :insured="state.item" width="100%" />
                    </div>
                </q-tab-panel>
                <q-tab-panel name="prescription" class="p-0">
                    <div class="card px-3 py-2">
                        <WritePrescription :insured="state.item" width="100%" />
                    </div>
                </q-tab-panel>
                <q-tab-panel name="file" class="p-0">
                    <UploadFileManager :ref_id="state.item.id" table="t_contact" file_type="GENERAL" />
                    <FileManager :files="state.item.files" :refId="state.item.id" refKey="t_contact" />
                </q-tab-panel>
            </q-tab-panels>
        </div>
        <div class="flex flex-col w-full  md:max-w-[350px]">
            <div class="grid grid-cols-2 gap-1">
                <q-btn class="button-tab hover:shadow-secondary w-full text-xs" align="left" unelevated
                    v-for="tab in state.tabsList" :key="tab.value" @click="state.tabList = tab.value"
                    :class="state.tabList == tab.value && 'shadow-secondary'">
                    <div class="flex flex-nowrap justify-between w-full">
                        <span class="md:text-xs text-xxs line-clamp-1">{{ tab.label }}</span>
                        <q-icon :name="tab.icon" size="xs"></q-icon>
                    </div>
                </q-btn>
            </div>
            <template v-if="!state.loading">
                <ListHistory v-if="state.tabList === 'history'" :id="state.item.id" />
                <ListPrescription v-if="state.tabList === 'prescription'" :id="state.item.id" />
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import ContactWrite from './ContactWrite.vue'
import UploadFileManager from 'components/file/UploadFileManager.vue'
import FileManager from 'components/file/FileManager.vue'
import WriteHistory from 'src/pages/history/components/WriteHistory.vue';
import WriteHistoryFollow from 'src/pages/history/components/WriteHistoryFollow.vue';
import ListHistory from 'src/pages/history/components/ListHistory.vue';
import WritePrescription from 'src/pages/prescription/components/WritePrescription.vue';
import ListPrescription from 'src/pages/prescription/components/ListPrescription.vue';
import { useUpdateStore } from "src/stores/update";
import { useQuasar } from 'quasar';
const $q = useQuasar()
const $api = inject('$api')
const props = defineProps({
    id: String
})

const state = reactive({
    tabsList: [
        { label: 'Seguimiento', value: 'history', icon: 'list' },
        { label: 'Prescripciones', value: 'prescription', icon: 'list' },
    ],
    tabs: [
        { label: 'Editar Asegurado', value: 'edit' },
        { label: 'Historia Clínica', value: 'history' },
        { label: 'Seguimiento', value: 'follow' },
        { label: 'Prescripción', value: 'prescription' },
        { label: 'Análisis', value: 'analytic' },
        { label: 'Archivos', value: 'file' },
        { label: 'Coordinacións', value: 'event' },
        { label: 'Facturas', value: 'invoice' },
    ],
    tab: 'prescription',
    tabList: 'prescription',
    item: {},
    loading: true,
    dialogWrite: false,
    dialogPassword: false,
})

async function onInit() {
    state.item = await $api.get(`insured/${props.id}`)
    state.loading = false
}

async function saveInsured() {
    await $api.put(`insured/${props.id}`, state.item)
    $q.notify({
        type: 'success',
        message: 'Asegurado Actualizado'
    })
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