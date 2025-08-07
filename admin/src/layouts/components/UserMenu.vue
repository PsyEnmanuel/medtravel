<template>
    <q-btn class="px-0" flat>
        <q-avatar size="32px">
            <img src="https://cdn.quasar.dev/img/avatar4.jpg">
        </q-avatar>

        <q-menu>
            <div class="row no-wrap q-pa-sm">
                <div class="column q-pr-md" style="min-width: 200px">
                    <div class="text-h6 q-mb-sm">Perfil</div>

                    <q-toggle v-model="state.mobileData" label="Use Mobile Data" />
                    <q-toggle v-model="state.bluetooth" label="Bluetooth" />

                    <q-separator class="q-my-sm" />
                    <q-btn flat icon="settings" label="Configuración" :to="path.setting" />
                </div>

                <q-separator vertical inset class="q-mx-md" />

                <div class="column items-center">
                    <q-avatar size="72px">
                        <img src="https://cdn.quasar.dev/img/avatar4.jpg">
                    </q-avatar>

                    <div class="text-subtitle1 q-mt-sm q-mb-xs">{{ userStore.me.description }}</div>

                    <q-btn color="primary" label="Cerrar Sesión" @click="userStore.logOut" push size="sm"
                        v-close-popup />
                </div>
            </div>
        </q-menu>
    </q-btn>
</template>

<script setup>
import path from "src/data/path"
import { useUserStore } from 'src/stores/user'
import { reactive, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

watch(() => userStore.me, (curr) => {
    if (!curr) {
        router.push({ name: 'login_index' })
    }
})

const state = reactive({
    mobileData: false,
    bluetooth: false
})
</script>
