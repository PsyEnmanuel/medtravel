<template>
    <q-select ref="refProcedureSelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon use-input
        hide-selected fill-input input-debounce="0" emit-value map-options option-value="id" option-label="description"
        :model-value="procedureModel" label="Elegir CPT" :options="procedureOptions"
        @input-value="procedureModel = $event" @update:model-value="setProcedure" @filter="filterFnProcedure"
        @clear="clearProcedure">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none" v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex flex-nowrap">
                            <!-- <span class="min-w-[40px]">{{ scope.index + 1 }})</span> -->
                            <span>{{ scope.opt.code }} - {{ scope.opt.description }}</span>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !procedureModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>

        <template v-slot:after>
            <q-btn v-if="selectedId" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-duotone fa-solid fa-magnifying-glass" size="xs" @click="openDialogDetail">
                <q-tooltip class="bg-default text-black text-xs">Ver detalles</q-tooltip>
            </q-btn>
        </template>

        <!-- <template v-slot:append>
            <q-icon name="fa-solid fa-magnifying-glass" size="xs"></q-icon>
        </template> -->

    </q-select>

    <q-dialog v-model="state.dialogDetail">
        <q-card class="shadow pt-4 px-6 pb-4 flex-col w-[400px]">
            <div class="font-bold">{{ state.selected.code }}</div>
            <div class="font-bold">{{ state.selected.description }}</div>
        </q-card>
    </q-dialog>

</template>

<script setup>
import { useProcedure } from 'src/use/procedure';
import { inject, onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setProcedure', 'clearProcedure'])

const $api = inject("$api")

const props = defineProps({
    modelValue: String, id: Number, label: {
        type: String,
        default: 'Elegir Proveedor',
    }
})

const selectedId = ref(props.id)

const state = reactive({
    dialogDetail: false,
    selected: {}
})

watch(() => props.modelValue, (val) => {
    procedureModel.value = val
})

async function openDialogDetail() {
    state.selected = await $api.get(`CPT/${selectedId.value}`)
    state.dialogDetail = true;
}

function setProcedure(id) {
    if (!id) {
        refProcedureSelect.value.focus();
        setTimeout(() => {
            refProcedureSelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    procedureModel.value = procedureOptions.value.reduce((acc, curr) => {
        if (curr.id === id) {
            acc = curr.description
        }
        return acc;
    })
    $emit('setProcedure', id)
}

function clearProcedure() {
    selectedId.value = null
    procedureModel.value = null
    $emit('clearProcedure')
}

onMounted(() => {
    procedureModel.value = props.modelValue
})

const { filterFnProcedure, refProcedureSelect, procedureOptions, procedureModel } = useProcedure()

</script>