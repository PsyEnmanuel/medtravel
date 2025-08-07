<template>
    <div class="w-full">
        <div class="subtitle text-xs text-center">Pagos</div>
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
                        <template v-else-if="col.name === 'description'">
                            <q-input dense outlined v-model="props.row.description" hide-bottom-space>
                            </q-input>
                        </template>
                        <template v-else-if="col.name === 'note'">
                            <q-input dense outlined v-model="props.row.note" hide-bottom-space>
                            </q-input>
                        </template>
                        <template v-else-if="col.name === 'insurance_payment'">
                            <q-input input-class="text-right" dense outlined v-model="props.row.insurance_payment"
                                v-maska:[optionsMoney] data-maska="0.99" :data-maska-tokens="maskaMoney"
                                hide-bottom-space @update:model-value="updateResponsability(props.row)">
                            </q-input>
                        </template>
                        <template v-else-if="col.name === 'insurance_responsability'">
                            <q-input input-class="text-right" dense outlined
                                v-model="props.row.insurance_responsability" v-maska:[optionsMoney] data-maska="0.99"
                                :data-maska-tokens="maskaMoney" hide-bottom-space>
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
import { format } from "date-fns";

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
        { name: 'description', label: t('DESC.'), field: 'description', align: 'left', classes: 'min-w-[100px]' },
        { name: 'note', label: t('NOTA'), field: 'note', align: 'left', classes: 'min-w-[100px]' },
        { name: 'insurance_payment', label: t('PAGO DE ASEGURADA'), field: 'insurance_payment', align: 'left', classes: 'min-w-[100px]' },
        { name: 'insurance_responsability', label: t('RESP. ASEGURADA'), field: 'insurance_responsability', align: 'left', classes: 'min-w-[100px]' },
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

function updateResponsability(row) {

    const insurance_payment = cleanCurrency(row.insurance_payment || 0)
    const deductible = cleanCurrency(row.deductible || 0)

    row.insurance_responsability = insurance_payment - deductible

}

const defaultItem = () => ({
    book_date: format(new Date(), 'dd-MM-yyyy'),
    c_status: 4,
    quantity: 1,
    reset: 0,
    insurance_payment: null,
    insurance_responsability: null,
    note: null,
})

function addRow() {
    state.rows.push(defaultItem())
}

onMounted(() => {
    state.rows = props.items.concat(Array.from({ length: 2 }, () => defaultItem()))
})

</script>