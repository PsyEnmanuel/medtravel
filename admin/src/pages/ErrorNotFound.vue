<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        404
      </div>

      <div class="text-h2" style="opacity:.4">
        No tienes acceso a esta vista.
      </div>

      <q-btn @click="goToStart" class="q-mt-xl" unelevated label="Ir a Inicio" no-caps />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter()

defineOptions({
  name: 'ErrorNotFound'
});

function goToStart() {
  router.push('/')
}
</script>