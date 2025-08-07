<template>
    <div v-if="!state.loading" :style="style" :class="isDrawer && 'pb-32'">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit">
                <p class="text-2xl text-info">Editar Asegurado</p>
                <b class="font-bold text-brand">{{ state.item.fullname }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Asegurado</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <div class="grid grid-cols-2 gap-1">
                <div class="flex flex-col gap-1">
                    <div class="bg-default p-1 rounded-md text-center font-bold">Asegurado</div>
                    <q-checkbox class="border border-dashed mt-1 px-4" v-model="state.item.high_profile" :true-value="1"
                        :false-value="0">Alto perfil</q-checkbox>
                    <q-option-group class="mb-2 flex" unelevated spread v-model="state.item.$ident_type_id"
                        toggle-color="secondary" toggle-text-color="text-font" :options="options.ident_type" />
                    <q-input v-if="state.item.$ident_type_id !== 147" ref="mainInput" dense outlined
                        v-model="state.item.ident_no" :label="$t('ident_no')" @keydown.enter.prevent></q-input>
                    <q-input dense outlined v-model="state.item.fullname" :label="$t('fullname')"
                        :rules="[requiredInput]" hide-bottom-space @keydown.enter.prevent></q-input>
                    <q-input dense outlined v-model="state.item.birthdate" mask="##-##-####" :label="$t('birthdate')"
                        @keydown.enter.prevent>
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
                    <q-option-group class="flex" unelevated spread v-model="state.item.$sex_id" toggle-color="secondary"
                        toggle-text-color="text-font" :options="$cats.sex" />
                    <div class="bg-default p-1 rounded-md text-center font-bold"></div>
                    <q-option-group class="flex" :options="$cats.civil_status" type="radio"
                        v-model="state.item.$civil_status_id" />
                    <CategorySelect :model-value="state.item.blood_type" refKey="blood_type"
                        @setCategory="state.item.$blood_type_id = $event"
                        @clearCategory="state.item.$blood_type_id = null" />
                    <q-select dense outlined clearable v-model="state.item.language_ids" :label="$t('languages')"
                        multiple :options="options.languages" option-value="value" option-label="label" emit-value
                        map-options>
                        <template v-slot:no-option>
                            <q-item>
                                <q-item-section class="text-grey">
                                    No data
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                </div>
                <div class="flex flex-col gap-1">
                    <div class="bg-default p-1 rounded-md text-center font-bold mb-2">Información de Contacto</div>
                    <q-input dense outlined v-model="state.item.phone" :label="$t('phone')"
                        @keydown.enter.prevent></q-input>
                    <q-input dense outlined v-model="state.item.email" :label="$t('email')"
                        @keydown.enter.prevent></q-input>
                    <CountrySelect @setCountry="setCountry" @clearCountry="clearCountry"
                        :model-value="state.item.country" />
                    <q-input :disable="!state.item.country" dense outlined v-model="state.item.zipcode"
                        :label="$t('zipcode')" @update:model-value="fillLocation" @keydown.enter.prevent></q-input>
                    <StateSelect :refId="state.item.country_id" @setState="setState" @clearState="clearState"
                        :model-value="state.item.state" />
                    <CitySelect :refId="state.item.state_id" @setCity="setCity" @clearCity="clearCity"
                        :model-value="state.item.city" />
                    <q-input dense outlined v-model="state.item.nationality" label="Nacionalidad"
                        @keydown.enter.prevent></q-input>
                    <q-input dense outlined v-model="state.item.sector" :label="$t('sector')"
                        @keydown.enter.prevent></q-input>
                    <q-input dense outlined v-model="state.item.street" :label="$t('street')"
                        @keydown.enter.prevent></q-input>
                    <q-input dense outlined v-model="state.item.address" :label="$t('address')" type="textarea"
                        :rows="3"></q-input>
                </div>

            </div>

            <div v-if="!isEdit" class="flex flex-col gap-1 mt-1">
                <div class="bg-default p-1 rounded-md text-center font-bold">AGREGAR DEPENDIENTE A PÓLIZA</div>

                <div class="grid grid-cols-2 gap-1">
                    <PolicySelect @setPolicy="setPolicy($event)" @clearPolicy="clearPolicy(row)"
                        :model-value="state.item.policy_number" />

                    <PolicySelect :key="state.item.policy_number" :readonly="!state.item.policy_id" :titular="true"
                        :policy_id="state.item.policy_id" @setPolicy="setTitular($event)" @clearPolicy="clearTitular"
                        :model-value="state.item.titular_description" label="Elegir Titular" />

                    <q-input dense outlined v-model="state.item.insured_code" :label="$t('insured_code')"></q-input>

                    <CategorySelect :model-value="state.item.relationship" refKey="relationship"
                        @setCategory="state.item.$relationship_id = $event"
                        @clearCategory="state.item.$relationship_id = null" add />
                </div>

            </div>

            <div v-if="isEdit">
                <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">Referencias</div>
                <div v-for="row in state.item.provider" :key="row.id">
                    <div class="q-pb-xs col-xs-12">
                        <div bordered flat class="relative flex flex-nowrap gap-1">
                            <ProviderSelect @setProvider="setProvider($event, row)" @clearProvider="clearProvider(row)"
                                :model-value="row.description" :id="row.id" />
                            <q-input class="w-[280px]" dense outlined v-model="row.MRN" :label="$t('MRN')"
                                @keydown.enter.prevent></q-input>

                            <q-btn flat class="button-icon bg-primary text-white rounded-md" size="sm" no-caps
                                @click="removeRowProvider(row)" icon="fa-solid fa-xmark">
                                <q-tooltip class="bg-default text-black text-xs">Remover Linea</q-tooltip>
                            </q-btn>
                        </div>
                    </div>
                </div>
                <q-btn flat class="button bg-primary-light w-full mb-2" no-caps @click="addRowProvider">Agregar
                    Proveedor</q-btn>
            </div>

            <div v-if="isEdit" class="mb-8">
                <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">Pólizas</div>
                <div v-for="row in state.item.policies" :key="row.id" class="grid md:grid-cols-2 gap-2">
                    <PolicyBox class="card p-2 mb-1" :row="row" />
                </div>
            </div>

            <div v-if="isEdit">
                <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">RELACIONES</div>
                <div v-for="row in state.item.relations" :key="row.id">
                    <div class="q-pb-xs col-xs-12">
                        <div bordered flat class="relative flex md:flex-nowrap gap-1">
                            <InsuredSelect class="w-full" @setInsured="setRelation($event, row)" @clearInsured="clearRelation(row)"
                                :model-value="row.description" :id="row.id" />
                            <div class="flex flex-nowrap gap-1 w-full">
                                <CategorySelect class="w-full" :model-value="row.relationship" refKey="relationship"
                                    @setCategory="setCategoryRelationship($event, row)"
                                    @clearCategory="row.$relationship_id = null; row.relationship = null" add />
                                <q-btn flat class="button-icon bg-primary text-white rounded-md" size="sm" no-caps
                                    @click="removeRowRelation(row)" icon="fa-solid fa-xmark">
                                    <q-tooltip class="bg-default text-black text-xs">Remover Linea</q-tooltip>
                                </q-btn>
                            </div>
                        </div>
                    </div>
                </div>
                <q-btn flat class="button bg-primary-light w-full mb-2" no-caps @click="addRowRelation">Agregar
                    Relación</q-btn>
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
import CategorySelect from 'src/components/select/CategorySelect.vue';
import PolicyBox from 'src/pages/policy/components/PolicyBox.vue';
import { useI18n } from 'vue-i18n';
import ProviderSelect from 'src/components/select/ProviderSelect.vue';
import InsuredSelect from 'src/components/select/InsuredSelect.vue';
import languages from 'src/data/languages';
import PolicySelect from 'src/components/select/PolicySelect.vue';

const $api = inject('$api');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const { t } = useI18n()
const props = defineProps({
    id: Number, isEdit: Boolean, width: String, isDrawer: Boolean
})

const $emit = defineEmits(['close'])
const $cats = inject('$cats');

const options = reactive({
    insured_type: $cats.value.insured_type,
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
    high_profile: 0,
    $ident_type_id: 7,
    provider: [],
    language_ids: [],
    policies: []
})

const state = reactive({
    loading: true,
    item: initialItem(),
    local: 'InsuredWrite',
})

watch(() => state.item.ident_no, async (val) => {
    if (props.isEdit) {
        return;
    }

    if (val) {
        let ident_no = val.replace(/\D/g, '');
        if (ident_no.length === 11) {
            await $api.get(`insured/exist`, {
                params: {
                    ident_no
                }
            });
            let result = await $api.get(`utility/cedulados/${ident_no}`);
            state.item.birthdate = result.birthdate;
            state.item.fullname = result.fullname;
            state.item.firstname = result.firstname;
            state.item.lastname = result.lastname;
            state.item.$sex_id = result.$sex_id;
        } else {
            state.item.birthdate = null;
            state.item.$sex_id = null;
            if (state.item.fullname) {
                state.item.fullname = null;
                state.item.firstname = null;
                state.item.lastname = null;
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

async function setTitular(id) {
    try {
        const policy = await $api.get(`policy/insured/${id}`)
        state.item.titular_id = policy.titular_id;
        state.item.titular_description = policy.titular_description;

    } catch (error) {
        console.log(error);
    }
}

function clearTitular() {
    try {
        state.item.titular_id = null;
        state.item.titular_description = null;
    } catch (error) {
        console.log(error);
    }
}

async function setPolicy(id) {
    try {
        const policy = await $api.get(`policy/${id}`)

        state.item.insurance_id = policy.insurance_id;
        state.item.insurance_description = policy.insurance;
        state.item.policy_id = policy.id
        state.item.policy_number = policy.policy_number

    } catch (error) {
        console.log(error);
    }
}

function clearPolicy() {
    try {
        state.item.insurance_id = null;
        state.item.insurance_description = null;
        state.item.policy_id = null
        state.item.policy_number = null
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
                message: 'Este proveedor ya esta agregado'
            })
            row.id = null;
            row.description = null;
            row.MRN = null;
            return;
        }
        const provider = await $api.get(`provider/${id}`)
        row.id = String(provider.id);
        row.description = provider.description;

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

function addRowRelation() {
    state.item.relations.push({
        id: null,
        description: null,
        $relationship_id: null,
        relationship: null
    })
}

function removeRowRelation(row) {
    try {
        const index = state.item.relations.findIndex(i => i.id === row.id)
        if (index !== -1) {
            state.item.relations.splice(index, 1)
        }
    } catch (error) {
        console.log(error);
    }
}

function setCategoryRelationship(id, row) {
    try {
        const [cat] = options.relationship.filter(i => i.id === id)
        console.log(row);
        row.$relationship_id = cat.id;
        row.relationship = cat.description;
    } catch (error) {
        console.log(error);
    }
}

async function setRelation(id, row) {
    try {
        const index = state.item.relations.findIndex(i => i.id === id)

        if (index !== -1) {
            $q.notify({
                type: 'warning',
                message: 'Esta relación ya esta agregada'
            })
            row.id = null;
            row.description = null;
            row.$relationship_id = null;
            row.relationship = null;
            return;
        }
        const insured = await $api.get(`insured/${id}`)

        row.id = String(insured.id);
        row.description = insured.fullname;
        row.$relationship_id = row.$relationship_id;

    } catch (error) {
        console.log(error);
    }
}

function clearRelation(row) {
    try {
        row.id = null;
        row.description = null;
        row.$relationship_id = null;
        row.relationship = null;
    } catch (error) {
        console.log(error);
    }
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
        state.item = await $api.get(`insured/${props.id}`)
        state.item.policies = await $api.get(`policy`, {
            params: {
                groupBy: ["t_policy.id"],
                join: [{ table: 't_policy_insured', relationA: 't_policy_insured.policy_id', relationB: 't_policy.id' }],
                where: {
                    insured_id: props.id,
                    't_policy_insured.c_status': 4
                },
                limit: 10,
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

    // if (!props.isEdit) {
    //     if (!state.item.policy_number || !state.item.titular_id || !state.item.insured_code || !state.item.$relationship_id) {
    //         $q.notify({
    //             type: 'error',
    //             message: 'Para agregar un asegurado, es requerido añadirlo a una póliza'
    //         })
    //         return;
    //     }
    // }

    if (props.isEdit) {
        const response = await $api.put(`insured/${props.id}`, {
            ...state.item,
        });


        if (response) {
            $emit('close', response.id)
            $q.notify({
                type: 'success',
                message: 'Asegurado Editado'
            })
        }
    } else {

        const response = await $api.post('insured', {
            ...state.item,
        });

        if (response) {
            $emit('close', response.id)
            $q.notify({
                type: 'success',
                message: 'Asegurado Agregado'
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