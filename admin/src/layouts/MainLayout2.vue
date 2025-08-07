<template>
  <q-layout view="lHh Lpr lFr" class="bg-primary">
    <q-header v-if="$isDesktop" class="transparent">
      <q-toolbar
        class="bg-primary text-white px-5 min-h-full flex flex-nowrap items-center justify-between gap-2 leading-none">
        <div class="flex flex-1 flex-nowrap py-2">
          <router-link to="/">
            <q-img class="mr-2" src="~assets/logoWhite.png" spinner-color="white" width="32px" />
          </router-link>
          <div class="gap-1 font-bold w-[200px] line-clamp-1 flex">
            <span class="flex flex-col font-bold line-clamp-1 cursor-pointer" @click="state.userDialog = true">
              <span>{{ $me.description }}</span>
              <span class="text-xxs">{{ $me.roles_format }}</span>
            </span>
          </div>
        </div>

        <div class="flex justify-center gap-x-5 mx-auto">
          <template v-for="m in state.menu" :key="m.label">
            <router-link :to="m.path" activeClass="text-sky-200">
              <div
                class="flex flex-nowrap items-center font-bold text-md leading-none cursor-pointer hover:text-sky-200 py-1">
                <q-icon :name="m.icon" size="16px" class="mr-1" />
                <span class="pt-0.5">{{ m.label }}</span>
              </div>
            </router-link>
          </template>
        </div>

        <div class="flex flex-nowrap items-center flex-1 gap-4 justify-end min-w-[150px]">
          <div class="flex items-center cursor-pointer hover:text-sky-200" @click="userStore.logOut()">
            <span class="font-bold line-clamp-1 mr-2">Salir</span>
            <q-icon name="fa-duotone fa-solid fa-right-from-bracket"></q-icon>
          </div>
        </div>

      </q-toolbar>

      <div class="flex justify-between flex-nowrap text-font px-4 py-2 bg-white">
        <div class="absolute bottom-13 right-14 opacity-20 text-xxs">Versión: {{ $me.version }}</div>
        <div class="flex flex-nowrap gap-5 w-full mx-auto">
          <template v-for="dialog in state.dialogs" :key="dialog.value">
            <div v-if="dialog.visible" flat
              class="flex items-center font-bold text-md leading-none cursor-pointer pb-1 hover:shadow-bottom"
              @click="dialog.path ? $router.push(dialog.path) : state[dialog.value] = true">
              <q-icon name="fa-duotone fa-solid fa-plus" size="16px" class="mr-1" />
              <span class="pt-0.5">{{ dialog.label }}</span>
            </div>
          </template>
        </div>
        <div>
          <q-btn dense color="default" text-color="primary" flat round icon="fa-duotone fa-solid fa-bell"
            class="text-xs q-ml-md">
            <q-badge color="primary" floating>{{ state.pendingTasks.length }}</q-badge>
            <q-popup-proxy class="w-[300px]">
              <div class="flex border-l-4 hover:border-secondary cursor-pointer border-b"
                v-for="row in state.pendingTasks" :key="row.id"
                @click="state.selectedId = row.id; state.taskDialogWrite = true">
                <div class="px-2">
                  <div class="text-xs">{{ row.description }}</div>
                  <div class="line-clamp-2 text-xxs">{{ row.detail }}</div>
                  <q-badge v-if="row.task_section" class="bg-default text-black text-xxs">{{ row.task_section
                  }}</q-badge>
                </div>
                <hr class="my-1">
              </div>
            </q-popup-proxy>
          </q-btn>


        </div>
      </div>
    </q-header>

    <q-page-container class="pb-64 bg-white">
      <router-view />
    </q-page-container>

    <q-footer v-if="!$isDesktop" class="bg-primary text-black h-[48px]">
      <div class="grid grid-cols-4 gap-0.5 bg-white">
        <div
          class="flex flex-col bg-default h-[48px] items-center justify-center font-bold text-md leading-none cursor-pointer"
          @click="state.menuDialog = true">
          <q-icon name="fa-duotone fa-solid fa-bars" size="24px" class="mb-1" />
        </div>
        <div
          class="flex flex-col bg-default h-[48px] items-center justify-center font-bold text-md leading-none cursor-pointer"
          @click="state.addDialog = true">
          <q-icon name="fa-duotone fa-solid fa-grid-2-plus" size="24px" class="mb-1" />
        </div>
        <div
          class="flex flex-col bg-default h-[48px] items-center justify-center font-bold text-md leading-none cursor-pointer"
          @click="state.userDialog = true">
          <q-icon name="fa-duotone fa-solid fa-user-unlock" size="24px" class="mb-1" />
        </div>
        <div
          class="flex flex-col bg-default h-[48px] items-center justify-center font-bold text-md leading-none cursor-pointer"
          @click="userStore.logOut()">
          <q-icon name="fa-duotone fa-solid fa-right-from-bracket" size="24px" class="mb-1" />
        </div>
      </div>
    </q-footer>

    <q-footer bordered class="bg-yellow-100 p-2 print:hidden" v-model="state.footer.open">
      <div class="flex items-center text-sm text-font">
        <div class="flex items-center">
          <q-icon name="sym_o_warning" class="pr-2" size="16px"></q-icon> Atención: Hay una nueva versión: {{
            state.footer.version }}
        </div>
        <q-btn class="button bg-warning-light ml-2" size="sm" flat @click="onReload">REFRESCAR APLICACION</q-btn>
        <q-btn class="button bg-danger-light ml-2" size="sm" flat @click="state.footer.open = false">CERRAR</q-btn>
      </div>
    </q-footer>

    <q-dialog v-model="state.menuDialog" position="bottom">
      <div class="grid grid-cols-3 gap-0.5 bg-white w-full">
        <template v-for="m in state.menu" :key="m.label">
          <router-link :to="m.path" activeClass="text-primary" v-slot="{ isActive }">
            <div
              class="flex flex-col bg-default h-[48px] items-center justify-center font-bold text-md leading-none cursor-pointer">
              <q-icon :name="m.icon" size="16px" class="mr-1" :class="isActive && 'text-primary'" />
              <span class="mt-1 text-xs">{{ m.label }}</span>
            </div>
          </router-link>
        </template>
      </div>
    </q-dialog>

    <q-dialog v-model="state.addDialog" position="bottom">
      <div class="grid grid-cols-3 gap-0.5 bg-white border-b w-full">
        <template v-for="dialog in state.dialogs" :key="dialog.value">
          <div v-if="dialog.visible" flat
            class="flex pl-4 items-center font-bold bg-default text-md h-[48px] leading-none cursor-pointer"
            @click="dialog.path ? $router.push(dialog.path) : state[dialog.value] = true">
            <q-icon name="fa-duotone fa-solid fa-plus" size="16px" class="mr-1" />
            <span class="mt-1 text-xxs">{{ dialog.label }}</span>
          </div>
        </template>
      </div>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.insuredDialog" :position="$isDesktop ? 'right' : 'standard'"
      full-height maximized :transition-duration="$isDesktop ? 100 : 0">
      <q-card>
        <InsuredWrite isDrawer @close="state.insuredDialog = false" :width="$isDesktop ? '1000px' : '100%'" />
      </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.insuranceDialog" :position="$isDesktop ? 'right' : 'standard'"
      full-height maximized :transition-duration="$isDesktop ? 100 : 0">
      <q-card>
        <InsuranceWrite isDrawer @close="state.insuranceDialog = false" :width="$isDesktop ? '1000px' : '100%'" />
      </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.eventDialog" :position="$isDesktop ? 'right' : 'standard'"
      full-height maximized :transition-duration="$isDesktop ? 100 : 0">
      <q-card>
        <EventWrite isDrawer @close="state.eventDialog = false" :width="$isDesktop ? '100%' : '100%'" />
      </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.providerDialog" :position="$isDesktop ? 'right' : 'standard'"
      full-height maximized :transition-duration="$isDesktop ? 100 : 0">
      <q-card>
        <ProviderWrite isDrawer @close="state.providerDialog = false" :width="$isDesktop ? '1000px' : '100%'" />
      </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.doctorDialog" :position="$isDesktop ? 'right' : 'standard'"
      full-height maximized :transition-duration="$isDesktop ? 100 : 0">
      <q-card>
        <DoctorWrite isDrawer @close="state.doctorDialog = false" :width="$isDesktop ? '1000px' : '100%'" />
      </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.serviceDialog" :position="$isDesktop ? 'right' : 'standard'"
      full-height maximized :transition-duration="$isDesktop ? 100 : 0">
      <q-card>
        <ServiceWrite isDrawer @close="state.serviceDialog = false" :width="$isDesktop ? '400px' : '100%'" />
      </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.userDialog" :position="$isDesktop ? 'right' : 'standard'"
      full-height maximized :transition-duration="$isDesktop ? 100 : 0">
      <q-card>
        <UserWrite isDrawer isEdit :id="$me.id" @close="state.userDialog = false"
          :width="$isDesktop ? '400px' : '100%'" />
      </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.policyDialog" :position="$isDesktop ? 'right' : 'standard'"
      full-height maximized :transition-duration="$isDesktop ? 100 : 0">
      <q-card>
        <PolicyWrite isDrawer @close="state.policyDialog = false" :width="$isDesktop ? '400px' : '100%'" />
      </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.customerDialog" :position="$isDesktop ? 'right' : 'standard'"
      full-height maximized :transition-duration="$isDesktop ? 100 : 0">
      <q-card>
        <CustomerWrite isDrawer @close="state.customerDialog = false" :width="$isDesktop ? '1000px' : '100%'" />
      </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.contactDialog" :position="$isDesktop ? 'right' : 'standard'"
      full-height maximized :transition-duration="$isDesktop ? 100 : 0">
      <q-card>
        <ContactWrite isDrawer @close="state.contactDialog = false" :width="$isDesktop ? '1000px' : '100%'" />
      </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none left-0" v-model="state.taskDialog" :position="$isDesktop ? 'right' : 'standard'"
      full-height maximized :transition-duration="$isDesktop ? 100 : 0">
      <q-card>
        <TaskWrite isDrawer @close="state.taskDialog = false" :width="$isDesktop ? '1000px' : '100%'" />
      </q-card>
    </q-dialog>

    <q-dialog class="q-pa-none" v-model="state.taskDialogWrite" :position="$isDesktop ? 'right' : 'standard'"
      full-height :full-width="$isDesktop" maximized :transition-duration="100">
      <q-card>
        <TaskWrite @close="state.taskDialogWrite = false" isDrawer :id="state.selectedId" isEdit
          :width="$isDesktop ? '1000px' : '100%'" />
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script setup>
import { inject, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user';
const userStore = useUserStore();
import { useRouter } from 'vue-router';
import InsuredWrite from 'src/pages/insured/components/InsuredWrite.vue';
import EventWrite from 'src/pages/event/components/EventWrite.vue';
import ServiceWrite from 'src/pages/service/components/ServiceWrite.vue';
import DoctorWrite from 'src/pages/doctor/components/DoctorWrite.vue';
import PolicyWrite from 'src/pages/policy/components/PolicyWrite.vue';
import UserWrite from 'src/pages/user/components/UserWrite.vue';
import { useUpdateStore } from 'src/stores/update';
import InsuranceWrite from 'src/pages/insurance/components/InsuranceWrite.vue';
import ProviderWrite from 'src/pages/provider/components/ProviderWrite.vue';
import CustomerWrite from 'src/pages/customer/components/CustomerWrite.vue';
import ContactWrite from 'src/pages/contact/components/ContactWrite.vue';
import TaskWrite from 'src/pages/task/components/TaskWrite.vue';
const router = useRouter()
const $q = useQuasar()
const $me = inject("$me")
const $api = inject("$api")
const $path = inject("$path")
console.log($me);
defineOptions({
  name: 'MainLayout'
})

watch(() => userStore.me, (curr) => {
  if (!curr) {
    router.push({ name: 'login_index' })
  }
})

function reloadPage() {
  location.reload()
}

const state = reactive({
  selectedId: null,
  pendingTasks: [],
  taskDialogWrite: false,
  userDialog: false,
  menuDialog: false,
  addDialog: false,
  leftDrawer: false,
  sideBar: false,
  search: null,
  footer: {
    open: false,
    text: '',
    version: 1
  },
  menu: [
    {
      label: 'Inicio',
      icon: 'fa-duotone fa-solid fa-objects-column',
      name: 'home_index',
      path: $path.home,
    },
    {
      label: 'Coordinaciones',
      icon: 'fa-duotone fa-solid fa-calendar-lines',
      name: 'event_index',
      path: $path.event,
    },
    {
      label: 'Itinerarios',
      icon: 'fa-duotone fa-solid fa-calendar-days',
      name: 'itinerary_index',
      path: $path.itinerary,
    },
    {
      label: 'Asegurados',
      icon: 'fa-duotone fa-solid fa-hospital-user',
      name: 'insured_index',
      path: $path.insured,
    },
    {
      label: 'Pólizas',
      icon: 'fa-duotone fa-solid fa-heart-circle-plus',
      name: 'policy_index',
      path: $path.policy,
    },
    {
      label: 'Aseguradoras',
      icon: 'fa-duotone fa-solid fa-folder-medical',
      name: 'insurance_index',
      path: $path.insurance,
    },
    {
      label: 'Proveedores',
      icon: 'fa-duotone fa-solid fa-hospitals',
      name: 'provider_index',
      path: $path.provider,
      visible: $me.unixroles & 31 ? 1 : 0,
    },
    {
      label: 'Médicos',
      icon: 'fa-duotone fa-solid fa-user-doctor',
      name: 'doctor_index',
      path: $path.doctor,
    },
    {
      label: 'contactos',
      icon: 'fa-duotone fa-solid fa-address-book',
      path: $path.contact,
    },
    {
      label: 'Conciliaciones',
      icon: 'fa-duotone fa-solid fa-books',
      name: 'conciliation_index',
      path: $path.conciliation,
    },
    {
      label: 'Clientes',
      icon: 'fa-duotone fa-solid fa-address-book',
      name: 'customer_index',
      path: $path.customer,
    },
    {
      label: 'Corredores',
      icon: 'fa-duotone fa-solid fa-handshake',
      name: 'broker_index',
      path: $path.broker,
    },
    {
      label: 'Hospedajes',
      icon: 'fa-duotone fa-solid fa-hotel',
      name: 'lodging_index',
      path: `${$path.lodging}`,
    },
    {
      label: 'Archivos',
      icon: 'fa-duotone fa-solid fa-list-check',
      name: 'setting_index',
      path: `${$path.setting}/${$path.setting_file}`,
    },
    {
      label: 'Gráficos',
      icon: 'fa-duotone fa-solid fa-chart-pie-simple',
      path: $me.unixroles & 3 ? `${$path.chart}/${$path.chart_event}` : `${$path.chart}`,
      name: 'chart_index',
    },
    {
      label: 'Solicitudes',
      icon: 'fa-duotone fa-solid fa-list-check',
      name: 'task_index',
      path: `${$path.task}`,
    },
    {
      label: 'Ajustes',
      icon: 'fa-duotone fa-solid fa-gears',
      path: `${$path.setting}/${$path.setting_general}`,
      name: 'setting_index',
    },
  ],
  dialogs: [
    {
      label: 'Asegurado',
      value: 'insuredDialog',
      visible: $me.unixroles & 31 ? 1 : 0,
    },
    {
      label: 'Póliza',
      value: 'policyDialog',
      visible: $me.unixroles & 31 ? 1 : 0,
    },
    {
      label: 'Coordinación',
      value: 'eventDialog',
      visible: $me.unixroles & 31 ? 1 : 0,
    },
    {
      label: 'Conciliaciones',
      value: '',
      path: `${$path.conciliation}/${$path.conciliation_create}`,
      visible: $me.unixroles & 7 ? 1 : 0,
    },
    {
      label: 'Proveedor',
      value: 'providerDialog',
      visible: $me.unixroles & 31 ? 1 : 0,
    },
    {
      label: 'Médico',
      value: 'doctorDialog',
      visible: $me.unixroles & 31 ? 1 : 0,
    },
    {
      label: 'Aseguradora',
      value: 'insuranceDialog',
      visible: $me.unixroles & 7 ? 1 : 0,
    },
    {
      label: 'Clientes',
      value: 'customerDialog',
      visible: $me.unixroles & 31 ? 1 : 0,
    },
    {
      label: 'Contacto',
      value: 'contactDialog',
      visible: $me.unixroles & 31 ? 1 : 0,
    },
    // {
    //   label: 'Solicitud',
    //   value: 'taskDialog',
    //   visible: $me.unixroles & 3 ? 1 : 0,
    // },
  ]

})

const updateStore = useUpdateStore()
watch(() => updateStore.table.t_printed, (data) => {
  $q.notify({
    type: 'warning',
    message: 'Documento impreso'
  })
}, { deep: true })

watch(() => updateStore.table.t_version, (data) => {
  if ($me.version === data.version) {
    return;
  }
  state.footer.version = data.version
  state.footer.text = `Existe una versión ${data.version} más actualizada, click en el botón continuar para actualizar la aplicación`
  state.footer.open = true
}, { deep: true })

function onReload() {
  location.reload()
}

async function getTaskPending() {
  state.pendingTasks = await $api.get(`task`, {
    params: {
      groupBy: ['t_task.id'],
      where: {
        c_status: 4,
        user_id: $me.id,
        'in:$task_state_id': [329, 330]
      },
      returnItems: true
    }
  })
}

onMounted(() => {
  getTaskPending()
  state.menu = state.menu.filter(i => {
    if(i.name) {
      return $me.menu.includes(i.name.toUpperCase())
    } else {
      return false;
    }
  })
})

</script>
