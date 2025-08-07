<template>
    <div :style="style" class="pb-32">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit">
                <p class="text-2xl text-info">Editar PROVEEDOR</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">PROVEEDOR</b></p>
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
                    <q-select :label="$t('provider_type')" dense outlined clearable
                        v-model="state.item.$provider_type_id" use-input hide-selected fill-input input-debounce="0"
                        :options="options.provider_type"
                        @filter="(val, update, abort) => filterFnCategory(val, update, abort, 'provider_type')"
                        :placeholder="$t('provider_type')" option-value="id" option-label="description" emit-value
                        map-options>
                        <template v-slot:no-option>
                            <q-item>
                                <q-item-section class="text-grey">
                                    No data
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                    <div>
                        <q-item class="mb-1 q-pa-xs" dense>
                            <q-item-section>
                                <q-item-label class="flex items-center">
                                    <span class="font-semibold mr-2">{{ $t('ambassador') }}</span>
                                    <q-option-group class="flex" size="sm" unelevated spread
                                        v-model="state.item.$ambassador_id" toggle-color="secondary"
                                        toggle-text-color="text-font" :options="options.binary" />
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </div>
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
                            <q-btn v-if="!state.fileMap?.id" flat class="button rounded-md h-[40px] p-2" no-caps
                                rel="noopener" @click.stop="generateMapImg()" :loading="state.loadingBtn">
                                <q-icon name="fa-solid fa-image" size="xs" />
                            </q-btn>
                        </template>
                    </q-input>
                    <div v-if="state.fileMap?.id" class="relative overflow-hidden">
                        <div class="card flex items-center p-2 justify-center">
                            <img class=" w-full" :src="state.fileMap.url" spinner-color="white" contain
                                position="center" />
                        </div>
                        <q-btn flat class="absolute top-0 right-0 button-icon bg-primary text-white rounded-md"
                            size="sm" no-caps @click="removeProfile" icon="fa-solid fa-xmark">
                            <q-tooltip class="bg-default text-black text-xs">Remover Linea</q-tooltip>
                        </q-btn>
                    </div>
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
                    <q-input dense outlined v-model="state.item.detail" :label="$t('detail')" type="textarea"
                        :rows="10"></q-input>
                </div>
                <div v-if="id">
                    <DoctorProviderTable :providerId="id" width="100%" cardView />
                </div>
            </div>
            <img :src="state.map_img" alt="">
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
import DoctorProviderTable from 'src/pages/doctor/components/DoctorProviderTable.vue';
const $api = inject('$api');
const $cats = inject('$cats');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })
const $emit = defineEmits(['close'])

const options = reactive({
    provider_type: $cats.value.provider_type,
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
    loadingBtn: false,
    map_img: null,
    local: 'WriteProvider',
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
        const response = await $api.put(`provider/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Proveedor Editada'
            })
        }
    } else {
        const response = await $api.post('provider', {
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
        state.item = await $api.get(`provider/${props.id}`)
        if (state.item.files) {
            const [fileMap] = state.item.files.filter(i => i.$file_type_id === 374)
            if (fileMap) {
                state.fileMap = fileMap;
            }

        }

    } else {
        if ($local.get(state.local)) {
            // state.item = $local.get(state.local)
        }
    }
}
async function generateMapImg() {
    try {
        state.loadingBtn = true
        state.map_img = await $api.get(`resources/google-static-maps-api`, {
            params: {
                link_gps: state.item.link_gps,
                address: `${state.item.address}, ${state.item.city}, ${state.item.country}`,
                ref_key: 't_provider',
                ref_id: state.item.id
            }
        })
        onInit()
        
    } catch (error) {
        state.loadingBtn = false
    }
}

async function removeProfile() {
    try {
        if (state.fileMap?.id) {
            await $api.delete(`file/${state.fileMap?.id}`, { data: { ref_key: 't_provider', ref_id: state.item.id } })
            state.fileMap = null
            onInit()
        }
    } catch (error) {
        console.log(error);
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
    onInit();

})
</script>