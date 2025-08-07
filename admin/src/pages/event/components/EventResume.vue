<template>
    <div class="flex flex-col gap-2">
        <div class="subtitle pl-4 shadow-left-primary mb-1">{{ event_state[0].label }}</div>
        <div class="flex flex-col gap-0.5 bg-gray-100 p-2 rounded-lg text-xs">
            <div class="flex gap-2">
                <div class="font-bold">Proveedor:</div>
                <div>{{ item.provider_description }}</div>
            </div>
        </div>
        <div class="subtitle pl-4 shadow-left-primary mb-1">{{ event_state[1].label }}</div>
        <div class="flex flex-col gap-0.5 bg-gray-100 p-2 rounded-lg text-xs">
            <div class="flex gap-2">
                <div class="font-bold">Usuario:</div>
                <div>{{ item.user_description }}</div>
            </div>
        </div>
        <div class="subtitle pl-4 shadow-left-primary mb-1">{{ event_state[2].label }}</div>
        <div class="flex flex-col gap-0.5 bg-gray-100 p-2 rounded-lg text-xs">
            <div class="flex gap-2">
                <div class="font-bold">Asegurado:</div>
                <div>{{ item.insured }}</div>
            </div>
            <div class="flex gap-2">
                <div class="font-bold">{{ $t('insured_code') }}:</div>
                <div>{{ item.insured_code }}</div>
            </div>
            <div class="flex gap-2">
                <div class="font-bold">{{ $t('ident_no') }}:</div>
                <div>{{ item.ident_no }}</div>
            </div>
            <div class="flex gap-2">
                <div class="font-bold">{{ $t('birthdate') }}:</div>
                <div>{{ item.birthdate }}</div>
            </div>
            <div class="flex gap-2">
                <div class="font-bold">{{ $t('MRN') }}:</div>
                <div>{{ item.MRN }}</div>
            </div>
            <div class="p-2 rounded-md text-center font-bold text-xs">Diagnósticos</div>
            <div class="flex flex-nowrap gap-1" v-for="(item, index) in item.diagnosis" :key="item.id">
                <div class="w-full max-w-[40px] min-w-[40px] flex justify-center items-center border card shadow-none">
                    {{ index + 1 }}</div>
                <div class="w-full flex flex-col justify-between border card shadow-none px-3 py-1">
                    <div class="text-xs uppercase pr-4 line-clamp-1">{{ item.description }}</div>
                    <div class="text-xs uppercase pr-4 line-clamp-1">{{ item.code }}</div>
                </div>
            </div>
            <div class="p-2 rounded-md text-center font-bold text-xs">
                Procedimiento Pivot
            </div>
            <div class="w-full flex flex-col justify-between border card shadow-none px-3 py-1">
                <div class="text-xs uppercase pr-4 line-clamp-1">{{ item.mprocedure_pivot }}</div>
            </div>
            <div class="p-1 rounded-md text-center font-bold text-xs">
                Procedimientos CPT
            </div>
            <div class="flex flex-nowrap gap-1" v-for="(item, index) in item.mprocedure" :key="item.id">
                <div class="w-full max-w-[40px] min-w-[40px] flex justify-center items-center border card shadow-none">
                    {{ index + 1 }}</div>
                <div class="w-full flex flex-col justify-between border card shadow-none px-3 py-1">
                    <div class="text-xs uppercase pr-4 line-clamp-1">{{ item.description }}</div>
                    <div class="text-xs uppercase pr-4 line-clamp-1">{{ item.code }}</div>
                </div>
            </div>
        </div>
        <div class="subtitle pl-4 shadow-left-primary mb-1">{{ event_state[3].label }}</div>
        <div class="flex flex-col gap-0.5 bg-gray-100 p-2 rounded-lg text-xs">
            <div class="flex gap-2">
                <div class="font-bold">{{ $t('request_date') }}:</div>
                <div>{{ item.request_date }}</div>
            </div>
            <div class="flex gap-2">
                <div class="font-bold">{{ $t('attendance_date') }}:</div>
                <div>{{ item.attendance_date }}</div>
            </div>
            <div class="flex gap-2">
                <div class="font-bold">{{ $t('attendance_time') }}:</div>
                <div>{{ item.attendance_time }} {{ item.attendance_time_format }}</div>
            </div>
        </div>
        <div class="subtitle pl-4 shadow-left-primary mb-1">{{ event_state[4].label }}</div>
        <div v-if="item.VOB_file" class="relative">
            <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Adjuntar recepción
                VOB
            </div>
            <object v-if="item.VOB_file.icon === 'pdf'" :data="item.VOB_file.url" type="application/pdf" width="100%"
                height="200px">
                <p>Your browser does not support PDFs. <a :href="item.VOB_file.url">Download the PDF</a>.</p>
            </object>

            <q-img v-else class="card w-full max-h-[128px] object-contain" :src="item.VOB_file.url"
                spinner-color="white" />
        </div>
        <div v-if="item.HIPAA_file" class="relative">
            <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Adjuntar
                HIPAA
            </div>
            <object v-if="item.HIPAA_file.icon === 'pdf'" :data="item.HIPAA_file.url" type="application/pdf"
                width="100%" height="200px">
                <p>Your browser does not support PDFs. <a :href="item.HIPAA_file.url">Download the PDF</a>.</p>
            </object>

            <q-img v-else class="card w-full max-h-[128px] object-contain" :src="item.HIPAA_file.url"
                spinner-color="white" />
        </div>
        <div v-if="item.ROI_file" class="relative">
            <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Adjuntar
                ROI
            </div>
            <object v-if="item.ROI_file.icon === 'pdf'" :data="item.ROI_file.url" type="application/pdf" width="100%"
                height="200px">
                <p>Your browser does not support PDFs. <a :href="item.ROI_file.url">Download the PDF</a>.</p>
            </object>

            <q-img v-else class="card w-full max-h-[128px] object-contain" :src="item.ROI_file.url"
                spinner-color="white" />
        </div>
        <div v-if="item.ROI_file" class="relative">
            <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Adjuntar
                ROI
            </div>
            <object v-if="item.NOTAS_MEDICAS_file.icon === 'pdf'" :data="item.NOTAS_MEDICAS_file.url" type="application/pdf" width="100%"
                height="200px">
                <p>Your browser does not support PDFs. <a :href="item.NOTAS_MEDICAS_file.url">Download the PDF</a>.</p>
            </object>

            <q-img v-else class="card w-full max-h-[128px] object-contain" :src="item.NOTAS_MEDICAS_file.url"
                spinner-color="white" />
        </div>
        <div class="subtitle pl-4 shadow-left-primary mb-1">{{ event_state[5].label }}</div>
        <div class="flex flex-col gap-0.5 bg-gray-100 p-2 rounded-lg text-xs">
            <div class="flex gap-2">
                <div class="font-bold">{{ $t('doctor') }}:</div>
                <div>{{ item.doctor_description }}</div>
            </div>
            <div class="flex gap-2">
                <div class="font-bold">{{ $t('contact') }}:</div>
                <div>{{ item.contact_description }}</div>
            </div>
        </div>
        <div class="subtitle pl-4 shadow-left-primary mb-1">{{ event_state[6].label }}</div>
        <div v-if="item.medical_guide_file" class="relative">

            <object v-if="item.medical_guide_file.icon === 'pdf'" :data="item.medical_guide_file.url"
                type="application/pdf" width="100%" height="200px">
                <p>Your browser does not support PDFs. <a :href="item.medical_guide_file.url">Download the PDF</a>.</p>
            </object>

            <q-img v-else class="card w-full max-h-[128px] object-contain" :src="item.medical_guide_file.url"
                spinner-color="white" />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({ item: Object, event_state: Array })
</script>