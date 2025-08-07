import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { format } from "date-fns";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useProcedure = () => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const procedureOptions = ref([]);
  const procedureModel = ref([]);
  const refProcedureSelect = ref();
  const searchKey = "orlike:description,code";

  function filterFnProcedure(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        procedureOptions.value = [];
        return;
      }
      if (val === "") {
        procedureOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getProcedure(needle);
      procedureOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refProcedureSelect.value.options.length > 0) {
          refProcedureSelect.value.setOptionIndex(-1);
          refProcedureSelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addProcedure(id) {
    if (!id) {
      refProcedureSelect.value.focus();
      setTimeout(() => {
        refProcedureSelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("procedure")} añadido`,
    });
  }

  async function saveProcedure() {
    const response = await $api.post(`CPT`, {
      description: procedureModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("procedure")} agregado`,
      });
      procedureModel.value = null;
      refProcedureSelect.value.hidePopup();
      refProcedureSelect.value.focus();
      setTimeout(() => {
        refProcedureSelect.value.blur();
      });
    }
  }

  function clearProcedure(item) {
    procedureModel.value = null;
  }

  async function getProcedure(needle) {
    return await $api.get(`CPT`, {
      params: {
        groupBy: ["t_CPT.id"],
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
    filterFnProcedure,
    addProcedure,
    saveProcedure,
    clearProcedure,
    refProcedureSelect,
    procedureOptions,
    procedureModel,
  };
};
