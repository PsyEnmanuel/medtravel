<template>
    <div :style="style">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar Rol</p>
                    <b class="font-bold text-brand">{{ state.item.description}}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Rol</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form class="pb-16" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <q-input class="mb-2" dense outlined v-model="state.item.label" :label="$t('label')" :rules="[requiredInput]"
                hide-bottom-space></q-input>
            <q-input class="mb-2" dense outlined v-model="state.item.description" :label="$t('description')"></q-input>
            <q-select class="mb-2" dense outlined clearable v-model="state.item.value" :label="$t('id')"
                :options="binaries" emit-value map-options>
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            No data
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
            <div class="subtitle mb-2 uppercase">Vistas con acceso</div>
            <q-tree ref="tree" :nodes="state.routes" node-key="label" tick-strategy="leaf"
                v-model:ticked="state.item.menu" />
            <div v-if="isDrawer" class="fixed bottom-0 right-0 py-2 bg-white" :style="style">
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg bg-primary text-white" flat label="Guardar cambios"
                    type="submit" />
                <q-btn v-else class="button-press w-full text-lg bg-primary text-white" flat label="agregar" type="submit" />
            </div>
        </q-form>
    </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { requiredInput } from 'src/helpers/validation';
import { useQuasar } from 'quasar';
import { asyncRoutes } from 'src/router/routes';
const $api = inject('$api');
const $local = inject('$local')
import { arrPow } from 'src/helpers';
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })

const routes = computed(() => {
    return asyncRoutes.map(i => {
        return {
            label: i.name,
            children: i.children?.map(j => {
                return {
                    label: j.name
                }
            })
        }
    })
})

const initialItem = () => ({
    menu: []
})

const state = reactive({
    item: initialItem(),
    ticked: [],
    local: 'WriteRole',
    roles: [],
    routes
})

watch(() => state.item, (val) => {
    if (!props.isEdit) {
        $local.set(state.local, val)
    }
}, { deep: true })


const style = computed(() => {
    return {
        width: props.width,
        padding: props.isDrawer && '6px 8px'
    }
})

const binaries = computed(() => {
    if (!state.roles) return;
    return arrPow(2, 256).filter((b) => {
        return state.roles.findIndex((i) => i.value === b) === -1 && b !== 1;
    });
})

async function onInit() {
    state.roles = await getRoles()
    if (props.isEdit) {
        state.item = await $api.get(`role/${props.id}`)
    } else {
        if ($local.get(state.local)) {
            // state.item = $local.get(state.local)
        }
    }
}

async function getRoles() {
    return await $api.get(`role`, {
        params: {
            returnItems: true
        }
    })
}

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

async function onSubmit() {
    state.item.menu = state.item.menu.reduce((acc, curr) => {
        const item = curr.replace(/_index/g, '')
        if (item !== curr) {
            acc.push(item)
        }
        return acc;
    }, state.item.menu)

    if (props.isEdit) {
        const response = await $api.put(`role/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Rol Editada'
            })
        }
    } else {
        const response = await $api.post('role', {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Rol Agregada'
            })
            onReset()
        }
    }
}

onMounted(() => {
    onInit()
})
</script>