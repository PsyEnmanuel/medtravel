<template>
    <div v-if="!state.loading" :style="style" class="relative">
        <div class="flex flex-nowrap justify-between items-start gap-2 py-2">
            <div v-if="isEdit" class="mb-2">
                <p class="text-2xl text-info">Editar Archivo</p>
                <b class="font-bold text-brand line-clamp-1">{{ state.item.description }}</b>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Archivo</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <div class="pb-20 pt-2">
            <q-form ref="writeForm" class="flex flex-col gap-1" @submit="onSubmit" @reset="onReset">
                <div class="grid lg:grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                        <q-img class="w-full  max-h-[256px] object-cover" :src="state.item.url" spinner-color="white" />

                        <q-input dense outlined v-model="state.item.description" :label="$t('description') + '*'"
                            :rules="[requiredInput]" hide-bottom-space type="textarea" :rows="3"></q-input>

                        <q-select :label="$t('file_type')" dense outlined clearable v-model="state.item.$file_type_id"
                            use-input hide-selected fill-input input-debounce="0" :options="options.file_type"
                            @filter="(val, update, abort) => filterFnCategory(val, update, abort, 'file_type')"
                            :placeholder="$t('file_type')" option-value="id" option-label="description" emit-value
                            map-options @update:model-value="onChange(props.row)">
                            <template v-slot:no-option>
                                <q-item>
                                    <q-item-section class="text-grey">
                                        No data
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>

                        <q-input class="w-full" dense outlined v-model="state.item.file_date" mask="##-##-####"
                            label="Fecha del documento">
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy ref="proxy">
                                        <q-date flat v-model="state.item.file_date" no-unset years-in-month-view minimal
                                            mask="DD-MM-YYYY" @update:model-value="$refs.proxy.hide()"></q-date>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>

                        <q-input class="w-full" dense outlined v-model="state.item.expiration_date" mask="##-##-####"
                            label="Fecha de expiración">
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy ref="proxy">
                                        <q-date flat v-model="state.item.expiration_date" no-unset years-in-month-view
                                            minimal mask="DD-MM-YYYY" @update:model-value="$refs.proxy.hide()"></q-date>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                            <template v-slot:after>
                                <q-icon name="fa-solid fa-question" class="cursor-pointer">
                                    <q-popup-proxy ref="proxy">
                                        <div class="card p-2">
                                            Requerido para archivos:
                                            <ul>
                                                <li>Licencia</li>
                                                <li>Visa</li>
                                                <li>Pasaporte</li>
                                                <li>Cédula</li>
                                            </ul>
                                        </div>
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

                    </div>
                    <div class="flex flex-col gap-1">
                        <q-date class="card w-full" ref="file_date_range" flat v-model="state.item.file_date_range"
                            range multiple years-in-month-view minimal :events="state.holidaysDates"
                            event-color="orange" />
                        <div class="flex flex-nowrap gap-1 mb-1" v-for="(d, index) in state.item.file_date_range"
                            :key="d">
                            <template v-if="d?.from">
                                <div
                                    class="w-full max-w-[40px] min-w-[40px] flex justify-center items-center border card shadow-none">
                                    {{ index + 1 }}</div>
                                <div
                                    class="w-full flex flex-start items-center justify-between border card shadow-none px-3 py-1">
                                    <div class="uppercase pr-4 line-clamp-1">{{ format(d.from,
                                        'EEE dd MMM yyyy')
                                        }} - {{ format(d.to,
                                            'EEE dd MMM yyyy') }}
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div
                                    class="w-full max-w-[40px] min-w-[40px] flex justify-center items-center border card shadow-none">
                                    {{ index + 1 }}</div>
                                <div
                                    class="w-full flex flex-start items-center justify-between border card shadow-none px-3 py-1">
                                    <div class="uppercase pr-4 line-clamp-1">{{ format(d,
                                        'EEE dd MMM yyyy') }}
                                    </div>
                                </div>
                            </template>
                            <q-btn flat class="button-icon bg-primary text-white text-[10px] h-[40px]"
                                icon="fa-solid fa-xmark" @click="removeDateRange(index)">
                            </q-btn>
                        </div>

                        <q-input dense outlined v-model="state.item.note" label="Comentario de documento"
                            type="textarea" :rows="3"></q-input>
                    </div>
                </div>


                <div v-if="isDrawer" class="fixed bottom-0 right-[10px] py-2 bg-white" :style="style">
                    <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                        label="Guardar cambios" type="submit" />
                    <q-btn v-else class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                        label="agregar" type="submit" />
                </div>
                <div v-else>
                    <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md" flat
                        label="Guardar cambios" type="submit" />
                    <q-btn v-else class="button-press w-full text-lg rounded-md" flat label="agregar" type="submit" />
                </div>
            </q-form>
        </div>
    </div>
</template>

<script setup>
import CategoryDialog from 'src/pages/setting/category/CategoryDialog.vue';
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { maskaMoney, optionsMoney, maskaNumberToken, maskaNumber } from 'src/helpers/mask'
import { format } from 'date-fns';
import { requiredInput } from 'src/helpers/validation';
import { useQuasar } from 'quasar';
import languages from 'src/data/languages';
const $api = inject('$api');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const $cats = inject('$cats');
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })

const options = reactive({
    file_type: $cats.value.file_type,
    languages: languages.filter(i => i.available),
    binary: [
        {
            label: 'Si',
            value: 1,
        },
        {
            label: 'No',
            value: 1,
        },
    ]
})

const initialItem = () => ({
    c_status: 4,
})

const state = reactive({
    loading: true,
    item: initialItem(),
    local: 'catalogue',
    categories: [],
})


function onReset() {
    state.item = initialItem()
    $local.remove(state.local)
    writeForm.value.resetValidation()
}

function removeDateRange(index) {
    try {
        state.item.file_date_range.splice(index, 1)
    } catch (error) {
        console.log(error);
    }
}

async function onSubmit() {

    const categories = await $api.get(`category`, {
        params: {
            where: {
                c_status: 4,
                parent_id: 24,
                'in:description': ['LICENCIA', 'VISA', 'PASAPORTE', 'CEDULA']
            },
            returnItems: true
        }
    })
    
    if(!state.item.expiration_date) {
        if (categories.length && state.item.$file_type_id) {
            const index = categories.findIndex(i => i.id === state.item.$file_type_id)
            if(index !== -1) {
                $q.notify({
                    type: 'success',
                    message: 'Los archivos de tipo: Licencia, Visa, Pasaporte, Cédula son requeridos'
                })
                return;
            }
        }
    }

    state.item.language = options.languages.reduce((acc, curr) => {
        if (state.item.language_ids?.includes(curr.value)) {
            acc.push(curr.label)
        }
        return acc
    }, []);
    
    if (props.isEdit) {
        const response = await $api.put(`file/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Archivo Editada'
            })
        }
    } else {
        const response = await $api.post('file', {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Archivo Agregada'
            })
            onReset()
        }
    }
}

async function onInit() {
    state.loading = true;

    if (props.isEdit) {
        state.item = await $api.get(`file/${props.id}`)
    } else {
        if ($local.get(state.local)) {
            // state.item = $local.get(state.local)
        }
    }
    state.loading = false;
}

const style = computed(() => {
    return {
        width: props.width,
        'padding-right': props.isDrawer && '8px',
        'padding-left': props.isDrawer && '8px'
    }
})


import { useFilter } from 'src/use/filter';
const { filterFnCategory, filterFn } = useFilter(options)

onMounted(() => {
    onInit()
})
</script>