<template>
    <div class="card no-shadow border overflow-hidden p-4" :style="style">
        <div class="flex justify-between items-end">
            <div class="flex flex-col">
                <span class="text-lg font-bold text-primary">GUÍA MÉDICA</span>
                <span class=" text-xs text-font">#{{ state.item.code }}</span>
            </div>
            <div class="flex">
                <!-- <q-btn class="button mr-3" flat label="Imprimir" icon="sym_o_print"
                    @click="printFileFromUrl(state.item)" /> -->
                <q-btn flat class="button mr-2" label="Descargar" icon="sym_o_download"
                    @click="downloadResource(state.filename, state.item.code)"></q-btn>
                <q-btn flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
            </div>
        </div>
        <div class="flex flex-col gap-1 mt-1">
            <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Pendientes</div>
            <div class="flex flex-nowrap gap-1" v-for="(item, index) in pendingList" :key="item.id">

                <div class="w-full max-w-[40px] min-w-[40px] flex justify-center items-center border card shadow-none">
                    {{ index + 1 }}</div>
                <div class="flex flex-nowrap justify-between w-full items-start border card shadow-none px-3 py-1">
                    <div class="w-full flex flex-col">
                        <div class="text-xs uppercase pr-4 line-clamp-1">{{ item.text }}</div>
                        <div class="text-xxs uppercase pr-4" v-html="item.detail"></div>
                    </div>
                    <q-btn v-if="item.fun" class="button" flat @click="item.fun">{{ item.btnText }}</q-btn>
                </div>
                <q-badge :color="item.color" :style="{ background: item.color }"
                    class="flex justify-center font-bold text-xxs w-[16px] h-[16px]"></q-badge>
            </div>
        </div>
        <template v-if="isEdit">
            <q-btn flat class="button-icon h-[40px] bg-secondary text-white" @click="state.cancelDialog = true"
                label="Cancelar coordinación">
                <q-tooltip class="bg-default text-black text-xs">Cancelar
                    coordinación</q-tooltip>
            </q-btn>
        </template>
        <div class="card border my-4 p-4 rounded-xl overflow-hidden">
            <div v-if="!state.loading">
                <div v-for="page in state.numOfPages" :key="page">
                    <VuePdf :src="state.filename" :page="page" />
                    <div class="mt-10 border border-gray-200"></div>
                </div>
            </div>
        </div>
    </div>

    <q-dialog class="q-pa-none left-0" no-refocus v-model="state.uploadcentroPROVIDERDrawer">
        <q-card class="p-2 flex justify-center items-center">
            <div class=" border border-dashed w-full">
                <UploadFileManager class="py-16 px-24" :ref_id="state.item.provider_id" table="t_provider"
                    icon="fa-duotone fa-solid fa-camera-retro" :avaliable_file_text="false"
                    text="Subir FOTO DE CENTRO PROVEEDOR" file_type="GUÍA MÉDICA"
                    @close="state.uploadcentroPROVIDERDrawer = false" />
            </div>
        </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" no-refocus v-model="state.uploadPROFILEPROVIDERDrawer">
        <q-card class="p-2 flex justify-center items-center">
            <div class=" border border-dashed w-full">
                <UploadFileManager class="py-16 px-24" :ref_id="state.item.provider_id" table="t_provider"
                    icon="fa-duotone fa-solid fa-camera-retro" :avaliable_file_text="false"
                    text="Subir FOTO PERFIL PROVEEDOR" file_type="FOTO PERFIL"
                    @close="state.uploadPROFILEPROVIDERDrawer = false" />
            </div>
        </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" no-refocus v-model="state.uploadMAPAPROVIDERrawer">
        <q-card class="p-2 flex justify-center items-center">
            <div class=" border border-dashed w-full">
                <UploadFileManager class="py-16 px-24" :ref_id="state.item.provider_id" table="t_provider"
                    icon="fa-duotone fa-solid fa-camera-retro" :avaliable_file_text="false"
                    text="Subir FOTO MAPA PROVEEDOR" file_type="MAPA" @close="state.uploadMAPAPROVIDERrawer = false" />
            </div>
        </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" no-refocus v-model="state.uploadCARNEDrawer">
        <q-card class="p-2 flex justify-center items-center">
            <div class=" border border-dashed w-full">
                <UploadFileManager class="py-16 px-24" :ref_id="state.item.id" table="t_event"
                    icon="fa-duotone fa-solid fa-camera-retro" :avaliable_file_text="false" text="Subir CARNÉ"
                    file_type="CARNÉ" @close="state.uploadCARNEDrawer = false" />
            </div>
        </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" no-refocus v-model="state.uploadPRESERTIFICATIONDrawer">
        <q-card class="p-2 flex justify-center items-center">
            <div class=" border border-dashed w-full">
                <UploadFileManager class="py-16 px-24" :ref_id="state.item.id" table="t_event"
                    icon="fa-duotone fa-solid fa-camera-retro" :avaliable_file_text="false"
                    text="Subir PRECERTIFICACIÓN" file_type="PRECERTIFICACIÓN"
                    @close="state.uploadPRESERTIFICATIONDrawer = false" />
            </div>
        </q-card>
    </q-dialog>

</template>

<script setup>

import { downloadResource } from 'src/helpers';
import { VuePdf, createLoadingTask } from 'vue3-pdfjs';
import { inject, onMounted, reactive, ref, computed } from 'vue';
import { list } from 'postcss';
import StateSelect from 'src/components/select/StateSelect.vue';
import UploadFileManager from 'src/components/file/UploadFileManager.vue';
const props = defineProps({ id: Number, width: String })
const $api = inject('$api');
const state = reactive({
    loading: true,
    visible: true,
    item: {},
    filename: null,
    pdfSrc: null,
    numOfPages: 0
})

onMounted(async () => {
    const { item, filename } = await $api.get(`report/medical-guide/${props.id}`)
    state.item = item
    state.filename = filename

    const loadingTask = createLoadingTask(state.filename)
    loadingTask.promise.then((pdf) => {
        state.numOfPages = pdf.numPages
    })

    state.loading = false
})

const pendingList = computed(() => {
    const list = []
    if (!state.item._files) { return list }

    if (!state.item?._files.cardnet.length) {
        list.push({
            text: 'Agregar cardnet de asegurado (Foto)',
            detail: 'Se refiere a el tipo de archivo <b>CARNÉ</b> de los asegurados',
            color: 'black',
            btnText: 'Subir CARNÉ',
            fun() {
                state.uploadCARNEDrawer = true
                return;
            }
        })
    }
    if (!state.item?._files.doctor.length) {
        list.push({
            text: 'Agregar imagenes de médicos',
            detail: 'Se refiere a la foto de <b>PERFIL</b> de los médicos presentes en la coordinación',
            color: 'black'
        })
    }
    if (!state.item?._files.presertification.length) {
        list.push({
            text: 'Agregar PRECERTIFICACIÓN (Archivo)',
            detail: 'Tipo de Archivo <b>PRECERTIFICACIÓN</b> adjunto en la coordinación presentes en la coordinación',
            color: 'black',
            btnText: 'Subir PRECERTIFICACIÓN',
            fun() {
                state.uploadPRESERTIFICATIONDrawer = true
                return;
            }
        })
    }
    if (!state.item?.provider) {
        list.push({
            text: 'Agregar Proveedor',
            detail: 'Se refiere al proveedor principal de la coordinación',
            color: 'black'
        })
    }
    if (!state.item?._files.provider) {
        list.push({
            text: 'Agregar Foto de perfil de proveedor',
            detail: 'Se refiere a la foto de <b>PERFIL</b> del proveedor presente en la coordinación',
            color: 'black',
            btnText: 'Subir FOTO PERFIL PROVEEDOR',
            fun() {
                state.uploadPROFILEPROVIDERDrawer = true
                return;
            }
        })
    }
    if (!state.item?.provider.file) {
        list.push({
            text: 'Agregar Foto de centro de proveedor (TIPO GUÍA MÉDICA)',
            detail: 'Se refiere a la foto de <b>CENTRO</b> del proveedor presente en la coordinación',
            color: 'black',
            btnText: 'Subir FOTO CENTRO PROVEEDOR',
            fun() {
                state.uploadcentroPROVIDERDrawer = true
                return;
            }
        })
    }
    if (!state.item?.provider.mapa) {
        list.push({
            text: 'Agregar Foto de Ubicación Mapa del proveedor',
            detail: 'Tipo de Archivo <b>MAPA</b> adjunto en la <b>PROVEEDOR</b> presente en la coordinación',
            color: 'black',
            btnText: 'Subir FOTO MAPA PROVEEDOR',
            fun() {
                state.uploadMAPAPROVIDERrawer = true
                return;
            }
        })
    }
    if (!state.item?.itineraries?.length) {
        list.push({
            text: 'Agregar itinerarios',
            detail: 'Listado de itinerarios correspondientes a la coordinación',
            color: 'black'
        })
    }


    return list;
})

const style = computed(() => {
    return {
        width: props.width
    }
})

</script>