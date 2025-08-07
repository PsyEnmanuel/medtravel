<template>
    <div v-if="!state.loading" :style="style" :class="isDrawer && 'pb-32'">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar Cliente</p>
                <b class="font-bold text-brand">{{ state.item.fullname }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Cliente</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <div class="bg-default p-1 rounded-md text-center font-bold">Cliente</div>
                    <q-option-group class="mb-2 flex" unelevated spread v-model="state.item.$ident_type_id"
                        toggle-color="secondary" toggle-text-color="text-font" :options="options.ident_type" />
                    <q-input v-if="state.item.$ident_type_id !== 147" ref="mainInput" class="mb-2" dense outlined
                        v-model="state.item.ident_no" :label="$t('ident_no')" @keydown.enter.prevent></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.description" :label="$t('name')"
                        :rules="[requiredInput]" hide-bottom-space @keydown.enter.prevent></q-input>
                    <q-option-group class="flex" unelevated spread v-model="state.item.$sex_id" toggle-color="secondary"
                        toggle-text-color="text-font" :options="$cats.sex" />
                    <q-select class="mb-2" dense outlined clearable v-model="state.item.language_ids"
                        :label="$t('languages')" multiple :options="options.languages" option-value="value"
                        option-label="label" emit-value map-options>
                        <template v-slot:no-option>
                            <q-item>
                                <q-item-section class="text-grey">
                                    No data
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                </div>
                <div>
                    <div class="bg-default p-1 rounded-md text-center font-bold mb-2">Información de Contacto</div>
                    <q-input class="mb-2" dense outlined v-model="state.item.phone" :label="$t('phone')" @keydown.enter.prevent></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.email" :label="$t('email')" @keydown.enter.prevent></q-input>
                    <CountrySelect class="mb-2" @setCountry="setCountry" @clearCountry="clearCountry"
                        :model-value="state.item.country" />
                    <q-input :disable="!state.item.country" class="mb-2" dense outlined v-model="state.item.zipcode"
                        :label="$t('zipcode')" @update:model-value="fillLocation" @keydown.enter.prevent></q-input>
                    <StateSelect class="mb-2" :refId="state.item.country_id" @setState="setState"
                        @clearState="clearState" :model-value="state.item.state" />
                    <CitySelect class="mb-2" :refId="state.item.state_id" @setCity="setCity" @clearCity="clearCity"
                        :model-value="state.item.city" />
                    <q-input class="mb-2" dense outlined v-model="state.item.nationality"
                        label="Nacionalidad" @keydown.enter.prevent></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.sector" :label="$t('sector')" @keydown.enter.prevent></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.street" :label="$t('street')" @keydown.enter.prevent></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.address" :label="$t('address')"
                        type="textarea" :rows="3"></q-input>
                </div>

            </div>

            <div v-if="isDrawer" class="fixed bottom-0 right-[10px] py-2 bg-white w-full" :style="style">
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                    label="Guardar cambios" type="submit" />
                <q-btn v-else class="button-press w-full text-lg rounded-md bg-primary text-white" flat label="agregar"
                    type="submit" />
            </div>
            <div v-else>
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

import { useI18n } from 'vue-i18n';
import languages from 'src/data/languages';

const $api = inject('$api');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const { t } = useI18n()
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })

const $cats = inject('$cats');

const options = reactive({
    customer_type: $cats.value.customer_type,
    policy_branch: $cats.value.policy_branch,
    blood_type: $cats.value.blood_type,
    relationship: $cats.value.relationship,
    ident_type: $cats.value.ident_type.filter(i => {
        return [7, 8, 9].includes(i.id)
    }),
    insurance_plan: [],
    insurance_plan_type: [],
    languages: languages.filter(i => i.available),
})

const initialItem = () => ({
    $ident_type_id: 7,
    provider: [],
    language_ids: [],
    policies: [{
        insurance_id: null,
        insurance: null,
        policy_number: null,
        customer_code: null,
        customer_code_unique: null,
        customer_unique_code: null,
        $customer_type_id: null,
        insurance_plan: null,
        insurance_plan_type: null,
        $policy_branch_id: null,
        $relationship_id: null,
        start_date: null,
        expiration_date: null,
        titular: null,
        customer_id: null,
        customer_description: null,
        c_status: 4
    }]
})

const state = reactive({
    loading: true,
    item: initialItem(),
    local: 'CustomerWrite',
})


watch(() => state.item.ident_no, async (val) => {
    if (props.isEdit) {
        return;
    }

    if (val) {
        let ident_no = val.replace(/\D/g, '');
        if (ident_no.length === 11) {
            await $api.get(`customer/exist`, {
                params: {
                    ident_no
                }
            });
            let result = await $api.get(`utility/cedulados/${ident_no}`);
            state.item.birthdate = result.birthdate;
            state.item.description = result.fullname;
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

function addRowProvider() {
    state.item.provider.push({
        id: null,
        description: null,
        MRN: null,
    })
}

async function fillLocation() {
    try {
        if (state.item.zipcode.length !== 5) {
            return;
        }

        if (!state.item.country_iso2) {
            return;
        }

        const response = await $api.get(`resources/zippopotam`, {
            params: {
                zipcode: state.item.zipcode,
                country_code: state.item.country_iso2
            }
        });

        if (response.places.length) {
            const place = response.places[0]

            const city = await $api.get(`utility/cities`, {
                params: {
                    where: {
                        country_code: response['country abbreviation'],
                        state_code: place['state abbreviation'] ? place['state abbreviation'] : null,
                        name: place['place name']
                    }
                }
            })

            if (city?.items && city?.items.length) {
                setCity(null, city.items[0])
            }

            const _state = await $api.get(`utility/states`, {
                params: {
                    where: {
                        iso2: place['state abbreviation'],
                        country_code: response['country abbreviation']
                    }
                }
            })

            if (_state?.items && _state?.items.length) {
                setState(null, _state.items[0])
            }
        }

    } catch (error) {
        console.log(error);
    }
}

async function setCountry(id, country = null) {
    try {
        if (id) {
            country = await $api.get(`utility/countries/${id}`)
        }
        console.log(country);
        state.item.country_id = country.id;
        state.item.country = country.description;
        state.item.country_iso2 = country.iso2;
        // state.item.nationality = nationalities[country.nationality];
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

async function setCity(id, city = null) {
    try {
        if (id) {
            city = await $api.get(`utility/cities/${id}`)
        }
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

async function setState(id, _state = null) {
    try {
        if (id) {
            _state = await $api.get(`utility/states/${id}`)
        }

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

async function onInit() {
    if (props.isEdit) {
        state.item = await $api.get(`customer/${props.id}`)
        state.item.policies = await $api.get(`policy`, {
            params: {
                where: {
                    customer_id: props.id
                },
                returnItems: true
            }
        })

    } else {
        if ($local.get(state.local)) {
            // state.item = $local.get(state.local)
        }
        addRowProvider()
    }
    state.loading = false
}

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

async function onSubmit() {

    state.item.language = options.languages.reduce((acc, curr) => {
        if (state.item.language_ids.includes(curr.value)) {
            acc.push(curr.label)
        }
        return acc
    }, []);

    if (props.isEdit) {
        const response = await $api.put(`customer/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Cliente Editado'
            })
        }
    } else {

        const response = await $api.post('customer', {
            ...state.item,
        });

        if (response) {
            $q.notify({
                type: 'success',
                message: 'Cliente Agregado'
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