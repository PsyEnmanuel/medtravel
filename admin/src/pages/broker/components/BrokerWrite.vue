<template>
    <div :style="style" class="pb-32">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit">
                <p class="text-2xl text-info">Editar CORREDOR</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">CORREDOR</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <div class="grid lg:grid-cols-2 gap-1">
                <div class="flex flex-col gap-1">
                    <q-input dense outlined v-model="state.item.description" :label="$t('name') + '*'"
                        :rules="[requiredInput]" hide-bottom-space @keydown.enter.prevent></q-input>
                    <q-input dense outlined v-model="state.item.phone" :label="$t('phone')"
                        @keydown.enter.prevent></q-input>
                    <q-input dense outlined v-model="state.item.webpage" :label="$t('webpage')" @keydown.enter.prevent>
                        <template v-slot:after>
                            <q-btn flat class="button rounded-md h-[40px] p-2" no-caps rel="noopener" @click.stop
                                :href="state.item.webpage" target="_blank">
                                <q-icon name="fa-solid fa-link" size="xs" />
                            </q-btn>
                        </template>
                    </q-input>
                    <q-input dense outlined v-model="state.item.link_gps" :label="$t('link_gps')"
                        @keydown.enter.prevent>
                        <template v-slot:after>
                            <q-btn flat class="button rounded-md h-[40px] p-2" no-caps rel="noopener" @click.stop
                                :href="state.item.link_gps" target="_blank">
                                <q-icon name="fa-solid fa-link" size="xs" />
                            </q-btn>
                        </template>
                    </q-input>
                    <CountrySelect @setCountry="setCountry" @clearCountry="clearCountry"
                        :model-value="state.item.country" />
                    <StateSelect :refId="state.item.country_id" @setState="setState" @clearState="clearState"
                        :model-value="state.item.state" />
                    <CitySelect :refId="state.item.state_id" @setCity="setCity" @clearCity="clearCity"
                        :model-value="state.item.city" />
                    <q-input dense outlined v-model="state.item.zipcode" :label="$t('zipcode')"
                        @keydown.enter.prevent></q-input>
                    <q-input dense outlined v-model="state.item.address" :label="$t('address')" type="textarea"
                        :rows="3"></q-input>
                </div>
            </div>
            <div v-if="isDrawer" class="fixed bottom-0 lg:right-[10px] right-0 py-2 bg-white mt-10" :style="style">
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                    label="Guardar cambios" type="submit" />
                <q-btn v-else class="button-press w-full text-lg rounded-md bg-primary text-white" flat label="agregar"
                    type="submit" />
            </div>
            <div class="mt-10" v-else>
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                    label="Guardar cambios" type="submit" />
                <q-btn v-else class="button-press w-full text-lg rounded-md bg-primary text-white" flat label="agregar"
                    type="submit" />
            </div>
        </q-form>
    </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { requiredInput } from 'src/helpers/validation';
import { useQuasar } from 'quasar';
import CountrySelect from 'src/components/select/CountrySelect.vue';
import StateSelect from 'src/components/select/StateSelect.vue';
import CitySelect from 'src/components/select/CitySelect.vue';
import { useFilter } from 'src/use/filter';
const $api = inject('$api');
const $cats = inject('$cats');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })
const $emit = defineEmits(['close'])

const options = reactive({
    broker_type: $cats.value.broker_type,
    binary: [
        {
            label: 'Si',
            value: 1
        },
        {
            label: 'No',
            value: 0
        },
    ]
})

const initialItem = () => ({
})

const state = reactive({
    item: initialItem(),
    local: 'WriteBroker',
    categories: [],
    plan: null,
    plan_type: null
})

watch(() => state.item, (val) => {
    if (!props.isEdit) {
        $local.set(state.local, val)
    }
}, { deep: true })

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

function onDelayedClick(e, go) {
    e.preventDefault() // mandatory; we choose when we navigate

    // console.log('triggering navigation in 2s')
    setTimeout(() => {
        // console.log('navigating as promised 2s ago')
        go()
    }, 2000)
}

async function setCountry(id) {
    try {
        const country = await $api.get(`utility/countries/${id}`)
        state.item.country_id = country.id;
        state.item.country = country.description;
    } catch (error) {
        console.log(error);
    }
}

function clearCountry() {
    try {
        state.item.state_id = null;
        state.item.state = null;
        state.item.country_id = null;
        state.item.country = null;
        state.item.city_id = null;
        state.item.city = null;
    } catch (error) {
        console.log(error);
    }
}

async function setCity(id) {
    try {
        const city = await $api.get(`utility/cities/${id}`)

        state.item.city_id = city.id;
        state.item.city = city.description;
    } catch (error) {
        console.log(error);
    }
}

function clearCity() {
    try {
        state.item.city_id = null;
        state.item.city = null;
    } catch (error) {
        console.log(error);
    }
}

async function setState(id) {
    try {
        const _state = await $api.get(`utility/states/${id}`)

        state.item.state_id = _state.id;
        state.item.state = _state.description;
    } catch (error) {
        console.log(error);
    }
}

function clearState() {
    try {
        state.item.state_id = null;
        state.item.state = null;
        state.item.city_id = null;
        state.item.city = null;
    } catch (error) {
        console.log(error);
    }
}

async function onSubmit() {
    if (props.isEdit) {
        const response = await $api.put(`broker/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Proveedor Editada'
            })
        }
    } else {
        const response = await $api.post('broker', {
            ...state.item,
        });
        if (response) {
            console.log(9)
            $emit('close', response.id)
            $q.notify({
                type: 'success',
                message: 'Proveedor Agregado'
            })
            onReset()
        }
    }
}

async function onInit() {
    if (props.isEdit) {
        state.item = await $api.get(`broker/${props.id}`)
    } else {
        if ($local.get(state.local)) {
            // state.item = $local.get(state.local)
        }
    }
}

const style = computed(() => {
    return {
        width: props.width,
        padding: props.isDrawer && '6px 8px'
    }
})

const { filterFnCategory } = useFilter(options)

onMounted(() => {
    onInit()
})
</script>