<template>
    <div class="flex justify-between md:flex-nowrap">
        <div class="flex flex-nowrap w-full gap-2 mb-1">
            <q-input class="w-full md:w-auto" dense outlined debounce="300" v-model="state.search"
                :placeholder="$t('search')">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>
            <q-btn flat class="button h-full" icon="add" :label="$isDesktop && $t('add')"
                @click="state.dialogCreate = true" />
            <q-btn v-if="state.selected.length" flat class="button h-full bg-primary text-white"
                icon-right="sym_o_remove" :label="$isDesktop ? 'Remover' : ''" no-caps @click="onDeleteRows" />
        </div>
        <div v-if="$isDesktop" class="grid grid-flow-col auto-cols-max gap-2">
            <q-btn class="bg-transparent" flat no-caps>{{ itemsRange.start }} - {{ itemsRange.end
                }} de {{ state.pagination.rowsNumber }}</q-btn>
            <q-btn class="bg-transparent" icon="sym_o_first_page" flat @click="tableRef.firstPage()"></q-btn>
            <q-btn class="bg-transparent" icon="sym_o_navigate_before" flat @click="tableRef.prevPage()"></q-btn>
            <q-btn class="bg-transparent" icon="sym_o_navigate_next" flat @click="tableRef.nextPage()"></q-btn>
            <q-btn class="bg-transparent" icon="sym_o_last_page" flat @click="tableRef.lastPage()"></q-btn>
        </div>
    </div>
    <q-table :grid="!$isDesktop" hide-pagination :rows="state.rows" :columns="state.columns" row-key="id" ref="tableRef"
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
        <template v-slot:body-cell-password_token="props">
            <q-td :props="props">
                <q-badge class="text-font" color="default">{{ props.row.password_token ?? 'Contraseña cambiada' }}</q-badge>
            </q-td>
        </template>
        <template v-slot:body-cell-action="props">
            <q-td :props="props">
                <div class="flex gap-2">
                    <q-btn flat class="button bg-default text-primary rounded-md" label="consultar" no-caps size="sm"
                        @click="$router.push(`${$path.user}/${$path.user_consult}/${props.row.id}`)" />
                    <q-btn flat class="button bg-default text-primary rounded-md" size="sm" label="Editar" no-caps
                        @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                    <q-btn v-if="$me.unixroles & 3" flat class="button bg-default text-primary rounded-md" size="sm"
                        label="Cambiar contraseña" no-caps
                        @click="state.selectedId = props.row.id; state.dialogChangePassword = true;" />
                </div>
            </q-td>
        </template>

        <template v-slot:item="props">
            <div class="q-py-xs col-xs-12 col-sm-6 col-md-4" :style="props.selected ? 'transform: scale(0.95);' : ''">
                <div bordered flat class="card pb-2 relative flex flex-nowrap">
                    <div class="absolute right-3 top-2">
                        <q-checkbox dense v-model="props.selected" :label="props.row.name" />
                    </div>
                    <div class="pl-3 pr-8 w-full pt-2 flex flex-col overflow-hidden">
                        <span class="text-uppercase line-clamp-1 font-semibold">{{ props.row.description }}</span>
                        <span class="text-uppercase line-clamp-1 text-xxs">{{ props.row.roles_format }}</span>
                        <span class="text-uppercase line-clamp-1 text-xxs">{{ props.row.email }}</span>
                        <div class="flex justify-end gap-2 -mr-5 mt-1">
                            <q-btn flat class="button bg-default text-primary rounded-md" size="sm" label="consultar"
                                no-caps @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                            <q-btn flat class="button bg-default text-primary rounded-md" size="sm" label="Editar"
                                no-caps @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                            <q-btn v-if="$me.unixroles & 3" flat class="button bg-default text-primary rounded-md"
                                size="sm" label="contraseña" no-caps
                                @click="state.selectedId = props.row.id; state.dialogChangePassword = true;" />
                        </div>
                    </div>

                </div>
            </div>
        </template>
        <template v-slot:bottom v-if="!$isDesktop">
            <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
        </template>
    </q-table>
    <q-dialog class="q-pa-none" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'" full-height
        :full-width="$isDesktop" maximized :transition-duration="100">
        <q-card>
            <UserWrite @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit
                :width="$isDesktop ? '400px' : '100%'" />
        </q-card>
    </q-dialog>
    <q-dialog v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
        :transition-duration="100">
        <q-card>
            <UserWrite @close="state.dialogCreate = false" isDrawer :width="$isDesktop ? '400px' : '100%'" />
        </q-card>
    </q-dialog>
    <q-dialog v-model="state.dialogChangePassword" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
        :transition-duration="100">
        <q-card>
            <ChangePassword @close="state.dialogChangePassword = false" isDrawer :id="state.selectedId" isEdit
                :width="$isDesktop ? '400px' : '100%'" />
        </q-card>
    </q-dialog>
</template>

<script setup>
import { reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import UserWrite from './components/UserWrite.vue'
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import ChangePassword from "./components/ChangePassword.vue";
const { t } = useI18n()
const tableRef = ref()

const state = reactive({
    dialogChangePassword: false,
    dialogWrite: false,
    dialogList: false,
    dialogCreate: false,
    selectedId: 0,
    dialogWidth: 400,
    selected: [],
    search: '',
    search_key: 'orlike:description',
    pagination: {
        sortBy: 'description',
        descending: false,
        page: 1,
        rowsPerPage: 20,
    },
    url: 'user',
    query: {
        groupBy: ['t_user.id'],
        where: {
            c_status: 4,
            'ne:id': 1
        }
    },
    columns: [
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: row => row.id,
            format: val => `${val}`,
            classes: 'w-[220px]'
        },
        {
            name: 'description',
            required: true,
            label: t('name'),
            align: 'left',
            field: row => row.description,
            sortable: true
        },
        {
            name: 'username',
            required: true,
            label: t('username'),
            align: 'left',
            field: row => row.username,
            sortable: true
        },
        {
            name: 'email',
            required: true,
            label: t('email'),
            align: 'left',
            field: row => row.email,
            sortable: true
        },
        {
            name: 'password_token',
            required: true,
            label: t('password_token'),
            align: 'left',
            field: row => row.password_token,
            sortable: true
        },
        {
            name: 'roles',
            required: true,
            label: t('role'),
            align: 'left',
            field: 'roles_format',
            sortable: true
        },
    ],
    rows: [
    ]
})

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_user, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>