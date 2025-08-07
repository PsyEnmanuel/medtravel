<template>
  <q-layout view="lHh Lpr lFf">
    <div class="flex flex-nowrap h-screen">
      <div class="sm:w-[100px] w-[30px] bg-gradient-to-t from-primary to-primaryLight flex items-center justify-center">
        <div class="block rotate-270 text-xl sm:text-6xl whitespace-nowrap font-extrabold text-default">MEDTRAVEL</div>
      </div>
      <q-page-container>
        <router-view />
      </q-page-container>
      <div v-if="$isDesktop" class="w-full h-full">
        <q-carousel swipeable animated v-model="state.slide" thumbnails infinite :autoplay="10000" height="100%">
          <q-carousel-slide :name="1" img-src="~assets/login-slide-1.jpg" />
        </q-carousel>
      </div>
    </div>
  </q-layout>
</template>

<script setup>
import { reactive } from 'vue';
const state = reactive({
  slide: 1,
})
</script>