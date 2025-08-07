<template>
    <div v-if="$isDesktop" class="grid grid-flow-col auto-cols-max">
        <q-btn padding="8px" class="text-xs" flat no-caps>{{ itemsRange.start }} - {{ itemsRange.end
        }} de {{ rowsNumber }}</q-btn>
        <q-btn padding="4px" square icon="sym_o_first_page" flat @click="tableRef.firstPage()"></q-btn>
        <q-btn padding="4px" square icon="sym_o_navigate_before" flat @click="tableRef.prevPage()"></q-btn>
        <q-btn padding="4px" square icon="sym_o_navigate_next" flat @click="tableRef.nextPage()"></q-btn>
        <q-btn padding="4px" square icon="sym_o_last_page" flat @click="tableRef.lastPage()"></q-btn>
    </div>
</template>

<script setup>
const props = defineProps({ itemsRange: Object, tableRef: Object, rowsNumber: Number })
</script>