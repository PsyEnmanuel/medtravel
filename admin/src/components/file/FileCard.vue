<template>
  <q-dialog class="q-pa-none left-0" v-model="state.dialog" :position="$isDesktop ? 'right' : 'standard'" full-height
    full-width :maximized="!$isDesktop" :transition-duration="$isDesktop ? 100 : 0">
    <q-card class="p-4" style="width: 350px;">
      <FileWrite isEdit :id="item.id" isDrawer @close="state.dialog = false" :width="$isDesktop ? '350px' : '100%'" />
    </q-card>
  </q-dialog>
  <div>
    <div class="card">
      <div v-if="item.type === 'image'">
        <q-img class="h-[300px]" :src="item.url" fit="fill" position="0 0" />
      </div>
      <div v-else-if="item.icon === 'pdf'">
        <q-icon name="~assets/pdf.png"></q-icon>
      </div>
      <div v-else-if="item.icon === 'word'">
        <q-icon name="~assets/word.png"></q-icon>
      </div>
      <div v-else-if="item.icon === 'excel'">
        <q-icon name="~assets/excel.png"></q-icon>
      </div>
      <p class="p-2 flex flex-col">
        <span>{{ item.description }}</span>
        <span class="text-xs text-primary">{{ item.file_type }}&nbsp;</span>
      </p>
      <div class="grid grid-cols-3 w-full p-2 gap-1">
        <q-btn class="bg-default" size="xs" icon="sym_o_remove" @click="onDelete" label="Remover" />
        <q-btn class="bg-default" size="xs" icon="sym_o_edit_note" @click="state.dialog = true" label="Editar" />
        <a :href="item.url" target="_blank" class="w-full block">
          <q-btn class="bg-default w-full" size="xs" icon="sym_o_content_paste_search" label="Consultar" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, reactive, ref } from 'vue';

import { useQuasar } from 'quasar';
import FileWrite from './FileWrite.vue'
const $q = useQuasar()
const $api = inject('$api')

const props = defineProps({ item: Object })
const state = reactive({
  dialog: false,
})

async function onDelete() {
  try {
    const result = await $q.dialog({
      title: 'Confirmar',
      message: 'Deseas borrar este Archivo?',
      cancel: true,
      persistent: true
    })
    result.onOk(async () => {
      await $api.delete(`file/${props.item.id}`, {
        data: {
          ref_key: props.item.ref_key
        }
      });
      $q.notify({
        type: 'success',
        message: 'Archivo Removido'
      })
    })
  } catch (error) {
    console.log(error)
  }
}



</script>