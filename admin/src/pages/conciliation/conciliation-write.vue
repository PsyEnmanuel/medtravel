<template>
    <div v-if="!state.loading" :style="style" class="relative pb-32 px-4">
        <q-form ref="mainForm" @submit="onSubmit">
            <div class="flex md:flex-nowrap justify-between mb-2">

                <div class="w-[300px] min-w-[300px]">
                    <div v-if="state.event?.id" class="flex flex-col">
                        <span class="text-xs">{{ state.event.contact_description }}</span>
                        <div class="flex items-center">
                            <span class="text-xs">#{{ state.event.code }}</span>
                            <span>&nbsp;-&nbsp;</span>
                            <span class="text-xs">{{ state.event.event_type }}</span>
                            <span>&nbsp;-&nbsp;</span>
                            <span class="text-xs">{{ state.event.event_state }}</span>
                        </div>
                        <q-btn flat class="button bg-btn-green rounded-md w-full" label="Abrir Coordinación" no-caps
                            @click="state.dialogWriteEvent = true;" />
                    </div>
                </div>

                <div class="grid lg:grid-cols-4 grid-cols-2 gap-2 w-[600px]">
                    <div class="flex flex-nowrap w-full">
                        <div class="flex flex-col w-full">
                            <q-badge class="text-xxs text-font bg-stone-200 rounded">Total
                                Reconciliación</q-badge>
                            <span class="text-font text-right text-md">{{ $currency(billed_amount) }}</span>
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <q-badge class="text-xxs text-font bg-stone-200 rounded">Descuento de Ajuste</q-badge>
                        <span class="text-font text-right text-md">{{ $currency(discount) }}</span>
                    </div>
                    <div class="flex flex-col">
                        <q-badge class="text-xxs text-font bg-stone-200 rounded">Monto a Procesar</q-badge>
                        <span class="text-font text-right text-md">{{ $currency(coverage) }}</span>
                    </div>
                    <div class="flex flex-col">
                        <q-badge class="text-xxs text-font bg-stone-200 rounded">DEDUCIBLE</q-badge>
                        <span class="text-font text-right text-md">{{ $currency(deductible) }}</span>
                    </div>
                    <div class="flex flex-col">
                        <q-badge class="text-xxs text-font bg-stone-200 rounded">COPAGO</q-badge>
                        <span class="text-font text-right text-md">{{ $currency(copago) }}</span>
                    </div>
                    <div class="flex flex-col">
                        <q-badge class="text-xxs text-font bg-stone-200 rounded">CUBIERTO</q-badge>
                        <span class="text-font text-right text-md">{{ $currency(covered) }}</span>
                    </div>
                    <div class="flex flex-col">
                        <q-badge class="text-xxs text-font bg-stone-200 rounded">PAGO DE ASEGURADA</q-badge>
                        <span class="text-font text-right text-md">{{ $currency(insurance_payment) }}</span>
                    </div>
                    <div class="flex flex-col">
                        <q-badge class="text-xxs text-font bg-stone-200 rounded">RESP. ASEGURADA</q-badge>
                        <span class="text-font text-right text-md">{{ $currency(insurance_responsability) }}</span>
                    </div>
                    <div class="flex flex-nowrap w-full">
                        <q-btn v-if="isEdit" v-loading="state.submitting" flat
                            class="button-press bg-btn-red rounded-md w-full" label="Imprimir" no-caps
                            @click="onPrint" />
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-6 gap-2">

                <div class="col-span-5 flex md:flex-nowrap gap-2">
                    <div class="w-full">
                        <ConciliationItems :items="state.items" :isEdit="isEdit" @setItems="state.items = $event" />
                        <ConciliationPayment class="pt-2" :items="state.payments" :isEdit="isEdit"
                            @setItems="state.payments = $event" />
                        <div v-if="isEdit" class="mt-2">
                            <UploadFileManager :ref_id="state.item.id" table="t_book" file_type="GENERAL" />
                            <FileManager :refId="state.item.id" refKey="t_book" />
                        </div>
                    </div>

                </div>


                <div class="flex flex-col gap-1 mb-1">

                    <InsuredSelect ref="mainInput" @setInsured="setInsured" @setPolicy="setPolicy"
                        @clearInsured="clearInsured" :model-value="state.item.insured_description"
                        :id="state.item.insured_id" :rules="[requiredInput]" />
                    <InsuredSelect readonly ref="mainInput" @setInsured="setTitular" @clearInsured="clearTitular"
                        :model-value="state.item.titular_description" :id="state.item.titular_id" label="Titular"
                        :rules="[requiredInput]" />
                    <InsuranceSelect @setInsurance="setInsurance($event, row)" @clearInsurance="clearInsurance(row)"
                        :model-value="state.item.insurance_description" :rules="[requiredInput]" hide-bottom-space />
                    <q-input readonly dense outlined v-model="state.item.policy_number" :label="$t('policy_number')"
                        @keydown.enter.prevent :rules="[requiredInput]" hide-bottom-space></q-input>
                    <q-input readonly dense outlined v-model="state.item.insured_code" :label="$t('insured_code')"
                        @keydown.enter.prevent @update:model-value="findInsuredCode" hide-bottom-space></q-input>
                    <q-input input-class="text-right" dense outlined v-model="state.item.deductible" label="Deducible"
                        v-maska:[optionsMoney] data-maska="0.99" :data-maska-tokens="maskaMoney" hide-bottom-space>
                    </q-input>

                    <div>
                        <div class="subtitle text-xs text-center">Moneda</div>
                        <q-option-group class="flex gap-1 text-xs" size="sm" v-model="state.item.$currency_id"
                            toggle-color="secondary" toggle-text-color="text-font" :options="options.currency" />
                    </div>

                    <div>
                        <div class="subtitle text-xs text-center">Área</div>
                        <q-option-group class="flex gap-1 text-xs" size="sm" v-model="state.item.$policy_branch_id"
                            toggle-color="secondary" toggle-text-color="text-font" :options="options.policy_branch" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <div class="subtitle text-center text-xs">Diagnósticos</div>
                        <DiagnosisSelect @setDiagnosis="setDiagnosis" @clearInsured="clearDiagnosis"
                            :model-value="state.item.diagnosis_description" />
                        <div class="flex flex-nowrap gap-1" v-for="(item, index) in state.item.diagnosis"
                            :key="item.id">
                            <div class="w-full flex flex-col justify-between border card shadow-none px-3 py-1">
                                <div class="text-xs uppercase line-clamp-1">{{ item.description }}</div>
                                <div class="text-xs uppercase line-clamp-1">{{ item.code }}</div>
                            </div>
                            <q-btn diabled flat class="button-icon bg-primary text-white text-[10px] h-[40px]"
                                icon="fa-solid fa-xmark" @click="removeDiagnosis(item.id)">
                                <q-tooltip class="bg-default text-black text-xs">Remover diagnóstico</q-tooltip>
                            </q-btn>
                        </div>
                    </div>

                    <div class="flex flex-col gap-1">
                        <div class="subtitle text-center text-xs">Notas</div>
                        <q-input dense outlined v-model="state.note" :label="$t('note')" @keydown.enter.prevent hide-bottom-space type="textarea"></q-input>
                        <q-btn diabled flat class="button bg-primary text-white text-[10px] h-[40px]" @click="addNote()"
                            label="Agregar nota">
                        </q-btn>
                    </div>

                    <div class="flex flex-nowrap gap-1" v-for="(item, index) in state.item.notes" :key="item.id">
                        <div
                            class="w-full max-w-[40px] min-w-[40px] flex justify-center items-center border card shadow-none">
                            {{ item.id }}</div>
                        <div class="w-full flex flex-col justify-between border card shadow-none px-3 py-1">
                            <div class="text-xs uppercase pr-4 line-clamp-1" :title="item.description">
                                {{ item.description }}
                                <q-popup-proxy>
                                    <q-banner>
                                        {{ item.description }}
                                    </q-banner>
                                </q-popup-proxy>
                            </div>
                            <div class="text-xs uppercase pr-4 line-clamp-1">{{ item.code }}</div>
                        </div>
                        <q-btn diabled flat class="button-icon bg-primary text-white text-[10px] h-[40px]"
                            icon="fa-solid fa-xmark" @click="removeNote(item.id)">
                            <q-tooltip class="bg-default text-black text-xs">Remover
                                Nota</q-tooltip>
                        </q-btn>
                    </div>

                </div>

            </div>

            <div class="fixed bottom-0 right-0 py-2 bg-white w-full">
                <RowStatus :item="state.item" :isEdit="isEdit" />
                <div class="flex flex-nowrap gap-2 px-2 mt-1">
                    <template v-if="props.isEdit">
                        <q-btn class="button-icon bg-primary text-white py-0" icon="fa-solid fa-xmark" rounded
                            @click.stop="onDelete(state.item.id)" size="sm"><q-tooltip class="bg-default text-black"
                                size="xs">Remover</q-tooltip></q-btn>
                        <q-btn class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                            label="guardar cambios" type="submit" />
                    </template>
                    <q-btn v-else class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                        label="guardar cambios" type="submit" />
                </div>
            </div>

        </q-form>

        <q-dialog v-model="state.dialogWriteEvent" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="100">
            <q-card>
                <EventWrite @close="state.dialogWriteEvent = false" isDrawer :id="state.event.id" isEdit
                    :width="$isDesktop ? '100%' : '100%'" />
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import InsuredSelect from 'src/components/select/InsuredSelect.vue';
import ConciliationItems from './components/ConciliationItems.vue';
import { vMaska } from 'maska'
import { maskaMoney, optionsMoney } from 'src/helpers/mask'
import DiagnosisSelect from 'src/components/select/DiagnosisSelect.vue';
import InsuranceSelect from 'src/components/select/InsuranceSelect.vue';
import UploadFileManager from 'src/components/file/UploadFileManager.vue';
import FileManager from 'src/components/file/FileManager.vue';
import EventWrite from 'src/pages/event/components/EventWrite.vue';

import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { requiredInput } from 'src/helpers/validation';
import { intlDate } from 'src/helpers/date';
import { cleanCurrency, downloadResource, generateUniqueId, roundToPrecision } from 'src/helpers';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import ConciliationPayment from './components/ConciliationPayment.vue';
import RowStatus from 'src/components/RowStatus.vue';

const props = defineProps({ id: Number, eventId: String, width: String, isDrawer: Boolean })
const $api = inject("$api")
const $cats = inject("$cats")
const $q = useQuasar()
const router = useRouter()

const mainForm = ref();

const options = reactive({
    currency: $cats.value.currency,
    policy_branch: $cats.value.policy_branch,
})

const initialItem = () => ({
    diagnosis: [],
    notes: [],
    $book_state_id: 50,
    $currency_id: 14,
    book_date: intlDate(new Date()),
})

const state = reactive({
    payments: [],
    submitting: false,
    loading: true,
    event: {},
    items: [],
    item: initialItem(),
})

const isEdit = computed(() => {
    return Boolean(props.id)
})

const coverage = computed(() => {
    const result = state.items.reduce((total, curr) => {
        if (curr.c_status & 1) return total;
        total += (cleanCurrency(curr.coverage) || 0);
        return total;
    }, 0);
    return roundToPrecision(result);
})

const discount = computed(() => {
    const result = state.items.reduce((total, curr) => {
        if (curr.c_status & 1) return total;
        total += (cleanCurrency(curr.discount) || 0);
        return total;
    }, 0);
    return roundToPrecision(result);
})

const billed_amount = computed(() => {
    const result = state.items.reduce((total, curr) => {
        if (curr.c_status & 1) return total;
        total += (cleanCurrency(curr.billed_amount) || 0);
        return total;
    }, 0);
    return roundToPrecision(result);
})

const deductible = computed(() => {
    const result = state.items.reduce((total, curr) => {
        if (curr.c_status & 1) return total;
        total += (cleanCurrency(curr.deductible) || 0);
        return total;
    }, 0);
    return roundToPrecision(result);
})

const copago = computed(() => {
    const result = state.items.reduce((total, curr) => {
        if (curr.c_status & 1) return total;
        total += (cleanCurrency(curr.copago) || 0);
        return total;
    }, 0);
    return roundToPrecision(result);
})

const covered = computed(() => {
    const result = state.items.reduce((total, curr) => {
        if (curr.c_status & 1) return total;
        total += (cleanCurrency(curr.covered) || 0);
        return total;
    }, 0);
    return roundToPrecision(result);
})

const insurance_payment = computed(() => {
    const result = state.items.reduce((total, curr) => {
        if (curr.c_status & 1) return total;
        total += (cleanCurrency(curr.insurance_payment) || 0);
        return total;
    }, 0);
    return roundToPrecision(result);
})

const insurance_responsability = computed(() => {
    const result = state.items.reduce((total, curr) => {
        if (curr.c_status & 1) return total;
        total += (cleanCurrency(curr.insurance_responsability) || 0);
        return total;
    }, 0);
    return roundToPrecision(result);
})

async function setInsured(id) {
    try {
        if (!id) return;
        const insured = await $api.get(`insured/${id}`);
        if (!props.isEdit && insured.policies) {
            const policy = insured.policies[0]
            setPolicy(policy)
        }
        state.item.insured_id = insured.id;
        state.item.insured_description = insured.fullname;
    } catch (error) {
        console.log(error);
    }
}

function clearInsured() {
    state.item.insured_id = null;
    state.item.insured = null;
    clearPolicy()
}

async function setTitular(id) {
    try {
        if (!id) return;
        const titular = await $api.get(`insured/${id}`);
        state.item.titular_id = titular.id;
        state.item.titular_description = titular.fullname;
    } catch (error) {
        console.log(error);
    }
}

function clearTitular() {
    state.item.titular_id = null;
    state.item.titular = null;
}

function addNote() {
    state.item.notes.push({
        id: state.item.notes.length ? state.item.notes[state.item.notes.length - 1].id + 1 : 1,
        description: state.note
    })

    state.note = null
}

function removeNote(id) {
    const index = state.item.notes.findIndex((i) => i.id === id)
    state.item.notes.splice(index, 1)
}

async function setPolicy(policy) {

    if (!state.item.insured_id) {
        state.item.insured_id = policy.insured_id
        state.item.insured_description = policy.insured_description
    }
    state.item.insurance_id = policy.insurance_id;
    state.item.insurance_description = policy.insurance;
    state.item.titular_id = policy.titular_id;
    state.item.titular_description = policy.titular_description;
    state.item.insured_code = policy.insured_code
    state.item.deductible = policy.deductible
    state.item.policy_id = policy.id
    state.item.policy_number = policy.policy_number
    state.item.policy_branch = policy.policy_branch
    state.item.$policy_branch_id = policy.$policy_branch_id
}

async function clearPolicy() {
    state.item.insurance_id = null;
    state.item.insurance_description = null;
    state.item.titular_id = null;
    state.item.titular_description = null;
    state.item.insured_code = null
    state.item.policy_id = null
    state.item.policy_number = null
    state.item.deductible = null
}

async function setDiagnosis(id) {
    try {
        const diagnosis = await $api.get(`ICD10/${id}`)
        const index = state.item.diagnosis.findIndex((i) => i.id === id)
        if (index !== -1) {
            $q.notify({
                type: 'warning',
                message: 'Diagnóstico ya esta agregado'
            })
            return;
        }
        state.item.diagnosis.push({
            id: diagnosis.id,
            code: diagnosis.code,
            description: diagnosis.description
        })

        state.item.diagnosis_description = null;
        state.item.diagnosis_id = null;

    } catch (error) {
        console.log(error);
    }
}

function clearDiagnosis() {
    try {
        state.item.diagnosis_id = null;
        state.item.diagnosis_description = null;
    } catch (error) {
        console.log(error);
    }
}

function removeDiagnosis(id) {
    try {
        const index = state.item.diagnosis.findIndex((i) => i.id === id)
        state.item.diagnosis.splice(index, 1)
    } catch (error) {
        console.log(error);
    }
}

function onReset() {
    state.item = initialItem()
    setTimeout(() => {
        mainForm.value.resetValidation()
    })
    onInit()
}


async function onPrint() {
    state.submitting = true
    const url = await $api.get(`conciliation/pdf/${props.id}`)
    console.log(11, url);
    downloadResource(url, `${state.item.code}-${state.item.insurance_description}`.toUpperCase())
    state.submitting = false
}

async function onSubmit() {
    try {

        if (isEdit.value) {
            const book_items = state.items.filter(i => i.item_id)

            if (!book_items.length) {
                $q.notify({
                    type: 'success',
                    message: `Es requerido que la reconcilición tenga por lo menos 1 CPT`
                })
                return;
            }
            const response = await $api.put(`conciliation/${props.id}`, {
                book: {
                    ...state.item,
                    billed_amount_total: billed_amount.value,
                    coverage_total: coverage.value,
                    discount_total: discount.value,
                    deductible_total: deductible.value,
                    copago_total: copago.value,
                    covered_total: covered.value,
                    insurance_payment_total: insurance_payment.value,
                    insurance_responsability_total: insurance_responsability.value,
                },
                book_items,
                book_payments: state.payments,
            });

            if (response) {
                $q.notify({
                    type: 'success',
                    message: `Reconciliación Editada ${response.code}`
                })
                location.reload()
                onInit()
            }
        } else {

            const response = await $api.post('conciliation', {
                book: {
                    ...state.item,
                    billed_amount_total: billed_amount.value,
                    coverage_total: coverage.value,
                    discount_total: discount.value,
                    deductible_total: deductible.value,
                    copago_total: copago.value,
                    covered_total: covered.value,
                    insurance_payment_total: insurance_payment.value,
                    insurance_responsability_total: insurance_responsability.value,
                },
                book_items: state.items.filter(i => i.c_status === 4 && i.item_id),
                book_payments: state.payments.filter(i => i.c_status === 4),
            });

            if (props.eventId) {
                $api.put(`event/general/${props.eventId}`, {
                    book_code: response.code,
                })
            }

            if (response) {
                $q.notify({
                    type: 'success',
                    message: `Reconciliación agregada ${response.code}`
                })
                await $api.get(`conciliation/pdf/${response.code}`)
                // location.reload()
                onReset()
                router.push(`/`)
                onInit()
            }
        }

    } catch (error) {
        console.log(error);
    }
}

async function onInit() {
    try {

        if (isEdit.value) {
            const { item, items, payments } = await $api.get(`conciliation/${props.id}`)
            state.item = item
            state.items = items
            state.payments = payments

            if (state.item.event_id) {
                state.event = await $api.get(`event/${state.item.event_id}`)
            }

            state.loading = false
            return;
        }
        if (props.eventId) {

            state.event = await $api.get(`event/${props.eventId}`);
            state.policy = await $api.get(`policy/insured/${state.event.policy_id}`)
            state.item.event_id = state.event.id;
            setPolicy(state.policy)
            state.item.diagnosis = state.event.diagnosis

            state.itineraries = await $api.get(`itinerary`, {
                params: {
                    where: {
                        c_status: 4,
                        event_id: props.eventId
                    },
                    returnItems: true
                }
            });

            for (let i = 0; i < state.itineraries.length; i++) {
                const itinerary = state.itineraries[i];
                for (let i = 0; i < itinerary.mprocedure.length; i++) {
                    const mprocedure = itinerary.mprocedure[i];
                    state.items.push({
                        c_status: 4,
                        book_date: itinerary.attendance_date,
                        item_id: mprocedure.id,
                        item_description: mprocedure.description,
                        provider_id: itinerary.provider_id,
                        provider_description: itinerary.provider_description,
                        quantity: 1,
                        reset: 0,
                        billed_amount: null,
                        coverage: null,
                        deductible: null,
                        covered: null,
                        insurance_payment: null,
                        insurance_responsability: null,
                        insurance_claim: null,
                        note: null,
                    })
                }
            }

            await setInsured(state.event.insured_id)
            state.item.user_id = state.event.user_id;
            state.item.user_description = state.event.user_description;

        }
        state.loading = false
    } catch (error) {
        console.log(error);
    }
}

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