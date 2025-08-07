<template>
    <div class="grid grid-cols-2 gap-2">
        <div>
            <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Solicitudes Asignadas
            </div>
            <TaskTable :user_id="$me.id" />
        </div>
        <div>
            <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Solicitudes Creadas
            </div>
            <TaskTable :created_by_id="$me.id" />
        </div>
    </div>
</template>

<script setup>
import { inject } from 'vue';
import TaskTable from './components/TaskTable.vue';

const $me = inject("$me")
</script>