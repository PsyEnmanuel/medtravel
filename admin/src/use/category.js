import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useCategory = (refKey) => {
  const $api = inject("$api");
  const $cats = inject("$cats");
  const $q = useQuasar();
  const { t } = useI18n();

  const categoryOptions = ref([]);
  const categoryModel = ref([]);
  const refCategorySelect = ref();
  const searchKey = "orlike:description";

  function filterFnCategory(val, update, abort) {
    update(async () => {

      const needle = val.toLowerCase();
      categoryOptions.value = $cats.value[refKey].filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refCategorySelect.value.options.length > 0) {
          refCategorySelect.value.setOptionIndex(-1);
          refCategorySelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addCategory(id) {
    if (!id) {
      refCategorySelect.value.focus();
      setTimeout(() => {
        refCategorySelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("category")} añadido`,
    });
  }

  async function saveCategory() {
    const response = await $api.post(`category`, {
      description: categoryModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("category")} agregado`,
      });
      categoryModel.value = null;
      refCategorySelect.value.hidePopup();
      refCategorySelect.value.focus();
      setTimeout(() => {
        refCategorySelect.value.blur();
      });
    }
  }

  function clearCategory(item) {
    categoryModel.value = null;
  }

  async function getCategory(needle) {
    return await $api.get(`category`, {
      params: {
        groupBy: ["t_category.id"],
        order: {
          description: "ASC",
        },
        where: {
          c_status: 4,
          [searchKey]: needle,
        },
        limit: 10,
        returnItems: true,
      },
    });
  }

  return {
    filterFnCategory,
    addCategory,
    saveCategory,
    clearCategory,
    refCategorySelect,
    categoryOptions,
    categoryModel,
  };
};
