<template>
    <div>
        <div class="flex flex-col gap-2">
            <q-form ref="writeForm" class="flex flex-col gap-1" autofocus @submit="onSubmit" @reset="onReset">
                <div class="bg-default p-1 rounded-md text-center font-bold text-xs">
                    Comentarios Administrativos
                </div>
                <q-input dense outlined v-model="state.item.text" :label="$t('comment')" type="textarea" :rows="3"
                    :rules="[requiredInput]" hide-bottom-space>
                </q-input>
                <q-btn flat class="button-icon bg-primary text-white" label="agregar" type="submit">
                </q-btn>
            </q-form>
            <div class="bg-default p-1 rounded-md text-center font-bold text-xs">
                Listado de comentarios
            </div>
            <div class="flex flex-col gap-2">
                <div class="flex flex-nowrap w-full gap-2">
                    <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
                        :placeholder="$t('search')">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                    <q-btn v-if="state.selected.length" flat class="button h-full bg-primary text-white"
                        icon-right="sym_o_remove" :label="$isDesktop ? 'Remover' : ''" no-caps @click="onDeleteRows" />
                </div>
                <div v-if="$isDesktop" class="grid grid-cols-5 gap-2">
                    <q-btn class="button-icon bg-transparent text-xxs" flat no-caps>{{ itemsRange.start }} - {{
                        itemsRange.end
                        }} de {{ state.pagination.rowsNumber }}</q-btn>
                    <q-btn class="button-icon bg-transparent" icon="sym_o_first_page" flat
                        @click="tableRef.firstPage()"></q-btn>
                    <q-btn class="button-icon bg-transparent" icon="sym_o_navigate_before" flat
                        @click="tableRef.prevPage()"></q-btn>
                    <q-btn class="button-icon bg-transparent" icon="sym_o_navigate_next" flat
                        @click="tableRef.nextPage()"></q-btn>
                    <q-btn class="button-icon bg-transparent" icon="sym_o_last_page" flat
                        @click="tableRef.lastPage()"></q-btn>
                </div>
            </div>
            <q-table grid hide-pagination :rows="state.rows" :columns="state.columns" row-key="id" ref="tableRef"
                @request="onRequest" flat selection="multiple" v-model:pagination="state.pagination"
                v-model:selected="state.selected" :selected-rows-label="getSelectedString" :loading="state.loading"
                rows-per-page-label="Lineas" :wrap-cells="true">
                <template v-slot:no-data="{ icon, message, filter }">
                    <div class="full-width row flex-center text-primary q-gutter-sm">
                        <span>
                            {{ message }}
                        </span>
                        <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                    </div>
                </template>

                <template v-slot:item="props">
                    <div class="q-py-xs col-xs-12" :style="props.selected ? 'transform: scale(0.95);' : ''">
                        <CommentCard :item="props.row" @open="state.selectedId = $event; state.dialogWrite = true" />
                    </div>
                </template>
                <template v-slot:bottom v-if="!$isDesktop">
                    <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
                </template>
            </q-table>
        </div>
        <q-dialog v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="100">
            <q-card>
                <CommentWrite @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit
                    :width="$isDesktop ? '400px' : '100%'" />
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import { inject, reactive, ref, watch } from 'vue';
import { requiredInput } from 'src/helpers/validation';
import { useQuasar } from 'quasar';
import { useTable } from 'src/use/table';
import { useUpdateStore } from 'src/stores/update';
import CommentCard from './CommentCard.vue';
import CommentWrite from './CommentWrite.vue';
const props = defineProps({ refKey: String, refId: Number, comment_state: String, comment_state_id: Number })
const emit = defineEmits(['submit'])

const $api = inject('$api');
const $q = useQuasar()
const writeForm = ref();
const tableRef = ref()

const initialItem = () => ({
    text: null,
    ref_id: props.refId,
    ref_key: props.refKey,
    comment_state: props.comment_state,
    comment_state_id: props.comment_state_id

})

const state = reactive({
    item: initialItem(),
    dialogWrite: false,
    selectedId: 0,
    dialogWidth: 400,
    selected: [],
    search: '',
    search_key: 'orlike:id',
    pagination: {
        sortBy: 'id',
        descending: false,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'comment',
    query: {
        groupBy: ['t_comment.id'],
        where: {
            c_status: 4,
            ref_id: props.refId,
            ref_key: props.refKey
        }
    },
    columns: [
    ],
    rows: [
    ]
})

async function onSubmit() {
    try {
        const res = await $api.post(`comment`, state.item)
        if (res) {
            $q.notify({
                type: 'success',
                message: 'Comentario agregado'
            })
        }
        onReset()
    } catch (error) {
        console.log(error);
    }
}

function onReset() {
    state.item = initialItem()
    // $local.remove(state.local)
    writeForm.value.resetValidation()
}

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_comment, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>