<template>
  <div class="sm:min-w-[500px] h-screen">

    <q-form class="w-full h-full sm:px-8 px-4 py-6 bg-white shadow" @submit="onSubmit" autocomplete="off">

      <div class="text-center mb-4">
        <q-img class="mb-4 max-h-[128px] max-w-[128px] object-contain" src="~assets/logo.png" spinner-color="white" />
        <!-- <div class="text-4xl font-bold mb-16 text-primary">MEDTRAVEL</div> -->
        <hr>
        <div class="text-primary text-2xl font-bold mt-10">Iniciar Sesión</div>
        <div class="text-primaryLight">Favor de iniciar sesión con tu <b>correo electrónico</b> y <b>contraseña</b>
        </div>
      </div>

      <q-input ref="input" name="email" dense outlined v-model="state.item.email" label="Correo Electrónico"
        :rules="[requiredInput]" hide-bottom-space></q-input>

      <q-input input-class="password-obscure" dense outlined class="mt-3" v-model="state.item.password"
        label="Contraseña" type="password" :rules="[requiredInput]" hide-bottom-space autocomplete="new-password"
        autocorrect="off" spellcheck="false">
      </q-input>



      <q-btn class="bg-gradient-to-r from-primary to-primaryLight  rounded w-full font-bold mt-2 text-white" flat
        rounded size="md" no-caps type="submit" label="ACCEDER">
      </q-btn>

      <div class="text-sky-800 mt-2">Recuperar Contraseña
        <span class="text-dark font-bold cursor-pointer" style="text-decoration: none"
          @click="state.dialog = true">Click
          aquí</span>
      </div>

    </q-form>

    <q-dialog v-model="state.dialog">
      <q-card class="shadow pt-4 px-6 pb-4 flex-col w-[400px]">
        <q-form @submit="recoverPassword">
          <div class="font-bold text-lg text-font">Recuperar Contraseña</div>
          <q-input dense outlined class="mt-3" v-model="state.forgotPassword.email" type="email"
            label="Correo Electrónico" :rules="[requiredInput]" hide-bottom-space></q-input>
          <div class="flex justify-end pt-4">
            <q-btn class="button mr-2" flat label="Cancelar" @click="state.dialog = false" />
            <q-btn class="button-press bg-primary text-white w-[120px]" flat label="Enviar" type="submit" />
          </div>
        </q-form>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { requiredInput } from 'src/helpers/validation';
import { useQuasar } from 'quasar';
import { setToken } from 'src/helpers/auth';
import { reactive, inject, ref } from 'vue';
import { useRouter } from 'vue-router';
const $q = useQuasar()

const router = useRouter()
const $api = inject('$api');

const input = ref('asdasd')

const state = reactive({
  dialog: false,
  forgotPassword: {
    email: null
  },

  item: {
    email: '',
    password: ''
  }

})

async function onSubmit() {
  try {
    let { token, change_password, reset_password_token } = await $api.post('user/login', state.item);

    if (change_password) {
      router.push({
        path: `/cambiar-contrasena`,
        query: {
          token: reset_password_token,
          where: {
            c_status: 4
          }
        },
      });
    } else {
      setToken(token);
      router.push({ path: '/' });
    }
  } catch (error) {
    console.log(error);
  }
}

async function recoverPassword() {
  const response = await $api.post('user/forgot-password',
    state.forgotPassword
  )
  state.dialog = false
  $q.notify({
    type: 'success',
    message: response.msg
  })
}

</script>

<style>
.password-obscure {
  font-family: 'monospace';
  /* Optional: for consistent width dots */
  -webkit-text-security: disc;
  /* For Webkit browsers */
  text-security: disc;
  /* For other browsers */
}
</style>
