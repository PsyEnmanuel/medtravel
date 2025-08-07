<template>
    <div bordered flat class="card pb-2 relative flex flex-col justify-between">
        <div class="flex flex-nowrap">
            <div class="absolute right-3 top-2">
                <q-checkbox dense v-model="item.selected" :label="item.row.name" />
            </div>
            <q-avatar rounded size="48px" class="p-2">
                <img :src="$imageInsuredPlaceholder(item.row.sex)" />
            </q-avatar>
            <div class="pl-3 pr-8 w-full pt-2 flex flex-col overflow-hidden text-xs line-clamp-1">
                <span class="text-uppercase font-bold">{{ item.row.description }}</span>

                <span>{{ item.row.ident_no }}</span>
                <span>#{{ item.row.record_format }}</span>
                <span>{{ item.row.phone }}</span>
                <span>{{ item.row.email }}</span>
                <span>{{ item.row.location_format }}</span>
                <div class="text-xxs" v-if="item.row.attention_type">
                    <q-badge outline color="font text-xxs">{{ item.row.attention_type.join(", ") }}</q-badge>
                </div>
                <div v-for="provider in item.row.provider" :key="provider.id">
                    <div class="text-xxs bg-200">Proveedores:</div>
                    <div class="text-xxs">- {{ provider.description }}</div>
                </div>
            </div>
        </div>

        <div class="flex ml-auto gap-2 pr-3 mt-2">
            <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
                @click="$emit('selectedId', item.row.id)" />
            <q-btn flat class="button bg-default text-primary rounded-md" label="consultar" no-caps
                @click="$router.push(`${$path.doctor}/${$path.doctor_consult}/${item.row.id}`)" />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({ item: {} })
</script>