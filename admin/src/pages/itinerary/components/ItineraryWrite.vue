<template>
    <div :style="style" :class="isDrawer ? 'pb-32' : 'pb-12'">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar Aseguradora</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Aseguradora</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <div class="grid grid-cols-3 gap-2">
                <div>
                    <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">&nbsp;</div>
                    <q-input class="mb-2" dense outlined v-model="state.item.description"
                        :label="$t('description') + '*'" :rules="[requiredInput]" hide-bottom-space></q-input>
                </div>
                <div>
                    <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">Plan</div>
                    <q-input class="mb-2" dense outlined v-model="state.plan" label="Agregar plan">
                        <template v-slot:append>
                            <q-btn class="button w-full bg-default text-font" size="sm" flat label="agregar"
                                @click="addPlan" />
                        </template>
                    </q-input>
                    <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">Listado de planes</div>
                    <div v-for="plan in state.item.insurance_plan" :key="plan">
                        <div class="flex flex-nowrap justify-between items-center gap-2 card p-1 mb-2">
                            <q-input class="w-full border-none" dense outlined v-model="plan.description"
                                :label="$t('plan')" :rules="[requiredInput]" hide-bottom-space></q-input>
                            <q-btn class="button-icon bg-primary text-white rounded-full mx-2" size="xs" flat
                                icon="fa-solid fa-xmark" @click="removePlan(plan)" />
                        </div>
                    </div>
                </div>
                <div>
                    <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">Tipo de plan</div>
                    <q-input class="mb-2" dense outlined v-model="state.plan_type" label="Agregar tipo de plan">
                        <template v-slot:append>
                            <q-btn class="button w-full bg-default text-font" size="sm" flat label="agregar"
                                @click="addPlanType" />
                        </template>
                    </q-input>
                    <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">Listado de tipos de planes</div>
                    <div v-for="plan in state.item.insurance_plan_type" :key="plan">
                        <div class="flex flex-nowrap justify-between items-center gap-2 card p-1 mb-2">
                            <q-input class=" w-full" dense outlined v-model="plan.description" :label="$t('plan')"
                                :rules="[requiredInput]" hide-bottom-space></q-input>
                            <q-btn class="button-icon bg-primary text-white rounded-full mx-2" size="xs" flat
                                icon="fa-solid fa-xmark" @click="removePlanType(plan)" />
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="isDrawer" class="fixed bottom-0 right-0 py-2 bg-white" :style="style">
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg bg-primary text-white" flat
                    label="Guardar cambios" type="submit" />
                <q-btn v-else class="button-press w-full text-lg bg-primary text-white" flat label="agregar"
                    type="submit" />
            </div>
        </q-form>
    </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { requiredInput } from 'src/helpers/validation';
import { useQuasar } from 'quasar';
const $api = inject('$api');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })

const initialItem = () => ({
    insurance_plan: [],
    insurance_plan_type: [],
})

const state = reactive({
    item: initialItem(),
    local: 'WriteInsurance',
    categories: [],
    plan: null,
    plan_type: null
})

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

function addPlan() {
    if (!state.plan) {
        $q.notify({
            type: 'warning',
            message: 'Campo plan no puede estar vacio'
        })
        return;
    }
    const index = state.item.insurance_plan.findIndex(i => i.description === state.plan)
    if (index === -1) {
        state.item.insurance_plan.push({ description: state.plan })
        state.plan = null
        return;
    }
    $q.notify({
        type: 'warning',
        message: 'Plan ya esta agregado'
    })
}

function addPlanType() {
    if (!state.plan_type) {
        $q.notify({
            type: 'warning',
            message: 'Campo tipo de plan no puede estar vacio'
        })
        return;
    }
    const index = state.item.insurance_plan_type.findIndex(i => i.description === state.plan_type)
    if (index === -1) {
        state.item.insurance_plan_type.push({ description: state.plan_type })
        state.plan_type = null
        return;
    }
    $q.notify({
        type: 'warning',
        message: 'Tipo de plan ya esta agregado'
    })
}

function removePlan(plan) {
    const index = state.item.insurance_plan.findIndex(i => i.description === plan.description)
    if (index !== -1) {
        state.item.insurance_plan.splice(index, 1)
    }
}

function removePlanType(plan) {
    const index = state.item.insurance_plan_type.findIndex(i => i.description === plan.description)
    if (index !== -1) {
        state.item.insurance_plan_type.splice(index, 1)
    }
}

async function onSubmit() {
    if (props.isEdit) {
        const response = await $api.put(`insurance/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Aseguradora Editada'
            })
        }
    } else {
        const response = await $api.post('insurance', {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Aseguradora Agregada'
            })
            onReset()
        }
    }
}

async function onInit() {
    if (props.isEdit) {
        state.item = await $api.get(`insurance/${props.id}`)
    } else {
        if ($local.get(state.local)) {
            // state.item = $local.get(state.local)
        }
    }
}

const style = computed(() => {
    return {
        width: props.width,
        padding: props.isDrawer && '6px 8px'
    }
})

onMounted(() => {
    onInit()
})
</script>