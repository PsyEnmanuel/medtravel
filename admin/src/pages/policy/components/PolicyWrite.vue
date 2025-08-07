<template>
    <div :style="style">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar PÓLIZA</p>
                <b class="font-bold text-brand">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">PÓLIZA</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">


            <div class="flex flex-col gap-1">

                <InsuranceSelect @setInsurance="setInsurance($event, row)" @clearInsurance="clearInsurance(row)"
                    :model-value="state.item.insurance" requiredSelect />

                <q-input @keydown.enter.prevent dense outlined v-model="state.item.policy_number"
                    :label="$t('policy_number') + '*'" @update:model-value="findPolicy" :rules="[requiredInput]"
                    hide-bottom-space></q-input>

                <CustomerSelect @setCustomer="setCustomer($event, row)" @clearCustomer="clearCustomer(row)"
                    :model-value="state.item.customer_description" add requiredSelect />
                    
                <!-- <q-input v-if="!isEdit" dense outlined v-model="state.item.insured_code"
                    :label="$t('insured_code')"></q-input> -->


                <!-- <q-select :readonly="!state.item.insurance" :label="$t('insurance_plan')" dense outlined clearable
                    v-model="state.item.insurance_plan" use-input hide-selected fill-input input-debounce="0"
                    :options="options.insurance_plan" :placeholder="$t('insurance_plan ')" option-value="id"
                    option-label="description" emit-value map-options>
                    <template v-slot:no-option>
                        <q-item>
                            <q-item-section class="text-grey">
                                No data
                            </q-item-section>
                        </q-item>
                    </template>
</q-select> -->

                <!-- <q-select :readonly="!state.item.insurance" :label="$t('insurance_plan_type')" dense outlined clearable
                    v-model="state.item.insurance_plan_type" use-input hide-selected fill-input input-debounce="0"
                    :options="options.insurance_plan_type" :placeholder="$t('insurance_plan_type')" option-value="id"
                    option-label="description" emit-value map-options>
                    <template v-slot:no-option>
                        <q-item>
                            <q-item-section class="text-grey">
                                No data
                            </q-item-section>
                        </q-item>
                    </template>
                </q-select> -->

                <!-- <q-field ref="fieldRef" filled :model-value="slider" label="Maximum 60" stack-label
                    :rules="[val => val <= 60 || 'Please set value to maximum 60']">
                    <template v-slot:control>
                        <q-slider v-model="state.item.slidder" :min="0" :max="100" label label-always class="q-mt-lg"
                            style="width: 200px" />
                    </template>
                </q-field> -->

                <div class="grid grid-cols-2 gap-1">
                    <div>
                        <div class="subtitle">{{ $t('policy_type') }}</div>
                        <q-field :rules="[requiredInput]" hide-bottom-space :model-value="state.item.$policy_type_id">
                            <template v-slot:control>
                                <q-option-group class="flex gap-1" size="xs" v-model="state.item.$policy_type_id"
                                    toggle-color="secondary" toggle-text-color="text-font" :options="$cats.policy_type"
                                    type="radio" />
                            </template>
                        </q-field>
                    </div>

                    <div>
                        <div class="subtitle">{{ $t('policy_branch') }}</div>
                        <q-field :rules="[requiredInput]" hide-bottom-space :model-value="state.item.$policy_branch_id">
                            <q-option-group class="flex gap-1" size="xs" v-model="state.item.$policy_branch_id"
                                toggle-color="secondary" toggle-text-color="text-font" :options="$cats.policy_branch"
                                type="radio" />
                        </q-field>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-1">
                    <q-input @keydown.enter.prevent class="w-full" dense outlined
                        v-model="state.item.validity_date_start" mask="##-##-####" :label="$t('validity_date_start')">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy ref="proxy">
                                    <q-date flat v-model="state.item.validity_date_start" no-unset years-in-month-view
                                        minimal mask="DD-MM-YYYY" @update:model-value="$refs.proxy.hide()"></q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>

                    <q-input @keydown.enter.prevent class="w-full" dense outlined v-model="state.item.validity_date_end"
                        mask="##-##-####" :label="$t('validity_date_end')">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy ref="proxy">
                                    <q-date flat v-model="state.item.validity_date_end" no-unset years-in-month-view
                                        minimal mask="DD-MM-YYYY" @update:model-value="$refs.proxy.hide()"></q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                </div>

                <!-- <InsuredSelect @setInsured="setTitular($event, row)" @clearInsured="clearTitular(row)"
                    :model-value="state.item.titular_description" label="Elegir Titular" /> -->

                <q-input @keydown.enter.prevent :label="$t('deductible')" input-class="text-right" dense outlined
                    v-model="state.item.deductible" v-maska:[optionsMoney] data-maska="0.99"
                    :data-maska-tokens="maskaMoney" hide-bottom-space>
                </q-input>

                <q-input @keydown.enter.prevent dense outlined v-model="state.item.intermediary"
                    :label="$t('intermediary')"></q-input>

                <div class="bg-default p-1 rounded-md text-center font-bold">Contactos</div>
                <q-btn flat class="button bg-primary-light w-full" no-caps @click="addRowContact">Agregar nuevo
                    contacto</q-btn>
                <div class="bg-default p-1 rounded-md text-center font-bold">Listado de contactos</div>
                <div v-for="contact in state.item.contacts" :key="contact.id"
                    class="p-1 bg-default flex flex-nowrap gap-1">
                    <div class="flex flex-col gap-1">
                        <div
                            class="w-full max-w-[40px] min-w-[40px] min-h-[40px] flex justify-center items-center border card shadow-none">
                            {{ contact.id }}
                        </div>
                        <q-btn flat class="button-icon bg-primary text-white text-[10px] h-[40px]"
                            icon="fa-solid fa-xmark" @click="removeContact(contact.id)">
                            <q-tooltip class="bg-default text-black text-xs">Remover
                                itinerario</q-tooltip>
                        </q-btn>
                    </div>
                    <div class="flex flex-col gap-1 w-full">
                        <q-input @keydown.enter.prevent :label="$t('name')" dense outlined
                            v-model="state.item.description" hide-bottom-space>
                        </q-input>
                        <q-input @keydown.enter.prevent :label="$t('phone')" dense outlined v-model="state.item.phone"
                            hide-bottom-space>
                        </q-input>
                        <q-input @keydown.enter.prevent :label="$t('email')" dense outlined v-model="state.item.email"
                            hide-bottom-space>
                        </q-input>
                    </div>
                </div>

            </div>

            <div v-if="isDrawer" class="fixed bottom-0 right-[10px] py-2 bg-white w-full" :style="style">
                <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                    label="Guardar cambios" type="submit" />
                <q-btn v-else class="button-press w-full text-lg rounded-md bg-primary text-white" flat label="agregar"
                    type="submit" />
            </div>
            <div v-else class="mt-2">
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
import InsuranceSelect from 'src/components/select/InsuranceSelect.vue';
import { useFilter } from 'src/use/filter';
import CustomerSelect from 'src/components/select/CustomerSelect.vue';
import { vMaska } from 'maska'
import { maskaMoney, optionsMoney } from 'src/helpers/mask';
const $api = inject('$api');
const $cats = inject('$cats');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })

const options = reactive({
    insured_type: $cats.value.insured_type,
    relationship: $cats.value.relationship,
    policy_branch: $cats.value.policy_branch,
    policy_type: $cats.value.policy_type,
    insurance_plan: [],
    insurance_plan_type: [],
})
const initialContact = () => ({
    id: 1,
    description: null,
    phone: null,
    email: null
});

const initialItem = () => ({
    intermediary: `Matos Corredores De Seguros Srl`,
    insurance_plan: null,
    insurance_plan_type: null,
    $relationship_id: 157,
    $insured_type_id: 165,
    contacts: [initialContact()]
})

const state = reactive({
    contact: null,
    item: initialItem(),
    local: 'WriteInsurance',
    categories: [],
    plan: null,
    plan_type: null
})

function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

function addRowContact() {
    let newID = 1
    if (state.item.contacts.length) {
        newID = state.item.contacts[state.item.contacts.length - 1].id + 1
    }
    state.item.contacts.push(initialContact(newID))
}

function removeContact(id) {
    const index = state.item.contacts.findIndex(i => i.id === id)
    if (index !== -1) {
        state.item.contacts.splice(index, 1)
    }
}

async function findPolicy(row) {
    try {
        const [item] = await $api.get(`policy`, {
            params: {
                limit: 1,
                where: {
                    policy_number: state.item.policy_number,
                    c_status: 4
                },
                returnItems: true
            }
        });

        if (item) {
            $q.notify({
                type: 'success',
                message: 'Esta póliza ya existe'
            })
        }


    } catch (error) {
        console.log(error);
    }
}

async function setInsurance(id, row) {
    try {

        const insurance = await $api.get(`insurance/${id}`)

        state.item.insurance_id = insurance.id;
        state.item.insurance = insurance.description;

        options.insurance_plan = insurance.insurance_plan
        options.insurance_plan_type = insurance.insurance_plan_type

    } catch (error) {
        console.log(error);
    }
}

function clearInsurance() {
    try {
        state.item.insurance_id = null;
        state.item.insurance = null;
    } catch (error) {
        console.log(error);
    }
}

async function setCustomer(id, row) {
    try {

        const customer = await $api.get(`customer/${id}`)

        state.item.customer_id = customer.id;
        state.item.customer_description = customer.description;
        state.item.title = customer.title;

    } catch (error) {
        console.log(error);
    }
}

function clearCustomer() {
    try {
        state.item.customer_id = null;
        state.item.customer_description = null;
        state.item.title = null;
    } catch (error) {
        console.log(error);
    }
}

async function onSubmit() {

    if (props.isEdit) {
        const response = await $api.put(`policy/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Póliza Editada'
            })
        }
    } else {
        const response = await $api.post('policy', {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Póliza Agregada'
            })
            onReset()
        }
    }
}

async function onInit() {
    if (props.isEdit) {
        state.item = await $api.get(`policy/${props.id}`)
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