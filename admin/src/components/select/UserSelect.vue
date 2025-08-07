<template>
    <q-select ref="refUserSelect" dense outlined clearable="" behavior="menu" hide-dropdown-icon use-input hide-selected
        fill-input input-debounce="0" emit-value map-options option-value="id" option-label="description"
        :model-value="userModel" :label="label" :options="userOptions" @input-value="userModel = $event"
        @update:model-value="setUser" @filter="filterFnUser" @clear="clearUser">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none" v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex">
                            <div class="flex flex-col gap-2 leading-3">
                                <span>{{ scope.opt.description }}</span>
                                <span class="text-xxs">{{ scope.opt.roles_format }}</span>
                            </div>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !userModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>

        <template v-slot:after>
            <q-btn v-if="selectedId && $me.unixroles & 3" flat
                class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-duotone fa-solid fa-magnifying-glass" @click="openDialogDetail">
                <q-tooltip class="bg-default text-black text-xs">Ver detalles</q-tooltip>
            </q-btn>
        </template>

        <q-dialog v-model="state.dialogDetail">
            <q-card class="shadow pt-4 px-6 pb-4 flex-col w-[400px]">
                <div class="font-bold">{{ state.selected.description }}</div>
                <div>{{ state.selected.roles_format }}</div>
                <div>{{ state.selected.phone }}</div>
                <div>{{ state.selected.email }}</div>
            </q-card>
        </q-dialog>

        <q-dialog class="q-pa-none left-0" v-model="state.dialogDetail" full-height full-width maximized
            :transition-duration="$isDesktop ? 100 : 0">
            <q-card class="shadow pt-2 px-3 pb-2 flex-col">
                <UserRead :id="selectedId" isDrawer @close="setUser($event); state.dialogDetail = false" />
            </q-card>
        </q-dialog>

        <q-dialog class="q-pa-none left-0" v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'"
            full-height maximized :transition-duration="$isDesktop ? 100 : 0">
            <q-card>
                <UserWrite isDrawer :providerId="providerId" @close="setUser($event); state.dialogCreate = false;"
                    :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>

    </q-select>
</template>

<script setup>
import UserRead from 'src/pages/user/components/UserRead.vue';
import UserWrite from 'src/pages/user/components/UserWrite.vue';
import { useUser } from 'src/use/user';
import { inject, onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setUser', 'clearUser'])
const $api = inject("$api")

const props = defineProps({
    modelValue: String, id: Number, unixroles: Number, label: {
        type: String,
        default: 'Elegir Usuario'
    }
})
const selectedId = ref(props.id)

const state = reactive({
    dialogDetail: false,
    selected: {},
    unixroles: props.unixroles
})

watch(() => props.modelValue, (val) => {
    userModel.value = val
})

async function openDialogDetail() {
    state.selected = await $api.get(`user/${selectedId.value}`)
    state.dialogDetail = true;
}

function setUser(id) {
    if (!id) {
        refUserSelect.value.focus();
        setTimeout(() => {
            refUserSelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    userModel.value = userOptions.value.reduce((acc, curr) => {
        if (curr.id === id) {
            acc = curr.description
        }
        return acc;
    })
    $emit('setUser', id)
}

function clearUser() {
    selectedId.value = null
    userModel.value = null
    $emit('clearUser')
}

onMounted(() => {
    userModel.value = props.modelValue
})

const { filterFnUser, refUserSelect, userOptions, userModel } = useUser(state)

</script>