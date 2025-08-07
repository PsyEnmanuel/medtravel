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
                <span>{{ item.row.contact_type }}</span>
                <span>{{ item.row.contact_position }}</span>
                <div class="bg-default rounded-md text-center font-bold mb-1">Proveedores</div>
                <div class="flex flex-col text-xs gap-0.5" v-for="provider in item.row.provider" :key="provider.id">
                    <div>{{ provider.description }}</div>
                </div>
            </div>
        </div>

        <div class="flex ml-auto gap-2 pr-3 mt-2">
            <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
                @click="$emit('selectedId', item.row.id)" />
            <q-btn flat class="button bg-default text-primary rounded-md" label="consultar" no-caps
                @click="$router.push(`${$path.contact}/${$path.contact_consult}/${item.row.id}`)" />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({ item: {} })
</script>