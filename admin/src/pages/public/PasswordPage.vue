<template>
  <div class="sm:min-w-[500px] h-screen">
    <q-form class="w-full h-full sm:px-8 px-4 py-6 bg-white shadow" @submit="onSubmit" autocomplete="off">
      <div class="text-center mb-4">
        <!-- <q-img class="mb-4 max-h-[128px] max-w-[128px] object-contain" src="~assets/logo.png" spinner-color="white" /> -->
        <!-- <div class="text-4xl font-bold mb-16 text-primary">MEDTRAVEL</div> -->
        <q-img class="mb-4 max-h-[128px] max-w-[128px] object-contain" src="~assets/logo.png" spinner-color="white" />
        <hr>
        <div class="text-sky-900 text-2xl font-bold mt-10">Cambiar Contraseña</div>
        <div class="text-sky-800">Favor digitar tu nueva contraseña en los campos</div>
      </div>
      <q-input dense outlined class="mb-3" v-model="state.item.password" type="password" label="Contraseña"
        :rules="[requiredInput]" hide-bottom-space></q-input>
      <q-input dense outlined v-model="state.item.confirmPassword" type="password" label="Confirmar Contraseña"
        :rules="[requiredInput]" hide-bottom-space></q-input>
      <q-btn class="bg-gradient-to-r from-primary to-primaryLight  rounded w-full font-bold mt-2 text-white" flat
        rounded size="md" no-caps type="submit" label="ACCEDER">
      </q-btn>
      <div class="subtitle mt-2">Requisitos de la contraseña:</div>
      <ul>
        <li>Al menos debe tener 6 caracteres</li>
        <li>Al menos una letra mayúscula</li>
        <li>Al menos un símbolo (por ejemplo: !@#$%^&*() etc.)</li>
        <li>Al menos un número</li>
      </ul>
      <q-badge class="bg-primary p-2" v-if="!isValidPassword" align="top">La contraseña es invalida</q-badge>
      <q-badge class="bg-primary p-2" v-if="!samePassword" align="top">La contraseña y las contraseña de confirmación
        deben ser la
        misma</q-badge>
    </q-form>
  </div>
</template>

<script setup>
import { requiredInput } from 'src/helpers/validation';
import { setToken } from 'src/helpers/auth';
import { reactive, inject, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
const $q = useQuasar()

const router = useRouter()
const route = useRoute()
const $api = inject('$api');
const state = reactive({
  item: {
    password: '',
    confirmPassword: ''
  }
})

async function onSubmit() {
  const response = await $api.post('user/change-password', {
    ...state.item,
    token: route.query.token,
  });

  $q.notify({
    type: 'success',
    message: response.msg
  })

  setToken(response.token);
  router.push({ path: '/' });
}

const isValidPassword = computed(() => {
  if (!state.item.password || !state.item.confirmPassword) {
    return true
  }
  const hasUppercase = /[A-Z]/.test(state.item.password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/~`]/.test(state.item.password);
  const hasNumber = /[0-9]/.test(state.item.password);
  const hasLength = state.item.password.length >= 6;

  return hasUppercase && hasSymbol && hasNumber && hasLength;
})

const samePassword = computed(() => {
  if (!state.item.password || !state.item.confirmPassword) {
    return true
  }
  return state.item.password === state.item.confirmPassword
})

</script>
