<template>
  <q-layout :class="'main'" view="lHh Lpr lFf">

    <q-header v-if="$isDesktop" dense class="text-black bg-primary">
      <q-toolbar class="flex justify-between transparent min-h-[20px]">
        <div class="flex">
          <q-btn class="text-white" flat dense round icon="menu" aria-label="Menu" @click="openDrawer" />
          <div class="gap-1 font-bold w-[200px] line-clamp-1 flex text-white items-center leading-none ml-2">
            <span class="flex flex-col font-bold line-clamp-1 cursor-pointer" @click="state.userDialog = true">
              <span class="text-xs">{{ $me.description }}</span>
              <span class="text-xxs">{{ $me.roles_format }}</span>
            </span>
          </div>
        </div>
        <div class="flex flex-nowrap items-center text-white flex-1 gap-4 justify-end min-w-[150px]">
          <div class="flex items-center cursor-pointer hover:text-sky-200" @click="userStore.logOut()">
            <span class="font-bold line-clamp-1 mr-2">Salir</span>
            <q-icon name="fa-duotone fa-solid fa-right-from-bracket"></q-icon>
          </div>
        </div>
      </q-toolbar>

      <div class="flex justify-between flex-nowrap text-font px-2 py-2 bg-white">
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

    <q-drawer v-model="state.leftDrawerOpen" show-if-above bordered :width="state.drawerWidth"
      @mouseenter="miniState = false" @mouseleave="miniState = true" transition-show="slide-right"
      transition-hide="slide-left" class="border-[#ddd]">
      <div class="flex flex-col h-full">
        <q-img v-if="state.miniState" src="~assets/logo.png" spinner-color="white" :width="80" />
        <q-img v-else src="~assets/logoText.png" spinner-color="white" :width="180" />

        <div class="overflow-auto flex-1">
          <div v-for="(row, i) in state.navLinks" :key="i" class="border-b border-default text-xs">
            <div v-if="row.children?.length">
              <div class=" flex justify-between items-center cursor-pointer"
                :class="isParentActive(row.children) ? 'border-primary border-r-4 bg-primary/10 text-primary font-bold' : 'hover:border-primary hover:border-r-4 text-primary'"
                @click="toggleDropdown(row.title)">
                <div class="relative flex items-center px-2 py-2"
                  :class="state.miniState ? 'justify-center w-full h-[42px] bg-default' : ''">
                  <q-icon v-if="!state.miniState" class="mr-2" size="xs" :name="row.icon" />
                  <q-icon v-else size="xs" :name="row.icon" />
                  <div v-if="!state.miniState">{{ $t(row.title) }}</div>
                  <div v-if="state.miniState"
                    class="absolute bottom-0 right-0 w-0 h-0 border-l-[10px] border-b-[10px] border-l-transparent border-b-secondary">
                  </div>
                </div>
                <q-icon class="pr-1" v-if="!state.miniState" :name="state.dropdownOpen[row.title] ? 'expand_less' : 'expand_more'"
                  size="sm" />
              </div>

              <q-slide-transition>
                <div v-if="state.dropdownOpen[row.title]">
                  <router-link v-for="(child, j) in row.children" :key="j" :to="child.link" v-slot="{ isActive }">
                    <div class="pl-5 py-2 flex items-center cursor-pointer border-b border-default text-xs" :class="isActive
                      ? 'border-r-primary border-r-4  text-primary font-bold'
                      : 'text-gray-700 hover:text-primary'">
                      <q-icon v-if="state.miniState" class="my-1" size="sm" :name="child.icon" />
                      <q-icon v-else class="mr-2" size="xs" :name="child.icon" />
                      <div v-if="!state.miniState">{{ $t(child.title) }}</div>
                    </div>
                  </router-link>
                </div>
              </q-slide-transition>
            </div>

            <router-link v-else :to="row.link" v-slot="{ isActive }">
              <div class="px-2 flex items-center py-2 cursor-pointer" :class="funNav(isActive)">
                <q-icon v-if="state.miniState" class="my-1" size="sm" :name="row.icon" />
                <q-icon v-else class="mr-2" size="xs" :name="row.icon" />
                <div v-if="!state.miniState">{{ $t(row.title) }}</div>
              </div>
            </router-link>
          </div>
        </div>

      </div>
    </q-drawer>

    <q-dialog class="q-pa-none left-0" v-model="state.eventDialogCreate" :transition-duration="0" full-height maximized
      position="right">
      <EventWrite isDrawer @close="state.eventDialogCreate = false" />
    </q-dialog>

    <q-page-container class="fit">
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
        <template v-for="(row, i) in state.navLinks" :key="i">
          <router-link :to="row.link" activeClass="text-primary" v-slot="{ isActive }">
            <div
              class="flex flex-col bg-default h-[48px] items-center justify-center font-bold text-md leading-none cursor-pointer">
              <q-icon :name="row.icon" size="16px" class="mr-1" :class="isActive && 'text-primary'" />
              <span class="mt-1 text-xs">{{ $t(row.title) }}</span>
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
import { computed, inject, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user';
const userStore = useUserStore();
const router = useRouter()
import InsuredWrite from 'src/pages/insured/components/InsuredWrite.vue';
import EventWrite from 'src/pages/event/components/EventWrite.vue';
import ServiceWrite from 'src/pages/service/components/ServiceWrite.vue';
import DoctorWrite from 'src/pages/doctor/components/DoctorWrite.vue';
import PolicyWrite from 'src/pages/policy/components/PolicyWrite.vue';
import UserWrite from 'src/pages/user/components/UserWrite.vue';
import InsuranceWrite from 'src/pages/insurance/components/InsuranceWrite.vue';
import ProviderWrite from 'src/pages/provider/components/ProviderWrite.vue';
import CustomerWrite from 'src/pages/customer/components/CustomerWrite.vue';
import ContactWrite from 'src/pages/contact/components/ContactWrite.vue';
import TaskWrite from 'src/pages/task/components/TaskWrite.vue';
import { useUpdateStore } from "src/stores/update";
import { useConstants } from "src/use/constants";
import { useQuasar } from 'quasar';
const updateStore = useUpdateStore()
const $q = useQuasar()
const $me = inject("$me")
const $local = inject("$local")
const $api = inject("$api")
const $path = inject("$path")
const $isDesktop = inject("$isDesktop")
const { APP_SETTINGS_LOCAL } = useConstants()

watch(() => userStore.me, (curr) => {
  if (!curr) {
    router.push({ name: 'login_index' })
  }
})

const state = reactive({
  navLinks: [],
  pendingTasks: [],
  leftDrawerOpen: $isDesktop ? true : false,
  dropdownOpen: {},
  drawerWidth: 200,
  miniState: false,
  footer: {
    open: false,
    text: '',
    version: 1
  },
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

function openDrawer() {
  state.miniState = !state.miniState
  if (state.miniState) {
    state.drawerWidth = 60
  } else {
    state.drawerWidth = 180
  }
  
  $local.set(APP_SETTINGS_LOCAL, (data) => {
    if (!data.menu) data.menu = {};
    data.menu.miniState = state.miniState;
    data.menu.drawerWidth = state.miniState ? 60: 180
  })
}

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

function funNav(isActive) {
  if (state.miniState) {
    if (isActive) {
      return 'justify-center border-primary border-r-4 bg-primary/10 text-primary font-bold'
    } else {
      return 'justify-center hover:border-primary hover:border-r-4 text-primary'
    }
  } else {

    if (isActive) {
      return 'border-primary border-r-4 bg-primary/10 text-primary font-bold'
    } else {
      return 'hover:border-primary hover:border-r-4 text-primary'
    }
  }
}

function toggleDropdown(title) {
  state.dropdownOpen[title] = !state.dropdownOpen[title];
}

function isParentActive(children) {
  return children.some(child => router.currentRoute.value.path.startsWith(child.link));
}

function useNavLinks(router) {
  const routes = router.getRoutes();

  const links = [];

  for (const route of routes) {
    if (route.meta?.nav === 1) {

      const data = {
        title: route.meta.title,
        icon: route.meta.icon,
        link: route.path,
        children: []
      }

      if (route.meta?.children) {
        const _routes = routes.filter(i => route.meta?.children.includes(i.name))
        for (let j = 0; j < _routes.length; j++) {
          const _route = _routes[j];
          data.children.push({
            title: _route.meta?.title,
            icon: _route.meta.icon,
            link: `${_route.path}`,
          })
        }
      }
      links.push(data);
    }
  }

  return links;
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

function getMenuSettings() {
  const menuSetting = $local.get(APP_SETTINGS_LOCAL) || {}

  if (menuSetting.menu) {
    const { miniState, drawerWidth } = menuSetting.menu
    state.miniState = miniState
    state.drawerWidth = drawerWidth
  }
}

onMounted(() => {
  getMenuSettings()
  getTaskPending()
  state.navLinks = useNavLinks(router)

  state.navLinks.forEach((item) => {
    if (item.children?.length && isParentActive(item.children)) {
      state.dropdownOpen[item.title] = true
    }
  })

})


watch(() => updateStore.table.t_event, (data) => {
  getTodayEvents()
}, { deep: true })
</script>

<style lang="scss">
.main.big {

  .text-primary,
  .text-md,
  .text-sm {
    font-size: 16px;
  }

  .text-xs {
    font-size: 14px;
  }

  th,
  td,
  input,
  .q-field__label,
  .q-checkbox__label {
    font-size: 12px !important;
  }

  .text-xxs,
  button,
  .q-badge {
    font-size: 11.5px !important;
  }
}

.main.medium {

  .text-primary,
  .text-md,
  .text-sm {
    font-size: 14px;
  }

  .text-xs {
    font-size: 12px;
  }

  th,
  td,
  input,
  .q-field__label,
  .q-checkbox__label {
    font-size: 11px !important;
  }

  .text-xxs,
  button,
  .q-badge {
    font-size: 10.5px !important;
  }
}

.main.small {

  .text-primary,
  .text-md,
  .text-sm {
    font-size: 13px;
  }

  .text-xs {
    font-size: 11px;
  }

  th,
  td,
  input,
  .q-field__label,
  .q-checkbox__label {
    font-size: 10px !important;
  }

  .text-xxs,
  button,
  .q-badge {
    font-size: 9.5px !important;
  }
}
</style>
