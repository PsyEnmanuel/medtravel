<template>
    <q-page class="px-1.5 py-2 lg:px-5 lg:py-6">
        <div class="flex md:flex-nowrap gap-2 break-all">
            <div class="w-full md:max-w-[200px] min-w-[200px]">
                <div class="card rounded-md flex flex-col py-2 px-3 mb-1 mt-1">
                    <div class="font-semibold text-xs">{{ state.item.description }}</div>
                    <div class="flex justify-between gap-2">
                        <div>{{ state.item.file_date }}</div>
                    </div>
                    <div class="flex justify-between gap-2">
                        <div>#{{ state.item.code }}</div>
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
                            <FileWrite isEdit :id="state.item.id" width="100%" />
                        </div>
                    </q-tab-panel>
                    <q-tab-panel name="policy" class="p-0">
                        <PolicyIndex :insuredId="state.item.id" width="100%" />
                    </q-tab-panel>
                </q-tab-panels>
            </div>
            <div class="flex flex-col w-full  md:max-w-[250px] min-w-[250px]">
                <template v-if="!state.loading">
                    <CommentTable refKey="t_customer" :refId="state.item.id" />
                </template>
            </div>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import FileWrite from 'components/file/FileWrite.vue'
import { useUpdateStore } from "src/stores/update";
import { useQuasar } from 'quasar';
import PolicyIndex from 'src/pages/policy/policy-index.vue';
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
        { label: 'Editar Archivo', value: 'edit', icon: 'fa-duotone fa-solid fa-user-pen', visible: 1 },
    ],
    tab: 'edit',
    tabList: 'history',
    item: {},
    dialogWrite: false,
    dialogPassword: false,
})

async function onInit() {
    state.item = await $api.get(`file/${props.id}`)
    state.loading = false
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

</script>