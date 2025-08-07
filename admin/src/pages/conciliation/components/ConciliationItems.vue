<template>
    <div class="w-full">
        <q-table hide-pagination :rows-per-page-options="[0]" :rows="validRows" :columns="state.columns" row-key="id"
            ref="tableRef" @request="onRequest" flat :loading="state.loading" :wrap-cells="true">

            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td class="text-xxs" v-for="col in props.cols" :key="col.name" :props="props">
                        <template v-if="col.name === 'date'">
                            <q-input dense outlined v-model="props.row.book_date" mask="##-##-####" :label="$t('date')"
                                :rules="[requiredInput]" hide-bottom-space>
                                <template v-slot:append>
                                    <q-icon name="event" class="cursor-pointer">
                                        <q-popup-proxy :ref="`popupRefs`">
                                            <q-date flat v-model="props.row.book_date" no-unset years-in-month-view
                                                minimal mask="DD-MM-YYYY"
                                                @update:model-value="hidePopup(props.rowIndex)">
                                            </q-date>
                                        </q-popup-proxy>
                                    </q-icon>
                                </template>
                            </q-input>
                        </template>
                        <template v-else-if="col.name === 'provider'">
                            <ProviderSelect @setProvider="setProvider($event, props.row)"
                                @clearProvider="clearProvider(props.row)" :model-value="props.row.provider_description"
                                :id="props.row.provider_id" />
                        </template>
                        <template v-else-if="col.name === 'user_description'">
                            <DoctorSelect @setDoctor="setDoctor($event, props.row)"
                                @clearDoctor="clearDoctor(props.row)" :model-value="props.row.doctor_description"
                                :id="props.row.doctor_id" />
                        </template>
                        <template v-else-if="col.name === 'item_description'">
                            <ProcedureSelect @setProcedure="setProcedure($event, props.row)"
                                @clearInsured="clearProcedure(props.row)" :model-value="props.row.item_description"
                                :id="props.row.item_id" />
                        </template>
                        <template v-else-if="col.name === 'quantity'">
                            <div class="flex flex-nowrap w-auto">
                                <q-input v-model="props.row.quantity" dense outlined class="w-[50px]" v-maska
                                    :data-maska="maskaNumber" :data-maska-tokens="maskaNumberToken"></q-input>
                                <div class="flex flex-col ml-1">
                                    <q-btn flat class="button bg-primary-light px-2 py-0.5 h-fit mb-0.5" size="xs"
                                        icon="add" @click="addQuantity(props.row)" />
                                    <q-btn flat class="button bg-danger-light px-2 py-0.5 h-fit" size="xs" rounded
                                        icon="remove" @click="substractQuantity(props.row)" />
                                </div>
                            </div>
                        </template>
                        <template v-else-if="col.name === 'billed_amount'">
                            <q-input :readonly="!props.row.item_id" input-class="text-right" dense outlined
                                v-model="props.row.billed_amount" v-maska:[optionsMoney] data-maska="0.99"
                                :data-maska-tokens="maskaMoney" hide-bottom-space
                                @update:model-value="updateCoverage(props.row)">
                            </q-input>
                        </template>
                        <template v-else-if="col.name === 'discount'">
                            <q-input :readonly="!props.row.item_id" input-class="text-right" dense outlined
                                v-model="props.row.discount" v-maska:[optionsMoney] data-maska="0.99"
                                :data-maska-tokens="maskaMoney" hide-bottom-space
                                @update:model-value="updateCoverage(props.row)">
                            </q-input>
                        </template>
                        <template v-else-if="col.name === 'coverage'">
                            <q-input :readonly="!props.row.item_id" input-class="text-right" dense outlined
                                v-model="props.row.coverage" v-maska:[optionsMoney] data-maska="0.99"
                                :data-maska-tokens="maskaMoney" hide-bottom-space
                                @update:model-value="updateDeductible(props.row)">
                            </q-input>
                        </template>
                        <template v-else-if="col.name === 'deductible'">
                            <q-input :readonly="!props.row.item_id" input-class="text-right" dense outlined
                                v-model="props.row.deductible" v-maska:[optionsMoney] data-maska="0.99"
                                :data-maska-tokens="maskaMoney" hide-bottom-space
                                @update:model-value="updateDeductible(props.row); updateResponsability(props.row)">
                            </q-input>
                        </template>
                        <template v-else-if="col.name === 'covered'">
                            <q-input :readonly="!props.row.item_id" input-class="text-right" dense outlined
                                v-model="props.row.covered" v-maska:[optionsMoney] data-maska="0.99"
                                :data-maska-tokens="maskaMoney" hide-bottom-space>
                            </q-input>
                        </template>
                        <template v-else-if="col.name === 'insurance_payment'">
                            <q-input :readonly="!props.row.item_id" input-class="text-right" dense outlined
                                v-model="props.row.insurance_payment" v-maska:[optionsMoney] data-maska="0.99"
                                :data-maska-tokens="maskaMoney" hide-bottom-space
                                @update:model-value="updateResponsability(props.row)">
                            </q-input>
                        </template>
                        <template v-else-if="col.name === 'insurance_responsability'">
                            <q-input readonly input-class="text-right" dense outlined
                                v-model="props.row.insurance_responsability" v-maska:[optionsMoney] data-maska="0.99"
                                :data-maska-tokens="maskaMoney" hide-bottom-space>
                            </q-input>
                        </template>
                        <template v-else-if="col.name === 'insurance_claim'">
                            <q-input :readonly="!props.row.item_id" dense outlined v-model="props.row.insurance_claim"
                                hide-bottom-space>
                            </q-input>
                        </template>
                        <template v-else-if="col.name === 'note'">
                            <q-input :readonly="!props.row.item_id" dense outlined v-model="props.row.note"
                                hide-bottom-space>
                            </q-input>
                        </template>

                        <template v-else>
                            {{ col.value }}
                        </template>
                    </q-td>
                </q-tr>
            </template>

            <template v-slot:no-data="{ icon, message, filter }">
                <NoData :icon="icon" :message="message" :filter="filter" />
            </template>

            <template v-slot:bottom>
                <q-btn flat class="button bg-primary-light w-full mt-2" no-caps @click="addRow">Agregar más
                    lineas</q-btn>
            </template>
        </q-table>
    </div>

</template>

<script setup>
import { computed, inject, nextTick, onMounted, reactive, ref, watch, getCurrentInstance } from "vue"
import { vMaska } from 'maska'
import { maskaNumberToken, maskaNumber, maskaMoney, optionsMoney } from 'src/helpers/mask'
import NoData from "src/components/table/NoData.vue";
import { useI18n } from "vue-i18n";
import { cleanCurrency, getPercent, roundToPrecision } from "src/helpers";
import { useQuasar } from "quasar";
import ProcedureSelect from "src/components/select/ProcedureSelect.vue";
import ProviderSelect from "src/components/select/ProviderSelect.vue";
import DoctorSelect from "src/components/select/DoctorSelect.vue";

const { t } = useI18n()
const $q = useQuasar()

const tableRef = ref()
const $api = inject('$api')

const props = defineProps({ items: Array, isEdit: Boolean })
const $emit = defineEmits(['setItems'])

const state = reactive({
    timeout: null,
    timeoutRow: null,
    columns: [
        { name: 'date', label: `Fecha`, field: 'date', align: 'left', classes: 'min-w-[150px]' },
        { name: 'provider', label: `Proveedor`, field: 'provider', align: 'left', classes: 'min-w-[250px]' },
        { name: 'user_description', label: `Prestador de Servicios`, field: 'user_description', align: 'left', classes: 'min-w-[150px]' },
        { name: 'item_description', label: `CPT`, field: 'item_description', align: 'left', classes: 'min-w-[250px]' },
        { name: 'billed_amount', label: t('MONTO FACTURADO'), field: 'billed_amount', align: 'left', classes: 'min-w-[100px]' },
        { name: 'discount', label: t('DESCUENTO DE AJUSTE'), field: 'discount', align: 'left', classes: 'min-w-[100px]' },
        { name: 'coverage', label: t('MONTO A PROCESAR'), field: 'coverage', align: 'left', classes: 'min-w-[100px]' },
        { name: 'deductible', label: t('DEDUCIBLE / COPAGO'), field: 'deductible', align: 'left', classes: 'min-w-[100px]' },
        { name: 'covered', label: t('CUBIERTO'), field: 'covered', align: 'left', classes: 'min-w-[100px]' },
        { name: 'insurance_payment', label: t('PAGO DE ASEGURADA'), field: 'insurance_payment', align: 'left', classes: 'min-w-[100px]' },
        { name: 'insurance_responsability', label: t('RESP. ASEGURADA'), field: 'insurance_responsability', align: 'left', classes: 'min-w-[100px]' },
        { name: 'insurance_claim', label: t('insurance_claim'), field: 'insurance_claim', align: 'left', classes: 'min-w-[100px]' },
        { name: 'note', label: t('NOTA'), field: 'note', align: 'left', classes: 'min-w-[100px]' },
    ],
    rows: []
})

const validRows = computed(() => {
    return state.rows.filter(i => i.c_status & 4)
})

watch(() => state.rows, (val) => {
    clearTimeout(state.timeout)
    state.timeout = setTimeout(() => {
        $emit("setItems", state.rows)
    }, 300);
}, { deep: true })

const popupRefs = ref([]);

const hidePopup = (index) => {
    if (popupRefs.value[index]) {
        popupRefs.value[index].hide();
    }
};

function addQuantity(row) {
    if (row.quantity) {
        row.quantity = parseInt(row.quantity) + 1
    } else {
        row.quantity = 1
    }
}

function substractQuantity(row) {
    if (parseInt(row.quantity) > 1) {
        row.quantity = parseInt(row.quantity) - 1
    }
}

function calculateDiscount(row) {
    row.discount = getPercent(+row.discount_percent, cleanCurrency(row.price))
}

function updateCoverage(row) {

    const billed_amount = cleanCurrency(row.billed_amount || 0)
    const discount = cleanCurrency(row.discount || 0)
    row.coverage = roundToPrecision(billed_amount - discount)

}

function updateDeductible(row) {

    const coverage = cleanCurrency(row.coverage || 0)
    const deductible = cleanCurrency(row.deductible || 0)

    if (coverage && deductible) {
        row.covered = coverage - deductible
    }

}

async function setProvider(id, row) {
    try {
        const provider = await $api.get(`provider/${id}`)
        row.provider_id = String(provider.id);
        row.provider_description = provider.description;

    } catch (error) {
        console.log(error);
    }
}

function clearProvider(row) {
    try {
        row.provider_id = null;
        row.provider_description = null;
    } catch (error) {
        console.log(error);
    }
}

async function setDoctor(id, row) {
    try {
        const doctor = await $api.get(`doctor/${id}`)
        row.doctor_id = doctor.id;
        row.doctor_description = doctor.description;
        setItinerary()
    } catch (error) {
        console.log(error);
    }
}

function clearDoctor(row) {
    try {
        row.doctor_id = null;
        row.doctor_description = null;
        setItinerary()
    } catch (error) {
        console.log(error);
    }
}

function updateResponsability(row) {

    const insurance_payment = cleanCurrency(row.insurance_payment || 0)
    const deductible = cleanCurrency(row.deductible || 0)

    row.insurance_responsability = insurance_payment - deductible

}

async function setProcedure(id, row) {
    try {

        const item = await $api.get(`CPT/${id}`)
        row.item_description = item.description
        row.item_id = item.id
        row.item_code = item.code

    } catch (error) {
        console.log(error);
    }
}

async function clearProcedure(row) {
    try {
        if (props.isEdit) {
            row.c_status = 1;
            return;
        }
        row.user_id = null
        row.user_description = null
        row.item_id = null
        row.item_description = null
        row.item_code = null
        row.billed_amount = null
        row.discount = null
        row.coverage = null
        row.deductible = null
        row.covered = null
        row.insurance_payment = null
        row.insurance_responsability = null
        row.insurance_claim = null
        row.note = null
    } catch (error) {
        console.log(error);
    }
}

const defaultItem = () => ({
    c_status: 4,
    user_id: null,
    user_description: null,
    item_description: null,
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

function addRow() {
    state.rows.push(defaultItem())
}

onMounted(() => {
    state.rows = props.items.concat(Array.from({ length: 5 }, () => defaultItem()))
})

</script>