<template>
    <q-select :class="props.class" ref="refCategorySelect" dense outlined clearable="" behavior="menu"
        hide-dropdown-icon use-input hide-selected fill-input input-debounce="0" emit-value map-options
        option-value="id" option-label="description" :label="$t(refKey)" :options="categoryOptions"
        @input-value="categoryModel = $event" :model-value="categoryModel" @update:model-value="setCategory"
        @filter="filterFnCategory" @clear="clearCategory">

        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none" v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 font-semibold text-xs" caption>
                        <div class="flex">
                            <span>{{ scope.opt.description }}</span>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <div v-if="selectedId || !categoryModel?.length"></div>
            <div v-else class="card-shadow flex flex-col pb-2 pt-2 px-3 cursor-pointer rounded-none">
                <div class="text-grey">
                    Escribir arriba para ver opciones
                </div>
            </div>
        </template>

        <template v-slot:after>
            <q-btn v-if="props.add" flat class="button-icon text-[10px] h-[40px] bg-primary text-white"
                icon="fa-solid fa-add" @click="state.dialogCategory = true;">
                <q-tooltip class="bg-default text-black text-xs">Agregar Categoría</q-tooltip>
            </q-btn>
        </template>

    </q-select>

    <q-dialog class="q-pa-none left-0" v-model="state.dialogCategory" :transition-duration="0" full-height maximized
        position="right">
        <CategoryDialog :category="refKey" isDrawer @close="state.dialogCategory = false" />
    </q-dialog>
    
</template>

<script setup>
import { useCategory } from 'src/use/category';
import { onMounted, ref, watch, reactive } from 'vue';
import CategoryDialog from 'src/pages/setting/category/CategoryDialog.vue';
const $emit = defineEmits(['setCategory', 'clearCategory'])
const props = defineProps({
    modelValue: String, refKey: String, add: {
        type: Boolean,
        default: false
    },
    class: {
        type: String,
        default: ''
    }
})

const selectedId = ref(props.modelValue)

const state = reactive({
    dialogCategory: false
})

watch(() => props.modelValue, (val) => {
    categoryModel.value = val
})

function setCategory(id) {
    if (!id) {
        refCategorySelect.value.focus();
        setTimeout(() => {
            refCategorySelect.value.blur();
        });
        return;
    }
    selectedId.value = id
    categoryModel.value = categoryOptions.value.reduce((acc, curr) => {
        if (curr.id === id) {
            acc = curr.description
        }
        return acc;
    })
    $emit('setCategory', id)
}

function clearCategory() {
    selectedId.value = null
    categoryModel.value = null
    $emit('clearCategory')
}

onMounted(() => {
    categoryModel.value = props.modelValue
})

const { filterFnCategory, saveCategory, refCategorySelect, categoryOptions, categoryModel } = useCategory(props.refKey)

</script>