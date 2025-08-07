<template>
    <div v-if="!state.loading" :style="style" :class="isDrawer && 'pb-32'">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar Médico</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Médico</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <div class="grid lg:grid-cols-2 grid-cols-1 gap-2">
                <div>
                    <div class="bg-default p-1 rounded-md text-center font-bold mb-2">Médico</div>
                    <q-input class="mb-2" dense outlined v-model="state.item.firstname" :label="$t('name') + '*'"
                        :rules="[requiredInput]" hide-bottom-space @keydown.enter.prevent></q-input>
                    <q-input class="mb-2" dense outlined v-model="state.item.lastname" :label="$t('lastname') + '*'"
                        :rules="[requiredInput]" hide-bottom-space @keydown.enter.prevent></q-input>

                    <CategorySelectMultiple :model-value="state.item.postnominal" refKey="postnominal"
                        @setCategory="setCategory($event, '$postnominal_ids', 'postnominal')"
                        @clearCategory="state.item.$postnominal_ids = null" add multiple />

                    <!-- <q-select class="mb-2" v-model="state.item.$postnominal_ids" use-chips dense outlined clearable
                        multiple :options="options.postnominal" option-value="id" :label="$t('postnominal')"
                        option-label="description" emit-value map-options use-input @filter="(val, update, abort) =>
                            filterFnCategory(val, update, abort, 'postnominal')" /> -->

                    <!-- <q-select class="mb-2" dense outlined clearable v-model="state.item.$postnominal_ids"
                        :label="$t('postnominal')" multiple :options="options.postnominal" option-value="value"
                        option-label="label" emit-value map-options>
                        <template v-slot:no-option>
                            <q-item>
                                <q-item-section class="text-grey">
                                    No data
                                </q-item-section>
                            </q-item>
                        </template>
</q-select> -->

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

                    <q-select class="mb-2" v-model="state.item.$attention_type_ids" use-chips dense outlined clearable
                        multiple :options="options.attention_type" option-value="id" :label="$t('attention_type')"
                        option-label="description" emit-value map-options use-input @filter="(val, update, abort) =>
                            filterFnCategory(val, update, abort, 'attention_type')" />


                    <q-input class="mb-2" dense outlined v-model="state.item.exequatur" :label="$t('exequatur')"
                        @keydown.enter.prevent></q-input>

                    <q-input class="mb-2" dense outlined v-model="state.item.bio" :label="$t('review')"
                        type="textarea"></q-input>

                    <q-input class="mb-2" dense outlined v-model="state.item.note" :label="$t('note')"
                        type="textarea"></q-input>

                </div>

                <div>
                    <div>
                        <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">Proveedores [REQUERIDO]</div>
                        <div class="w-full" v-for="row in state.item.provider" :key="row.id">
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
                    <div class="my-1">
                        <div class="bg-default p-1 rounded-md text-center font-bold mb-2">Información de Contacto</div>
                        <q-input class="mb-2" dense outlined v-model="state.item.phone" :label="$t('phone')"
                            @keydown.enter.prevent></q-input>
                        <q-input class="mb-2" dense outlined v-model="state.item.email" :label="$t('email')"
                            @keydown.enter.prevent></q-input>
                        <CountrySelect class="mb-2" @setCountry="setCountry" @clearCountry="clearCountry"
                            :model-value="state.item.country" />
                        <StateSelect class="mb-2" :refId="state.item.country_id" @setState="setState"
                            @clearState="clearState" :model-value="state.item.state" />
                        <CitySelect class="mb-2" :refId="state.item.state_id" @setCity="setCity" @clearCity="clearCity"
                            :model-value="state.item.city" />
                        <q-input class="mb-2" dense outlined v-model="state.item.nationality" label="Nacionalidad"
                            @keydown.enter.prevent></q-input>
                        <q-input class="mb-2" dense outlined v-model="state.item.zipcode" :label="$t('zipcode')"
                            @keydown.enter.prevent></q-input>
                        <q-input class="mb-2" dense outlined v-model="state.item.address" :label="$t('address')"
                            type="textarea" :rows="3"></q-input>
                        <div>
                            <div class="bg-default p-1 rounded-md text-center font-bold mb-2">Redes sociales</div>
                            <q-input class="mb-2" dense outlined v-model="state.item.social.linkedin"
                                :label="$t('linkedin')" @keydown.enter.prevent></q-input>
                            <q-input class="mb-2" dense outlined v-model="state.item.social.instagram"
                                :label="$t('instagram')" @keydown.enter.prevent></q-input>
                            <q-input class="mb-2" dense outlined v-model="state.item.social.linkedweb"
                                :label="$t('linkedweb')" @keydown.enter.prevent></q-input>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">Especialidades</div>
                    <div v-for="(row, index) in state.item.speciality" :key="row.id">
                        <div class="q-pb-xs col-xs-12">
                            <div bordered flat class="card relative flex flex-col justify-between">
                                <div class="flex flex-nowrap items-center">
                                    <div class="p-2 w-full flex flex-col overflow-hidden text-xs line-clamp-1">

                                        <SpecialitySelect class="mb-2" @setSpeciality="setSpeciality($event, row)"
                                            @clearSpeciality="clearSpeciality(row)" :model-value="row.description" />

                                        <div v-for="r in row.sub" :key="r.id">
                                            <q-checkbox size="xs" v-model="r.checked" :label="r.description"
                                                :true-value="1" :false-value="0" />
                                        </div>

                                    </div>
                                </div>
                                <div class="px-2 py-2 flex justify-between flex-nowrap gap-2">
                                    <q-badge class="min-w-[30px] flex justify-center" color="primary"
                                        text-color="white">{{ index +
                                            1
                                        }}</q-badge>
                                    <q-btn flat class="button bg-primary text-white" size="sm" no-caps
                                        @click="removeRowSpeciality(row)">
                                        <span>Remover</span>
                                    </q-btn>
                                </div>
                            </div>
                        </div>
                    </div>
                    <q-btn flat class="button bg-primary-light w-full" no-caps @click="addRowSpeciality">Agregar otra
                        especialidad</q-btn>
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
import languages from 'src/data/languages';
import CategorySelectMultiple from 'src/components/select/CategorySelectMultiple.vue';

const $api = inject('$api');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean, providerId: Number })
const $emit = defineEmits(['close'])

const $cats = inject('$cats');

const options = reactive({
    languages: languages.filter(i => i.available),
    attention_type: $cats.value.attention_type,
    postnominal: $cats.value.postnominal,
    ident_type: $cats.value.ident_type.filter(i => {
        return [7, 8, 9].includes(i.id)
    }),
})

const initialItem = () => ({
    postnominal: [],
    $postnominal_ids: [],
    social: {
        linkedin: null,
        instagram: null,
        linkedweb: null,
    },
    speciality: [{
        id: null,
        description: null,
        sub: [],
    }],
    provider: [{
        id: null,
        description: null,
    }]
})

const state = reactive({
    loading: true,
    item: initialItem(),
    local: 'DoctorWrite',
})

watch(() => state.item.ident_no, async (val) => {
    if (props.isEdit) {
        return;
    }

    if (val) {
        let ident_no = val.replace(/\D/g, '');
        if (ident_no.length === 11) {
            await $api.get(`doctor/exist`, {
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

function setCategory($event, key, key2) {
    const index = state.item[key].findIndex(i => i === $event.id)

    if (index === -1) {
        state.item[key].push($event.id)
    } else {
        state.item[key].splice(index, 1)
    }

    const index2 = state.item[key2].findIndex(i => {
        return i.replace(/\s/g, '') === $event.description
    })

    if (index2 === -1) {
        state.item[key2].push($event.description)
    } else {
        state.item[key2].splice(index2, 1)
    }
}

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

function addRowSpeciality() {
    state.item.speciality.push({
        id: null,
        description: null,
        sub: [],
    })
}

function removeRowSpeciality(row) {
    try {
        const index = state.item.speciality.findIndex(i => i.id === row.id)
        if (index !== -1) {
            state.item.speciality.splice(index, 1)
        }
    } catch (error) {
        console.log(error);
    }
}

function addRowProvider() {
    state.item.provider.push({
        id: null,
        description: null,
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
                message: 'Esta proveedor ya esta agregado'
            })
            row.id = null;
            row.description = null;
            row.sub = [];
            return;
        }
        const provider = await $api.get(`provider/${id}`)
        row.id = String(provider.id);
        row.description = provider.description;

        if (!state.item.country) {
            setCountry(provider.country_id)
        }
        if (!state.item.state_id) {
            setState(provider.state_id)
        }
        if (!state.item.city_id) {
            setCity(provider.city_id)
        }
        if (!state.item.zipcode) {
            state.item.zipcode = provider.zipcode
        }
        if (!state.item.address) {
            state.item.address = provider.address
        }

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
        state.item = await $api.get(`doctor/${props.id}`);
    } else {
        if (props.providerId) {
            setProvider(props.providerId, state.item.provider[0])
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
    if (!state.item.provider && !state.item.provider.length) {
        $q.notify({
            type: 'warning',
            message: 'Es requerido agregar un proveedor'
        })
        return;
    }

    if (props.isEdit) {
        const response = await $api.put(`doctor/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $emit('close', response.id)
            $q.notify({
                type: 'success',
                message: 'Médico Editado'
            })
        }
    } else {
        const response = await $api.post('doctor', {
            ...state.item,
        });
        if (response) {
            $emit('close', response.id)
            $q.notify({
                type: 'success',
                message: 'Médico Agregado'
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