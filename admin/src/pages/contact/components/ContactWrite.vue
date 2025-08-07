<template>
    <div v-if="!state.loading" :style="style" :class="isDrawer && 'pb-32'">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar Contacto</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Contacto</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <div class="grid lg:grid-cols-2 grid-cols-1 gap-2">
                <div>
                    <div class="bg-default p-1 rounded-md text-center font-bold mb-2">Contacto</div>
                    <q-input class="mb-2" dense outlined v-model="state.item.firstname" :label="$t('name') + '*'"
                        :rules="[requiredInput]" hide-bottom-space @keydown.enter.prevent></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.lastname" :label="$t('lastname') + '*'"
                        :rules="[requiredInput]" hide-bottom-space @keydown.enter.prevent></q-input>
                    <q-select class="mb-2" v-model="state.item.$postnominal_ids" use-chips dense outlined clearable
                        multiple :options="options.postnominal" option-value="id" :label="$t('postnominal')"
                        option-label="description" emit-value map-options use-input @filter="(val, update, abort) =>
                            filterFnCategory(val, update, abort, 'postnominal')" />
                    <q-option-group class="flex" unelevated spread v-model="state.item.$sex_id" toggle-color="secondary"
                        toggle-text-color="text-font" :options="$cats.sex" />
                    <q-input class="mb-2" dense outlined v-model="state.item.birthdate" mask="##-##-####"
                        :label="$t('birthdate')">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy ref="proxy">
                                    <q-date flat v-model="state.item.birthdate" no-unset years-in-month-view minimal
                                        mask="DD-MM-YYYY" @update:model-value="$refs.proxy.hide()">
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>

                    <CategorySelect class="mb-2" :model-value="state.item.contact_type" refKey="contact_type"
                        @setCategory="state.item.$contact_type_id = $event"
                        @clearCategory="state.item.$contact_type_id = null" add />

                    <CategorySelect class="mb-2" :model-value="state.item.contact_position" refKey="contact_position"
                        @setCategory="state.item.$contact_position_id = $event"
                        @clearCategory="state.item.$contact_position_id = null" add />
                    <div>
                        <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">Proveedores</div>
                        <div v-for="row in state.item.provider" :key="row.id">
                            <div class="q-pb-xs col-xs-12">
                                <div bordered flat class="relative flex flex-nowrap gap-1">
                                    <ProviderSelect @setProvider="setProvider($event, row)"
                                        @clearProvider="clearProvider(row)" :model-value="row.description"
                                        :id="row.id" />
                                    <q-btn flat class="button-icon bg-primary text-white rounded-md" size="sm" no-caps
                                        @click="removeRowProvider(row)" icon="fa-solid fa-xmark">
                                        <q-tooltip class="bg-default text-black text-xs">Remover Linea</q-tooltip>
                                    </q-btn>
                                </div>
                            </div>
                        </div>
                        <q-btn flat class="button bg-primary-light w-full" no-caps @click="addRowProvider">Agregar
                            Proveedor</q-btn>
                    </div>
                </div>
                <div>
                    <div class="bg-default p-1 rounded-md text-center font-bold mb-2">Información de Contacto</div>
                    <q-input class="mb-2" dense outlined v-model="state.item.phone" :label="$t('phone')" @keydown.enter.prevent></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.email" :label="$t('email')" @keydown.enter.prevent></q-input>
                    <CountrySelect class="mb-2" @setCountry="setCountry" @clearCountry="clearCountry"
                        :model-value="state.item.country" />
                    <StateSelect class="mb-2" :refId="state.item.country_id" @setState="setState"
                        @clearState="clearState" :model-value="state.item.state" />
                    <CitySelect class="mb-2" :refId="state.item.state_id" @setCity="setCity" @clearCity="clearCity"
                        :model-value="state.item.city" />
                    <q-input class="mb-2" dense outlined v-model="state.item.nationality"
                        label="Nacionalidad" @keydown.enter.prevent></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.zipcode" :label="$t('zipcode')" @keydown.enter.prevent></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.address" :label="$t('address')"
                        type="textarea" :rows="3"></q-input>
                    <div>
                        <div class="bg-default p-1 rounded-md text-center font-bold mb-2">Redes sociales</div>
                        <q-input class="mb-2" dense outlined v-model="state.item.linkedin"
                            :label="$t('linkedin')"></q-input>
                        <q-input class="mb-2" dense outlined v-model="state.item.instagram"
                            :label="$t('instagram')"></q-input>
                    </div>
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
import { useFilter } from 'src/use/filter';
import CountrySelect from 'src/components/select/CountrySelect.vue';
import CitySelect from 'src/components/select/CitySelect.vue';
import StateSelect from 'src/components/select/StateSelect.vue';

import nationalities from 'src/data/nationalities'
import SpecialitySelect from 'src/components/select/SpecialitySelect.vue';
import ProviderSelect from 'src/components/select/ProviderSelect.vue';
import CategorySelect from 'src/components/select/CategorySelect.vue';

const $api = inject('$api');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean, providerId: Number })

const $cats = inject('$cats');

const options = reactive({
    attention_type: $cats.value.attention_type,
    postnominal: $cats.value.postnominal,
    ident_type: $cats.value.ident_type.filter(i => {
        return [7, 8, 9].includes(i.id)
    }),
})

const initialItem = () => ({
    speciality: [{
        id: null,
        description: null,
        sub: [],
    }],
    provider: props.providerId ? [] : [{
        id: null,
        description: null,
    }]
})

const state = reactive({
    loading: true,
    item: initialItem(),
    local: 'ContactWrite',
})

watch(() => state.item, (val) => {
    if (!props.isEdit) {
        $local.set(state.local, val)
    }
}, { deep: true })

watch(() => state.item.ident_no, async (val) => {
    if (props.isEdit) {
        return;
    }

    if (val) {
        let ident_no = val.replace(/\D/g, '');
        if (ident_no.length === 11) {
            await $api.get(`contact/exist`, {
                params: {
                    ident_no
                }
            });
            let result = await $api.get(`utility/cedulados/${ident_no}`);
            state.item.birthdate = result.birthdate;
            state.item.description = result.description;
            state.item.$sex_id = result.$sex_id;
        } else {
            state.item.birthdate = null;
            state.item.$sex_id = null;
            if (state.item.description) {
                state.item.description = null;
            }
        }
    }
})

async function setCountry(id) {
    try {
        const country = await $api.get(`utility/countries/${id}`)
        state.item.country_id = country.id;
        state.item.country = country.description;
        state.item.nationality = nationalities[country.nationality];
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

function addRowProvider() {
    state.item.provider.push({
        id: null,
        description: null,
        sub: [],
    })
}

function removeRowProvider(row) {
    try {
        const index = state.item.provider.findIndex(i => i.id === row.id)
        if (index !== -1) {
            state.item.provider.splice(index, 1)
        }
    } catch (error) {
        console.log(error);
    }
}

async function setSpeciality(id, row) {
    try {
        const index = state.item.speciality.findIndex(i => i.id === id)
        if (index !== -1) {
            $q.notify({
                type: 'warning',
                message: 'Esta especialidad ya esta agregada'
            })
            row.id = null;
            row.description = null;
            row.sub = [];
            return;
        }
        const speciality = await $api.get(`speciality/${id}`)
        row.id = speciality.id;
        row.description = speciality.description;
        row.sub = speciality.sub.map((i, index) => {
            return {
                checked: 0,
                description: i.description
            }
        });

    } catch (error) {
        console.log(error);
    }
}

function clearSpeciality(row) {
    try {
        row.id = null;
        row.description = null;
        row.sub = [];
    } catch (error) {
        console.log(error);
    }
}

async function setProvider(id, row) {
    try {
        const index = state.item.provider.findIndex(i => i.id === id)
        if (index !== -1) {
            $q.notify({
                type: 'warning',
                message: 'Esta especialidad ya esta agregada'
            })
            row.id = null;
            row.description = null;
            row.sub = [];
            return;
        }
        const provider = await $api.get(`provider/${id}`)
        row.id = String(provider.id);
        row.description = provider.description;
        row.sub = provider.sub.map((desc, index) => {
            return {
                checked: 0,
                description: desc
            }
        });

    } catch (error) {
        console.log(error);
    }
}

function clearProvider(row) {
    try {
        row.id = null;
        row.description = null;
        row.sub = [];
    } catch (error) {
        console.log(error);
    }
}

async function onInit() {
    if (props.isEdit) {
        state.item = await $api.get(`contact/${props.id}`)
    } else {
        if (props.providerId) {
            const provider = await $api.get(`provider/${props.providerId}`)
            state.item.provider.push({
                id: String(provider.id),
                description: provider.description,
            })
        }
        if ($local.get(state.local)) {
            // state.item = $local.get(state.local)
        }
    }
    state.loading = false
}

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

async function onSubmit() {

    if (!state.item.provider.length) {
        $q.notify({
            type: 'warning',
            message: 'Es requerido agregar un proveedor'
        })
        return;
    } else {
        let isValid = false;
        for (let i = 0; i < state.item.provider.length; i++) {
            const provider = state.item.provider[i];

            if (provider.id) {
                isValid = true
            }

        }
        if (!isValid) {
            $q.notify({
                type: 'warning',
                message: 'Es requerido agregar un proveedor'
            })
            return;
        }
    }

    if (props.isEdit) {
        const response = await $api.put(`contact/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Contacto Editado'
            })
        }
    } else {
        const response = await $api.post('contact', {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Contacto Agregado'
            })
            onReset()
        }
    }
}

const { filterFnCategory } = useFilter(options)

const style = computed(() => {
    return {
        width: props.width,
        'padding-right': props.isDrawer && '8px',
        'padding-left': props.isDrawer && '8px'
    }
})

onMounted(() => {
    onInit()
})
</script>