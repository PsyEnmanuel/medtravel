<template>
    <div class="flex flex-col text-xs gap-0.5">
        <span><b>{{ $t('insurance') }}: </b>{{ row.insurance }}</span>
        <span><b>Contratante: </b>{{ row.customer_description }}</span>
        <span><b>Cliente: </b>{{ row.titular_description }}</span>
        <span><b>{{ $t('relationship') }}: </b>{{ row.relationship }}</span>
        <span><b>{{ $t('policy_number') }}: </b>{{ row.policy_number }}</span>
        <span><b>{{ $t('insured_code') }}: </b>{{ row.insured_code }}</span>
        <span><b>{{ $t('insured_type') }}: </b>{{ row.insured_type }}</span>
        <span><b>{{ $t('insurance_plan') }}: </b>{{ row.insurance_plan }}</span>
        <span><b>{{ $t('insurance_plan_type') }}: </b>{{ row.insurance_plan_type }}</span>
        <q-btn v-if="selectPolicy" flat class="button-icon text-[12px] h-[40px] bg-primary text-white" @click="$emit('selectPolicy', row)">
            Seleccionar póliza
            <q-tooltip class="bg-default text-black text-xs">Seleccionar póliza</q-tooltip>
        </q-btn>
    </div>
</template>

<script setup>
const props = defineProps({ row: Object, selectPolicy: Boolean })
</script>