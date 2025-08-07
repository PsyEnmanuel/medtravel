<template>
    <div bordered flat class="card pb-2 relative flex flex-col justify-between min-h-[380px]">
        <div class="flex flex-nowrap">
            <div class="absolute right-3 top-2">
                <q-checkbox dense v-model="item.selected" :label="item.row.name" />
            </div>
            <q-avatar rounded size="48px" class="p-2">
                <img v-if="!item.row.profile?.url" :src="$imageInsuredPlaceholder(item.row.sex)" />
                <img v-else :src="item.row.profile?.url" class="object-contain">
            </q-avatar>
            <div class="pl-3 pr-8 w-full pt-2 flex flex-col overflow-hidden text-xs line-clamp-1">
                <span class="text-uppercase font-bold">{{ item.row.fullname }}</span>
                <span>{{ item.row.ident_no }}</span>
                <span>#{{ item.row.record_format }}</span>
                <span>{{ item.row.phone }}</span>
                <span>{{ item.row.email }}</span>
                <span>{{ item.row.location_format }}</span>
                <div class="flex gap-1">
                    <div v-for="(row, index) in item.row.language" :key="row.id">
                        <q-badge outline color="font" class="text-xxs">{{ row }}</q-badge>
                    </div>
                </div>
            </div>
        </div>
        <div class="pl-3 pr-8 w-full pt-2 flex flex-col overflow-hidden text-xs line-clamp-1">
            <div class="grid grid-cols-3 gap-1 mb-1">
                <q-badge v-if="item.row.high_profile" class="text-white text-center block">Alto perfil</q-badge>
            </div>
            <!-- <q-btn @click="item.row.show_policy = !item.row.show_policy" flat
                class="button bg-default text-primary rounded-md mb-1" size="xs" label="Mostar Pólizas"></q-btn> -->
            <div class="bg-default rounded-md text-center font-bold mb-1">Pólizas</div>
            <div v-for="(row, index) in item.row.policies" :key="row.id">
                <div v-if="!index" class="card flex flex-col p-2 mb-1">
                    <PolicyBox :row="row" />
                </div>
            </div>
            <q-badge v-if="item.row.policies.length > 1" class="mt-2">Paciente tiene más de una póliza</q-badge>
        </div>
        <div class="flex ml-auto gap-2 pr-3 mt-2">
            <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
                @click="$emit('selectedId', item.row.id)" />
            <q-btn flat class="button bg-default text-primary rounded-md" label="consultar" no-caps
                @click="$router.push(`${$path.insured}/${$path.insured_consult}/${item.row.id}`)" />
        </div>
    </div>
</template>

<script setup>
import PolicyBox from 'src/pages/policy/components/PolicyBox.vue';

const props = defineProps({ item: Object })
</script>