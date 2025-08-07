<template>

    <q-select dense outlined :label="$t(refKey)" :model-value="categoryModel" @update:model-value="setCategory"
        use-input multiple map-options emit-value input-debounce="0" option-value="id" option-label="description"
        :options="categoryOptions" @filter="filterFnCategory" @clear="clearCategory">

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
        <template v-slot:option="scope">
            <q-item class="card-shadow flex flex-col cursor-pointer rounded-none"
                :class="categoryModel.includes(scope.opt.description) ? 'bg-default' : ''"
                v-bind="scope.itemProps">
                <q-item-section>
                    <q-item-label class="text-uppercase line-clamp-1 text-xs"
                        :class="categoryModel.includes(scope.opt.description) ? 'bg-default text-secondary font-bold' : ''"
                        caption>
                        <div class="flex">
                            <span>{{ scope.opt.description }}</span>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>
    </q-select>

    <q-dialog v-model="state.dialogCategory">
        <CategoryDialog :category="refKey" @close="state.dialogCategory = false" />
    </q-dialog>
</template>

<script setup>
import { useCategory } from 'src/use/category';
import { onMounted, ref, watch, reactive } from 'vue';
import CategoryDialog from 'src/pages/setting/category/CategoryDialog.vue';
const $emit = defineEmits(['setCategory', 'clearCategory'])
const props = defineProps({
    modelValue: Array, refKey: String, add: {
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
    // categoryModel.value = val
})

function setCategory(values) {
    const id = values[values.length - 1]
    if (!id) {
        refCategorySelect.value.focus();
        setTimeout(() => {
            refCategorySelect.value.blur();
        });
        return;
    }
    let description = null
    for (let i = 0; i < categoryOptions.value.length; i++) {
        const cat = categoryOptions.value[i];
        if (cat.id === id) {
            description = cat.description
        }
    }

    $emit('setCategory', { id, description: description.replace(/\s/g, '') })
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