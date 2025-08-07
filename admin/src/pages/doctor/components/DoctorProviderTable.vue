<template>
    <q-page :class="insuredId ? 'px-2 py-3' : 'px-1.5 py-2 lg:px-5 lg:py-6'">
        <div class="flex justify-between md:flex-nowrap mb-2">
            <div class="flex flex-nowrap w-full gap-1">
                <q-input class="w-full min-w-[200px] md:w-full" dense outlined debounce="300" v-model="state.search"
                    :placeholder="$t('search')">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
                <q-btn flat class="button h-full" icon="add" :label="$isDesktop && $t('add')"
                    @click="state.dialogCreate = true" />
            </div>
        </div>
        <div class="flex justify-between md:flex-nowrap mb-2">
            <q-select class="w-full" v-model="state.query.where['jo:$attention_type_ids']" use-chips dense outlined
                clearable multiple :options="options.attention_type" option-value="id" :label="$t('attention_type')"
                option-label="description" emit-value map-options use-input @filter="(val, update, abort) =>
                    filterFnCategory(val, update, abort, 'attention_type')" />
        </div>
        <div v-if="$isDesktop" class="flex justify-end">
            <div class="grid grid-flow-col auto-cols-max gap-1">
                <q-btn class="bg-transparent" flat no-caps>{{ itemsRange.start }} - {{ itemsRange.end
                    }} de {{ state.pagination.rowsNumber }}</q-btn>
                <q-btn class="bg-transparent" icon="sym_o_first_page" flat @click="tableRef.firstPage()"></q-btn>
                <q-btn class="bg-transparent" icon="sym_o_navigate_before" flat @click="tableRef.prevPage()"></q-btn>
                <q-btn class="bg-transparent" icon="sym_o_navigate_next" flat @click="tableRef.nextPage()"></q-btn>
                <q-btn class="bg-transparent" icon="sym_o_last_page" flat @click="tableRef.lastPage()"></q-btn>
            </div>
        </div>
        <div class="h-[32px] flex justify-end">
            <q-btn v-if="state.selected.length" flat class="button h-full bg-primary text-white"
                icon-right="sym_o_remove" label="Remover" no-caps
                @click="onDeleteRows" />
        </div>
        <q-table :grid="!$isDesktop || cardView" hide-pagination :rows="state.rows" :columns="state.columns"
            row-key="id" ref="tableRef" @request="onRequest" flat selection="multiple"
            v-model:pagination="state.pagination" v-model:selected="state.selected"
            :selected-rows-label="getSelectedString" :loading="state.loading" rows-per-page-label="Lineas"
            :wrap-cells="true">
            <template v-slot:no-data="{ icon, message, filter }">
                <div class="full-width row flex-center text-primary q-gutter-sm">
                    <span>
                        {{ message }}
                    </span>
                    <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                </div>
            </template>
            <template v-slot:body-cell-description="props">
                <q-td :props="props">
                    <div class="flex flex-col">
                        <div>{{ props.row.description }}</div>
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-speciality="props">
                <q-td :props="props">
                    <div class="flex flex-col" v-for="p in props.row.speciality" :key="p.id">
                        <div class="subtitle text-xs">{{ p.description }}</div>
                        <ul class="flex flex-col list-inside text-xxs mt-1" v-for="s in p.sub" :key="s.id">
                            <li v-if="s.checked">{{ s.description }}</li>
                        </ul>
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-provider="props">
                <q-td :props="props">
                    <div class="flex flex-col" v-for="p in props.row.provider" :key="p.id">
                        <div class="subtitle text-xs mb-1">{{ p.description }}</div>
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-bio="props">
                <q-td :props="props">
                    <div class="flex flex-col">
                        <div class="line-clamp-1">{{ props.row.bio }}</div>
                    </div>
                </q-td>
            </template>
            <template v-slot:body-cell-action="props">
                <q-td :props="props">
                    <div class="flex gap-1">
                        <q-btn flat class="button bg-default text-primary rounded-md" label="Editar" no-caps
                            @click="state.selectedId = props.row.id; state.dialogWrite = true;" />
                        <q-btn flat class="button bg-default text-primary rounded-md" label="consultar" no-caps
                            @click="$router.push(`${$path.doctor}/${$path.doctor_consult}/${props.row.id}`)" />
                    </div>
                </q-td>
            </template>

            <template v-slot:item="props">
                <div class="q-py-xs col-xs-12 col-sm-6 col-md-4" :class="cardView ? 'col-md-12' : ''"
                    :style="props.selected ? 'transform: scale(0.95);' : ''">
                    <DoctorCard :item="props" @selectedId="state.selectedId = $event; state.dialogWrite = true;" />
                </div>
            </template>
            <template v-slot:bottom v-if="!$isDesktop">
                <q-btn flat class="button bg-primary-light w-full" no-caps @click="addMore">Cargar más</q-btn>
            </template>
        </q-table>
        <q-dialog class="q-pa-none" v-model="state.dialogWrite" :position="$isDesktop ? 'right' : 'standard'"
            full-height :full-width="$isDesktop" maximized :transition-duration="100">
            <q-card>
                <DoctorWrite @close="state.dialogWrite = false" isDrawer :id="state.selectedId" isEdit
                    :width="$isDesktop ? '1000px' : '100%'" />
            </q-card>
        </q-dialog>
        <q-dialog v-model="state.dialogCreate" :position="$isDesktop ? 'right' : 'standard'" full-height maximized
            :transition-duration="100">
            <q-card>
                <DoctorWrite @close="state.dialogCreate = false" isDrawer :width="$isDesktop ? '1000px' : '100%'"
                    :providerId="providerId" />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue"
import { useTable } from "src/use/table"
import DoctorWrite from './DoctorWrite.vue'
import { useUpdateStore } from "src/stores/update";
import { useI18n } from "vue-i18n";
import { useFilter } from "src/use/filter";
import DoctorCard from "./DoctorCard.vue";
const { t } = useI18n()
const tableRef = ref()
const $cats = inject('$cats');
const props = defineProps({ providerId: Number, cardView: Boolean })

const options = reactive({
    attention_type: $cats.value.attention_type,
})

const state = reactive({
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
        rowsPerPage: 5,
    },
    url: 'doctor',
    query: {
        groupBy: ['t_doctor.id'],
        where: {
            'jo:$attention_type_ids': [],
            'js:provider': [props.providerId] || null,
            c_status: 4,
        }
    },
    columns: [
        {
            name: 'action',
            required: true,
            label: '',
            align: 'left',
            field: t('id'),
            classes: 'w-[220px]'
        },
        {
            name: 'description',
            required: true,
            label: t('name'),
            align: 'left',
            field: 'description',
            sortable: true,
            classes: 'w-[220px]'
        },
        {
            name: 'attention_type',
            required: true,
            label: t('attention_type'),
            align: 'left',
            field: 'attention_type',
            sortable: true,
            classes: 'w-[100px]',
            format(value, row) {
                return row.attention_type.join(', ')
            }
        },
        {
            name: 'speciality',
            required: true,
            label: t('specialities'),
            align: 'left',
            field: 'speciality',
            sortable: true,
            classes: 'w-[220px]'
        },
        {
            name: 'provider',
            required: true,
            label: t('providers'),
            align: 'left',
            field: 'provider',
            sortable: true,
        },
        // {
        //     name: 'bio',
        //     required: true,
        //     label: t('bio'),
        //     align: 'left',
        //     field: 'bio',
        //     sortable: true,
        //     classes: 'w-[400px]'
        // },
        {
            name: 'note',
            required: true,
            label: t('note'),
            align: 'left',
            field: 'note',
            sortable: true,
        },
    ],
    rows: [
    ]
})

const { onRequest, getSelectedString, onDeleteRows, addMore, itemsRange } = useTable(state, tableRef)

const { filterFnCategory } = useFilter(options)

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_doctor, (data) => {
    tableRef.value.requestServerInteraction()
    tableRef.value.clearSelection()
}, { deep: true })

</script>