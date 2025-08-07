<template>
    <div class="bg-[#FBFCFD] h-screen w-full flex justify-center items-center event-public">
        <div class="card flex flex-nowrap bg-white text-[#1a1a1a] lg:max-w-[70%]">
            <div class="lg:p-8 p-2 flex flex-col">
                <div class="flex flex-col justify-center items-center">
                    <q-img class="max-h-[256px] max-w-[256px] object-contain mx-auto mb-4" src="~assets/logoText.png"
                        spinner-color="white" />
                    <p class="text-center text-gray-500 text-xs mb-2">Clínica Dermatológica enfocada en la salud y
                        <br />belleza de tu piel, pelo y uñas.
                    </p>
                </div>
                <q-separator class="mb-4"></q-separator>
                <h2 class="text-center mb-4 font-light text-gray-500 text-lg leading-6">Elige el médico con el cual
                    <br />deseas agendar tu coordinación</h2>
                <div class="grid lg:grid-cols-2 grid-cols-1 gap-2">
                    <div v-for="doctor in state.doctors" :key="doctor.id" class="flex flex-col justify-between card p-4">
                        <div class="font-bold text-lg text-gray-600">
                            COORDINACIONES {{ doctor.description }}
                        </div>
                        <div class="line-clamp-3">
                            <p>Nos alegra que quieras agendar una coordinación, para nosotros es importante recibirte en
                                Dermathoclinic.
                            </p>
                            <p>Por favor selecciona la fecha marcada en azul más conveniente para ti, para que puedas ver
                                los
                                horarios disponibles. </p>
                        </div>
                        <q-btn class="button-tab rounded-lg mt-2" :class="doctor.class" outline flat
                            @click="$emit('select', doctor)">
                            <div class="flex justify-between items-center w-full">
                                <span>Agendar Coordinación</span>
                                <q-icon name="arrow_forward_ios"></q-icon>
                            </div>
                        </q-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { inject, onMounted, reactive } from 'vue';

const $api = inject("$api")

const state = reactive({
    doctors: []
})

onMounted(async () => {
    state.doctors = await $api.get(`user/public/doctor`)
})
</script>