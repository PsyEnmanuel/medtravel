<template>
    <div>

        <div bordered flat class="card pb-2 relative flex flex-nowrap">
            <div class="absolute right-3 top-2">
                <q-checkbox dense v-model="item.selected" />
            </div>
            <div class="pl-3 pr-8 w-full pt-2 flex flex-col overflow-hidden">
                <span class="text-uppercase line-clamp-1 font-semibold">{{ item.row.description }}</span>
                <span class="text-uppercase line-clamp-1 text-xxs">{{ item.row.lodging_type }}</span>
                <span class="text-uppercase line-clamp-1 text-xxs">{{ item.row.MRN }}</span>
                <span class="text-uppercase line-clamp-1 text-xxs">{{ item.row.address }}</span>
                <span class="text-uppercase line-clamp-1 text-xxs">{{ item.row.webpage }}</span>
                <div class="flex justify-end gap-2 -mr-5 mt-1">
                    <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
                        @click="$emit('selectedId', item.row.id)" />
                    <q-btn flat class="button bg-default text-primary rounded-md" label="consultar" no-caps
                        @click="$router.push(`${$path.lodging}/${$path.lodging_consult}/${item.row.id}`)" />
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
const props = defineProps({ item: Object })
</script>