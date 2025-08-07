<template>
    <q-select ref="refContactSelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon use-input
        hide-selected fill-input input-debounce="0" emit-value map-options option-value="id" option-label="description"
        :model-value="contactModel" label="Elegir Contacto" :options="contactOptions" @input-value="contactModel = $event"
        @update:model-value="setContact" @filter="filterFnContact" @clear="clearContact">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none" v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex">
                            <span>{{ scope.opt.description }}</span>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !contactModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>

        <template v-slot:after>
            <q-btn v-if="selectedId" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-duotone fa-solid fa-magnifying-glass" @click="openDialogDetail">
                <q-tooltip class="bg-default text-black text-xs">Ver detalles</q-tooltip>
            </q-btn>
        </template>

        <q-dialog v-model="state.dialogDetail">
            <q-card class="shadow pt-4 px-6 pb-4 flex-col w-[400px]">
                <div class="font-bold">{{ state.selected.description }}</div>
                <div class="subtitle text-xs">Especialidad</div>
                <ul class="list-inside" v-for="row in state.selected.speciality" :key="row.id">
                    <li>{{ row.description }}</li>
                    <ul class="list-inside ml-4" v-for="sub in row.sub" :key="sub.description">
                        <li v-if="sub.checked">{{ sub.description }}</li>
                    </ul>
                </ul>
                <div class="subtitle text-xs">Proveedor</div>
                <ul class="list-inside" v-for="row in state.selected.provider" :key="row.id">
                    <li>{{ row.description }}</li>
                </ul>
                <div class="subtitle text-xs">Bio</div>
                <div>{{ state.selected.bio }}</div>
            </q-card>
        </q-dialog>

    </q-select>
</template>

<script setup>
import { useContact } from 'src/use/contact';
import { inject, onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setContact', 'clearContact'])
const $api = inject("$api")

const props = defineProps({ modelValue: String, id: Number, providerId: Number })
const selectedId = ref(props.id)

const state = reactive({
    dialogDetail: false,
    selected: {},
    refId: props.providerId
})

watch(() => props.providerId, (val) => {
    state.refId = val
})

watch(() => props.modelValue, (val) => {
    contactModel.value = val
})

async function openDialogDetail() {
    state.selected = await $api.get(`contact/${selectedId.value}`)
    console.log(state.selected);
    state.dialogDetail = true;
}

function setContact(id) {
    if (!id) {
        refContactSelect.value.focus();
        setTimeout(() => {
            refContactSelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    contactModel.value = contactOptions.value.reduce((acc, curr) => {
        if (curr.id === id) {
            acc = curr.description
        }
        return acc;
    })
    $emit('setContact', id)
}

function clearContact() {
    selectedId.value = null
    contactModel.value = null
    $emit('clearContact')
}

onMounted(() => {
    contactModel.value = props.modelValue
})

const { filterFnContact, refContactSelect, contactOptions, contactModel } = useContact(state)

</script>