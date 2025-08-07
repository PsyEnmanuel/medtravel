<template>
    <div :style="style">
        <div v-if="isDrawer" class="flex justify-between items-start gap-2 py-2">
            <div class="mb-2">
                <p class="text-2xl text-info">Consultar Póliza</p>
            </div>
            <q-btn flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="flex md:flex-nowrap gap-2 break-all">
            <div class="w-full md:max-w-[200px] min-w-[200px]">
                <div class="card rounded-md flex flex-col py-2 px-3 mb-1">
                    <div class="font-semibold text-xs">{{ state.item.insurance }}</div>
                    <div class="flex justify-between gap-2">
                        <div>{{ state.item.policy_number }}</div>
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
                            <PolicyWrite isEdit :id="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="titular" class="p-0">
                        <div class="card px-3 py-2">
                            <PolicyWriteTitular width="100%" :id="state.item.id" />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="dependant" class="p-0">
                        <div class="card px-3 py-2">
                            <PolicyWriteDependant width="100%" :id="state.item.id" :policy_number="state.item.policy_number" />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="title" class="p-0">
                        <PolicyInsuredTable isEdit :id="state.item.id" :policy_number="state.item.policy_number"
                            width="100%" />
                    </q-tab-panel>
                    <q-tab-panel name="file" class="p-0">
                        <UploadFileManager :ref_id="state.item.id" table="t_policy" file_type="GENERAL" />
                        <FileManager :refId="state.item.id" refKey="t_policy" />
                    </q-tab-panel>
                </q-tab-panels>
            </div>
            <div class="flex flex-col w-full  md:max-w-[250px] min-w-[250px]">
                <template v-if="!state.loading">
                    <CommentTable refKey="t_policy" :refId="state.item.id" />
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import PolicyWrite from 'pages/policy/components/PolicyWrite.vue'
import UploadFileManager from 'components/file/UploadFileManager.vue'
import FileManager from 'components/file/FileManager.vue'
import { useUpdateStore } from "src/stores/update";
import { useQuasar } from 'quasar';
import PolicyInsuredTable from 'pages/policy/components/PolicyInsuredTable.vue';
import PolicyWriteDependant from 'pages/policy/components/PolicyWriteDependant.vue';
import CommentTable from 'pages/comment/components/CommentTable.vue';
import PolicyWriteTitular from 'pages/policy/components/PolicyWriteTitular.vue';
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
        { label: 'Editar Póliza', value: 'edit', icon: 'fa-duotone fa-solid fa-user-pen', visible: 1 },
        { label: 'Agregar Titular', value: 'titular', icon: 'fa-duotone fa-solid fa-user-plus', visible: 1 },
        { label: 'Agregar Dependiente', value: 'dependant', icon: 'fa-duotone fa-solid fa-user-plus', visible: 1 },
        { label: 'Asegurados', value: 'title', icon: 'fa-duotone fa-solid fa-hospital-user', visible: 1 },
        { label: 'Archivos', value: 'file', icon: 'fa-duotone fa-solid fa-image', visible: 1 },
    ],
    tab: 'edit',
    item: {},
    dialogWrite: false,
    dialogPassword: false,
})

async function onInit() {
    state.item = await $api.get(`policy/${props.id}`)
    state.loading = false
}

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_policy, (data) => {
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