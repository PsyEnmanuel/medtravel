<template>
    <div>
        <div class="flex flex-col gap-2">
            <q-form v-if="grid" ref="writeForm" class="flex flex-col gap-1" autofocus @submit="onSubmit"
                @reset="onReset">
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
                Listado de comentarios administrativos
            </div>
            <div class="flex flex-nowrap justify-between gap-2">
                <div class="flex flex-nowrap w-full gap-1">
                    <q-input class="w-full max-w-[200px] md:w-auto" dense outlined debounce="300" v-model="state.search"
                        :placeholder="$t('search')" hide-bottom-space>
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                    <q-btn v-if="!grid" flat class="button h-full" icon="add" :label="$isDesktop && $t('comentario')"
                        @click="state.dialogWrite = true" />
                    <q-btn v-if="grid && state.selected.length" flat class="button h-full bg-primary text-white"
                        :class="{ 'col-span-3': grid, 'col-span-1': !grid }" icon-right="sym_o_remove"
                        :label="$isDesktop ? 'Remover' : ''" no-caps @click="onDeleteRows" />
                </div>
                <div v-if="$isDesktop">
                    <PaginationTable :rowsNumber="state.pagination.rowsNumber" :itemsRange="itemsRange"
                        :tableRef="tableRef" />
                </div>
            </div>
            <q-table :grid="isGrid" hide-pagination :rows="state.rows" :columns="state.columns" row-key="id"
                ref="tableRef" @request="onRequest" flat selection="none" v-model:pagination="state.pagination"
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
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="action" :props="props">
                            <q-btn flat class="button text-primary rounded-md" size="sm" label="Editar" no-caps
                                @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                        </q-td>
                        <q-td key="text" :props="props">
                            <div class="line-clamp-3 text-xs">
                                {{ props.row.text }}
                            </div>
                        </q-td>

                        <q-td key="comment_state" :props="props">
                            <span class="text-xxs">{{ props.row.comment_state }}</span>
                        </q-td>

                        <q-td key="created_by" :props="props">
                            <div class="flex flex-col">
                                <span class="text-xxs">{{ props.row.created_by }}</span>
                                <span class="text-xxs">{{ props.row.created_format }}</span>
                            </div>
                        </q-td>

                    </q-tr>
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
        <q-dialog v-model="state.dialogWrite" @update:model-value="handleCommentDialog"
            :position="$isDesktop ? 'right' : 'standard'" full-height maximized :transition-duration="100">
            <q-card>
                <CommentWrite @close="state.dialogWrite = false; state.selectedId = 0" @submit="onSubmit" isDrawer
                    :id="state.selectedId" :isEdit="state.selectedId > 0" :width="$isDesktop ? '400px' : '100%'" />
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import { computed, inject, reactive, ref, watch } from 'vue';
import { requiredInput } from 'src/helpers/validation';
import { useQuasar } from 'quasar';
import { useTable } from 'src/use/table';
import { useUpdateStore } from 'src/stores/update';
import CommentCard from './CommentCard.vue';
import CommentWrite from './CommentWrite.vue';
import PaginationTable from 'src/components/table/PaginationTable.vue';
const props = defineProps({
    refKey: String,
    grid: { type: Boolean, default: true },
    refId: Number,
    comment_state: String,
    comment_state_id: Number
})
const $emit = defineEmits(['submit'])

const $api = inject('$api');
const $cats = inject('$cats');
const $isDesktop = inject('$isDesktop');
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

const isGrid = computed(() => {
    return props.grid || !$isDesktop
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
            ref_id: props.refId || 0,
            ref_key: props.refKey
        }
    },
    columns: [
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            style: 'width: 40px;',
        },
        {
            name: 'text',
            label: 'Texto',
            align: 'left',
            sortable: true,
            flex: 1,
            style: 'min-width: 300px;',
            headerStyle: 'height: 45px;',
        },
        {
            name: 'comment_state',
            label: 'Estado',
            align: 'left',
            sortable: true,
            style: 'width: 200px;',
            format: val => val || '—',
        },
        {
            name: 'created_by',
            label: 'Usuario',
            align: 'left',
            style: 'width: 200px;',
            sortable: true,
        },
    ],
    rows: []
})

function handleCommentDialog(value) {
    state.dialogWrite = value
    if (!value) {
        state.selectedId = 0
    }
}

function onReset() {
    state.item = initialItem()
    // $local.remove(state.local)
    writeForm.value?.resetValidation()
}

async function onSubmit(text) {
    try {
        if (props.ref_id) {
            const res = await $api.post(`comment`, { ...state.item, text: text || state.item.text });
            if (res) {
                $q.notify({
                    type: 'success',
                    message: 'Comentario agregado'
                })
            }

        } else {
            if (props.refKey === 't_event' && props.comment_state_id) {
                const cat = $cats.value.event_state.find(i => i.id === props.comment_state_id)
                console.log(cat);
                state.item.comment_state = cat.description
            }
            state.rows.push({ ...state.item, text: text || state.item.text })
            $emit('submit', state.rows)
        }
        state.dialogWrite = false
        onReset()
    } catch (error) {
        console.log(error);
    }
}

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_comment, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>