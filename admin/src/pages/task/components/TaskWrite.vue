<template>
    <div v-if="!state.loading" :style="style" :class="isDrawer && 'pb-32'">
        <div class="flex justify-between items-start gap-2 py-2">
            <div v-if="isEdit">
                <p class="lg:text-2xl text-info">Editar Solicitud</p>
                <p class="text-xs">Los campos requeridos tienen un (*)</p>
            </div>
            <div v-else>
                <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Solicitud</b></p>
                <p>Los campos requeridos tienen un (*)</p>
            </div>
            <div class="flex gap-2">
                <q-btn v-if="isDrawer" flat class="button" label="enviar correo" @click="sendEmail()"></q-btn>
                <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
            </div>
        </div>
        <div class="subtitle mb-2 bg-primary p-0.5 rounded-none"></div>
        <q-form :class="isDrawer ?? 'pb-64'" ref="writeForm" @submit="onSubmit" @reset="onReset">
            <div class="flex flex-nowrap gap-2">
                <div>
                    <div class="grid lg:grid-cols-2 gap-2 mb-2">
                        <div class="flex flex-col gap-1">
                            <div>
                                <div class="bg-default p-1 mb-2 rounded-md text-center font-bold">Usuarios</div>
                                <div v-for="(row, index) in state.item.user" :key="row.id">
                                    <div class="q-pb-xs col-xs-12">
                                        <div bordered flat class="card relative flex flex-col justify-between">
                                            <div class="flex flex-nowrap items-center">
                                                <div
                                                    class="p-2 w-full flex flex-col overflow-hidden text-xs line-clamp-1">

                                                    <UserSelect @setUser="setUser($event, row)" @clearUser="clearUser"
                                                        :model-value="row.description" :id="row.id" :unixroles="1023"
                                                        label="Asignado a:" />

                                                </div>
                                            </div>
                                            <div class="px-2 py-2 flex justify-between flex-nowrap gap-2">
                                                <q-badge class="min-w-[30px] flex justify-center" color="primary"
                                                    text-color="white">{{ index +
                                                        1
                                                    }}</q-badge>
                                                <q-btn flat class="button bg-primary text-white" size="sm" no-caps
                                                    @click="removeRowUser(row)">
                                                    <span>Remover</span>
                                                </q-btn>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <q-btn flat class="button bg-primary-light w-full" no-caps @click="addRowUser">Agregar
                                    otro
                                    usuario</q-btn>
                            </div>

                            <q-input dense outlined v-model="state.item.description" :label="$t('description') + '*'"
                                :rules="[requiredInput]" hide-bottom-space></q-input>
                            <q-option-group class="flex" unelevated spread v-model="state.item.$task_state_id"
                                toggle-color="secondary" toggle-text-color="text-font" :options="options.task_state" />
                            <CategorySelect :model-value="state.item.task_section" refKey="task_section"
                                @setCategory="state.item.$task_section_id = $event"
                                @clearCategory="state.item.$task_section_id = null" add required />
                        </div>
                        <div>
                            <q-input dense outlined v-model="state.item.detail" :label="$t('detail') + '*'"
                                :rules="[requiredInput]" hide-bottom-space type="textarea" :rows="20"></q-input>
                        </div>
                    </div>
                    <template v-if="isEdit">
                        <UploadFileManager :ref_id="state.item.id" table="t_task" file_type="GENERAL" />
                        <FileManager :refId="state.item.id" refKey="t_task" />
                    </template>
                    <template v-else>
                        <PlaceholderFileManager table="t_task" file_type="GENERAL" @update="state.files = $event" />
                    </template>
                </div>
                <div v-if="isEdit" class="flex flex-col w-full  md:max-w-[250px] min-w-[250px]">
                    <template v-if="!state.loading">
                        <CommentTable refKey="t_task" :refId="state.item.id" />
                    </template>
                </div>

            </div>
            <div v-if="isDrawer" class="fixed bottom-0 lg:right-[10px] right-0 py-2 bg-white mt-10" :style="style">
                <div v-if="props.isEdit" class="flex flex-nowrap gap-2">
                    <q-btn v-if="$me.unixroles & 3" class="button-icon text-lg rounded-md bg-primary text-white" flat
                        icon="fa-solid fa-close" size="xs" @click="removeRow" />
                    <q-btn class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                        label="Guardar cambios" type="submit" />
                </div>
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
import CategorySelect from 'src/components/select/CategorySelect.vue';
import UserSelect from 'src/components/select/UserSelect.vue';
import UploadFileManager from 'src/components/file/UploadFileManager.vue';
import FileManager from 'src/components/file/FileManager.vue';
import PlaceholderFileManager from 'src/components/file/PlaceholderFileManager.vue';

const $api = inject('$api');
const $local = inject('$local')
const $q = useQuasar()
const writeForm = ref();
const props = defineProps({ id: Number, isEdit: Boolean, width: String, isDrawer: Boolean })
const $emit = defineEmits(['close'])
const $cats = inject('$cats');
import { useUpload } from 'src/use/upload'
import CommentTable from 'src/pages/comment/components/CommentTable.vue';
const { uploadFiles } = useUpload()

const options = reactive({
    task_state: $cats.value.task_state.slice().reverse()
})

const initialItem = () => ({
    $task_state_id: 329,
    user: [{
        id: null,
        description: null,
    }]
})

const state = reactive({
    loading: true,
    item: initialItem(),
    local: 'TaskWrite',
    files: []
})


function addRowUser() {
    state.item.user.push({
        id: null,
        description: null,
    })
}

function removeRowUser(row) {
    try {
        const index = state.item.user.findIndex(i => i.id === row.id)
        if (index !== -1) {
            state.item.user.splice(index, 1)
        }
    } catch (error) {
        console.log(error);
    }
}

async function setUser(id, row) {
    try {
        const index = state.item.user.findIndex(i => i.id === id)
        if (index !== -1) {
            $q.notify({
                type: 'warning',
                message: 'Esta usuario ya esta agregada'
            })
            row.id = null;
            row.description = null;
            return;
        }
        const user = await $api.get(`user/${id}`)

        row.id = String(user.id);
        row.description = user.description;

    } catch (error) {
        console.log(error);
    }
}

function clearUser(row) {
    try {
        row.id = null;
        row.description = null;
    } catch (error) {
        console.log(error);
    }
}

async function removeRow() {
    try {
        const result = await $q.dialog({
            title: 'Confirmar',
            message: 'Deseas borrar este solicitud?',
            cancel: true,
            persistent: true
        })
        result.onOk(async () => {
            const response = await $api.delete(`task/${props.id}`);

            if (response) {
                $q.notify({
                    type: 'success',
                    message: 'solicitud Borrado'
                })
                $emit('close')
            }
        })
    } catch (error) {
        console.log(error);
    }
}

async function onInit() {
    if (props.isEdit) {
        state.item = await $api.get(`task/${props.id}`)
    } else {
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
    if (props.isEdit) {
        const response = await $api.put(`task/${props.id}`, {
            ...state.item,
        });
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Solicitud Editado'
            })
            if (state.item.$task_state_id === 331) {
                await $api.post(`comunication/task-closed`, { ...state.item })
                $q.notify({
                    type: 'success',
                    message: 'Solicitud Cerrada Enviada'
                })
            }
        }
    } else {
        const response = await $api.post('task', {
            ...state.item,
        });
        if (state.files.length) {
            uploadFiles({
                ref_key: 't_task',
                ref_id: response.id,
                file_type: 'GENERAL',
                files: state.files
            })
        }
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Solicitud Agregado'
            })
            onReset()
        }
    }
    $emit('close')
}

async function sendEmail() {
    try {

        const user = await $api.get(`user/${state.item.user_id}`)

        $q.dialog({
            title: 'AVISO',
            message: `Desea enviar la solicitud a ${user.email}?`,
            // prompt: {
            //     model: user.email,
            //     type: 'text'
            // },
            cancel: true,
            persistent: true
        }).onOk(async data => {
            await $api.post(`comunication/task`, { ...state.item, email: data })
            $q.notify({
                type: 'success',
                message: 'Solicitud enviada'
            })
        })

    } catch (error) {
        console.log(error);
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