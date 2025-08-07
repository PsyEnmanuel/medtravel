<template>
    <div v-if="!state.loading" :style="style">
        <div class="flex flex-nowrap justify-between items-start gap-2 px-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar {{ state.item.prescription_type }}, <b
                        class="font-bold text-brand">#{{
                            state.item.code }}</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Escribir nueva <b class="font-bold text-brand">prescripción</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <div class="flex flex-col gap-1">
                <q-btn flat class="button bg-primary-light" no-caps @click="state.dialogTemplate = true">Buscar
                    Plantilla</q-btn>
                <q-input class="mb-1" dense outlined v-model="state.item.template" label="Plantilla"></q-input>
            </div>
        </div>
        <div class="subtitle my-2 bg-primary p-0.5 rounded-none mx-2"></div>
        <div :class="isDrawer && 'pb-32'">
            <q-form ref="writeForm" @submit="onSubmit" @reset="onReset">

                <div class="mb-1">
                    <div v-if="isEdit" class="fixed bottom-0 z-30" :style="style">
                        <q-btn class="button-press rounded-none w-full text-lg bg-green-400 font-black" flat
                            label="EDITAR" type="submit" />
                    </div>
                    <div v-else class="flex justify-end px-2">
                        <q-btn flat
                            class="py-3 px-5 w-full shadow-press bg-add rounded-md uppercase focus:outline-none tracking-normal transition duration-150 hover:brightness-95 bg-primary-light font-bold text-font"
                            type="submit">
                            CREAR PRESCRIPCION
                        </q-btn>
                    </div>
                </div>

                <div class="px-2">

                    <div class="grid grid-cols-3 gap-2">
                        <q-input class="mb-1" dense outlined v-model="state.item.prescription_date" mask="##-##-####"
                            :label="$t('prescription_date')">
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy ref="proxy">
                                        <q-date flat v-model="state.item.prescription_date" no-unset years-in-month-view
                                            minimal mask="DD-MM-YYYY" @update:model-value="$refs.proxy.hide()"
                                            :options="optionBirthdate">
                                        </q-date>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>
                        <q-input class="mb-1" dense outlined v-model="state.item.diagnosis"
                            label="Diagnóstico de Impresión"></q-input>
                        <CategorySelect class="mb-2" :model-value="state.item.prescription_type"
                            refKey="prescription_type" @setCategory="state.item.$prescription_type_id = $event"
                            @clearCategory="state.item.$prescription_type_id = null" add />
                    </div>
                        <!-- <q-input class="mb-1" dense outlined v-model="state.item.content" label="Prescipción"
                            type="textarea" :rows="24"></q-input> -->
                        <q-editor v-model="state.item.content" :dense="$q.screen.lt.md" min-height="25rem" placeholder="Escribir Aquí" :toolbar="[['left', 'center', 'right', 'justify'], ['bold', 'italic', 'underline', 'strike'], ['undo', 'redo'], ['quote', 'unordered', 'ordered', 'outdent', 'indent']]
                            " />

                </div>

            </q-form>
        </div>
        <q-dialog class="q-pa-none left-0" no-refocus v-model="state.dialogTemplate"
            :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="$isDesktop ? 100 : 0">
            <q-card>
                <TemplateList :width="$isDesktop ? '400px' : '100%'" @selectPrescription="selectPrescription" />
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { intlDate } from "src/helpers/date"
import TemplateList from './TemplateList.vue';
import CategorySelect from 'src/components/select/CategorySelect.vue';
const $q = useQuasar()
const $api = inject('$api');
const $cats = inject('$cats');
const $local = inject('$local');
const $isDesktop = inject('$isDesktop');
const props = defineProps({ id: Number, isEdit: Boolean, insured: Object, isDrawer: Boolean, prescription_type_id: Number })

const style = computed(() => {
    const style = {}
    if (!$isDesktop) {
        style.width = '100%'
    } else if (props.isDrawer) {
        style.width = '1200px'
    } else {
        style.width = '100%'
    }
    return style
})


const writeForm = ref();
const initialItem = () => ({
    prescription_date: intlDate(new Date()),
    $prescription_type_id: props.prescription_type_id,
    treatment: [],
    mprocedure: [],
    recomendation: [],
    analytic: [],
    content: ""
})

const state = reactive({
    loading: true,
    item: initialItem(),
    local: 'prescription',
})

watch(() => state.item, (val) => {
    if (!props.isEdit) {
        $local.set(state.local, val)
    }
}, { deep: true })


function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    setTimeout(() => {
        writeForm.value.resetValidation()
    }, 0)
}

async function onSubmit() {
    try {
        if (props.isEdit) {
            const response = await $api.put(`prescription/${props.id}`, state.item);
            if (response) {
                $q.notify({
                    type: 'success',
                    message: 'Prescripción Clínica Editada'
                })
            }
        } else {
            const response = await $api.post('prescription', state.item);
            if (response) {
                $q.notify({
                    type: 'success',
                    message: 'Prescripción Clínica Agregada'
                })
            }
            onReset()
            onInit()
        }
    } catch (error) {
        console.log(error)
    }
}

function selectPrescription(row) {
    state.item.content = row.content
}

function fillInsured(insured) {
    state.item.insured_id = insured.id
    state.item.insured_description = insured.description
}

async function onInit() {
    if (props.isEdit) {
        state.item = await $api.get(`prescription/${props.id}`)
        const insured = await $api.get(`insured/${state.item.insured_id}`)
        fillInsured(insured)
    } else {
        console.log(props.insured);
        fillInsured(props.insured)

    }
    state.loading = false
}

onMounted(() => {
    onInit()
})
</script>