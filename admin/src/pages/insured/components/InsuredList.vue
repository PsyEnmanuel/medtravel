<template>
    <div class="p-4 pb-20" :style="style">

        <div class="flex justify-between mb-2">
            <h3 class="text-lg font-bold text-sky-600">ASEGURADO</h3>
            <q-btn flat class="button" label="cerrar" @click="$emit('close')"></q-btn>
        </div>

        <q-input dense outlined v-model="state.search" :label="$t('search')" hide-bottom-space>
            <template #append><q-icon name="search" /></template>
        </q-input>

        <q-table grid hide-pagination hide-header :rows="state.rows" row-key="id" ref="tableRef" @request="onRequest"
            flat selection="multiple" v-model:pagination="state.pagination" :loading="state.loading"
            v-model:selected="state.selected" :selected-rows-label="getSelectedString" rows-per-page-label="Lineas"
            :rows-per-page-options="[10, 20, 50, 100]" :wrap-cells="true" no-data-label="No se encontraron asegurados">

            <template v-slot:no-data="{ icon, message, filter }">
                <NoData :icon="icon" :message="message" :filter="filter" />
            </template>

            <template v-slot:item="props">
                <div class="col-xs-12">
                    <div @click="$router.push(`/asegurados/consultar/${props.row.id}`)"
                        class="col-xs-12 col-sm-6 col-md-4 cursor-pointer">
                        <div class="card-shadow border pb-4 relative flex flex-nowrap mb-2">
                            <q-avatar rounded size="64px" class="p-2">
                                <img :src="$imageInsuredPlaceholder(props.row.sex)" />
                            </q-avatar>
                            <div class="pl-3 pr-8 w-full pt-2 flex flex-col overflow-hidden">
                                <span class="text-uppercase line-clamp-1 font-semibold">{{ props.row.description
                                    }}</span>
                                <div class="flex justify-between">
                                    <span class="text-uppercase text-xs">#{{ props.row.code }}</span>
                                </div>
                                <span class="text-uppercase text-xs">{{ props.row.age }}</span>
                                <span class="flex flex-col text-blue-600" v-for="(diag, index) in props.row.diagnosis"
                                    :key="diag">
                                    <small class="text-uppercase text-xs">D{{ index + 1 }}: {{ diag }}</small>
                                </span>
                                <span class="text-uppercase text-xs flex items-center"><q-icon class="mr-1"
                                        name="sym_o_badge" size="16"></q-icon>{{ props.row.ident_no }}</span>
                                <span v-if="!($me.unixroles & 16)"
                                    class="text-uppercase text-xs flex items-center"><q-icon class="mr-1"
                                        name="sym_o_phone" size="16"></q-icon>{{ props.row.phone }}</span>
                                <span v-if="props.row.email"
                                    class="text-uppercase line-clamp-1 text-xs flex items-center"><q-icon class="mr-1"
                                        name="sym_o_mail" size="16"></q-icon>{{ props.row.email }}</span>
                            </div>

                        </div>
                    </div>
                </div>
            </template>
        </q-table>

        <div class="card border pb-4 relative flex flex-nowrap ">
            <q-avatar rounded size="64px" class="p-2">
                <img :src="$imageInsuredPlaceholder(event.sex)" />
            </q-avatar>
            <div class="pl-3 pr-8 w-full pt-2 flex flex-col">
                <span class="text-uppercase line-clamp-1 font-semibold">{{ event.contact_description }}</span>
                <div class="flex justify-between">
                    <span class="text-uppercase text-xs">#{{ event.code }}</span>
                    <span class="text-uppercase text-xs">{{ event.insurance }}</span>
                </div>
                <span class="text-uppercase text-xs">{{ event.age }}</span>
                <span class="flex flex-col text-blue-600" v-for="(diag, index) in event.diagnosis" :key="diag">
                    <small class="text-uppercase text-xs">D{{ index + 1 }}: {{ diag }}</small>
                </span>
                <span class="text-uppercase text-xs flex items-center"><q-icon class="mr-1" name="sym_o_badge"
                        size="16"></q-icon>{{ event.ident_no }}</span>
                <span class="text-uppercase text-xs flex items-center"><q-icon class="mr-1" name="sym_o_phone"
                        size="16"></q-icon>{{ event.phone }}</span>
                <span v-if="event.email" class="text-uppercase line-clamp-1 text-xs flex items-center"><q-icon
                        class="mr-1" name="sym_o_mail" size="16"></q-icon>{{ event.email }}</span>
                <q-btn class="button bg-sky-200 text-md w-full font-bold mt-2" text-color="font" @click="addInsured"
                    label="Agregar asegurado" />
            </div>
        </div>

    </div>
</template>

<script setup>
import { computed, ref, reactive, inject } from 'vue';
const props = defineProps({ width: String, event: Object })
import { useTable } from "src/use/table"
import NoData from 'src/components/table/NoData.vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
const $q = useQuasar()
const $api = inject("$api")
const router = useRouter()
const tableRef = ref()

const state = reactive({
    items: [],
    total: 0,
    loading: true,
    dialogWrite: false,
    dialogRead: false,
    selectedId: 0,
    selected: [],
    search: props.event.contact_description,
    search_key: 'orlike:fullname',
    pagination: {
        sortBy: 'created',
        descending: true,
        page: 1,
        rowsPerPage: 5,
    },
    url: 'insured',
    query: {
        order: {
            created: 'DESC'
        },
        groupBy: ['t_insured.id'],
        where: {
            c_status: 4,
            'orlike:fullname': props.event.contact_description
        }
    },
    rows: []
})

const { onRequest, getSelectedString } = useTable(state, tableRef)

const style = computed(() => {
    return {
        width: props.width
    }
})

async function addInsured() {
    const item = {
        description: props.event.contact_description,
        birthdate: props.event.birthdate,
        phone: props.event.phone,
        ident_no: props.event.ident_no,
        insurance_id: props.event.insurance_id,
        $sex_id: props.event.$sex_id,
    }
    if (props.event.insurance_id) {
        const insurance = $api.get(`insurance/${props.event.insurance_id}`)
        item.insurance = insurance.description
    }

    const response = await $api.post('insured', item)
    $q.notify({
        type: 'success',
        message: 'Asegurado Agregado'
    })

    console.log(props.event.id);
    console.log(response);

    $api.put(`event/${props.event.id}`, {
        ...props.event,
        contact_id: response.id
    })
    router.push(`/asegurado/consultar/${response.id}`)
}

</script>