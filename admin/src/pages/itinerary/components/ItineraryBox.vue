<template>
    <div class="card flex lg:flex-nowrap gap-1 min-h-[200px]">
        <!-- <div class="absolute right-3 top-2">
            <q-checkbox dense v-model="item.selected" :label="item.row.name" />
        </div> -->
        <div class="lg:w-[200px] flex justify-center text-center w-full">
            <q-img v-if="item.row.doctor_profile_pic" class="h-[200px]" :src="item.row.doctor_profile_pic.url"
                spinner-color="white" />
            <q-img v-else class="h-[200px]" :src="$imageDoctorPlaceholder()"
                spinner-color="white" />
        </div>
        <div class="w-full flex flex-col gap-1 p-4">
            <div class="flex lg:flex-nowrap justify-between gap-1 items-start">
                <div class="font-bold text-xs w-full">{{ item.row.attendance_readabletime }}</div>
                <div class="flex flex-nowrap items-center justify-end w-full text-primary font-bold text-xxs gap-1">
                    <q-badge :style="{ background: item.row.color }"
                        class="flex justify-center text-center font-bold text-xxs">
                        {{ item.row.event_category }}
                    </q-badge>
                    <span class="pr-1">{{ item.row.event_state }}</span>
                </div>
            </div>
            <div v-if="item.row.doctor_id" class="flex items-center">
                <div class="flex items-center gap-2">
                    <div class="bg-default p-1 rounded-md text-center font-bold text-xxs">Doctor
                    </div>
                    <span class="text-xxs">{{ item.row.doctor_description }}</span>
                </div>
                <q-btn flat class="button-icon bg-primary text-white rounded-md ml-auto" size="xs" no-caps
                    :to="`/medicos/consultar/${item.row.doctor_id}`" label="consultar">
                    <q-tooltip class="bg-default text-black text-xs">Consultar Doctor</q-tooltip>
                </q-btn>
            </div>
            <div v-if="item.row.provider_id" class="flex items-center">
                <div class="flex items-center gap-2">
                    <div class="bg-default p-1 rounded-md text-center font-bold text-xxs">Proveedor
                    </div>
                    <span class="text-xxs">{{ item.row.provider_description }}</span>
                </div>
                <q-btn flat class="button-icon bg-primary text-white rounded-md ml-auto" size="xs" no-caps
                    :to="`/proveedor/consultar/${item.row.provider_id}`" label="consultar">
                    <q-tooltip class="bg-default text-black text-xs">Consultar Proveedor</q-tooltip>
                </q-btn>
            </div>
            <div class="grid lg:grid-cols-2 gap-1">
                <div v-if="item.row.diagnosis?.length">
                    <div class="bg-default rounded-md text-center font-bold text-xxs">Diagnósticos</div>
                    <div v-for="diag in item.row.diagnosis" :key="diag.id">
                        <div class="text-xxs"><b>{{ diag.code }}</b> {{ diag.description }}</div>
                    </div>
                </div>
                <div v-if="item.row.mprocedure?.length">
                    <div class="bg-default rounded-md text-center font-bold text-xxs">CPT</div>
                    <div v-for="diag in item.row.mprocedure" :key="diag.id">
                        <div class="text-xxs"><b>{{ diag.code }}</b> {{ diag.description }}</div>
                    </div>
                </div>
            </div>
            <div class="grid lg:grid-cols-2 gap-1">
                <span v-if="item.row.user_description" class="border-t pt-1 text-xxs">{{ item.row.user_description
                }}</span>
                <span v-if="item.row.request_date_format" class="border-t pt-1 text-xxs text-right">{{
                    item.row.request_date_format }}</span>
            </div>
            <div class="grid lg:grid-cols-2 gap-1 mt-auto">
                <div></div>
                <q-btn flat class="button bg-default text-primary rounded-md w-full" label="consultar coordinación"
                    no-caps size="xs" @click.stop="$router.push(`/coordinaciones/consultar/${item.row.id}`)" />
            </div>
        </div>
    </div>
</template>

<script setup>

const props = defineProps({
    item: Object, showOptions: {
        type: Boolean,
        default: false
    },
});

</script>