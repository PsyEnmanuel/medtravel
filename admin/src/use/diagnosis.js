import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { format } from "date-fns";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useDiagnosis = () => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const diagnosisOptions = ref([]);
  const diagnosisModel = ref([]);
  const refDiagnosisSelect = ref();
  const searchKey = "orlike:description,code";

  function filterFnDiagnosis(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        diagnosisOptions.value = [];
        return;
      }
      if (val === "") {
        diagnosisOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getDiagnosis(needle);
      diagnosisOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refDiagnosisSelect.value.options.length > 0) {
          refDiagnosisSelect.value.setOptionIndex(-1);
          refDiagnosisSelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addDiagnosis(id) {
    if (!id) {
      refDiagnosisSelect.value.focus();
      setTimeout(() => {
        refDiagnosisSelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("diagnosis")} añadido`,
    });
  }

  async function saveDiagnosis() {
    const response = await $api.post(`ICD10`, {
      description: diagnosisModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("diagnosis")} agregado`,
      });
      diagnosisModel.value = null;
      refDiagnosisSelect.value.hidePopup();
      refDiagnosisSelect.value.focus();
      setTimeout(() => {
        refDiagnosisSelect.value.blur();
      });
    }
  }

  function clearDiagnosis(item) {
    diagnosisModel.value = null;
  }

  async function getDiagnosis(needle) {
    return await $api.get(`ICD10`, {
      params: {
        groupBy: ["t_ICD10.id"],
        order: {
          code: "ASC",
        },
        where: {
          c_status: 4,
          [searchKey]: needle,
        },
        limit: 30,
        returnItems: true,
      },
    });
  }

  return {
    filterFnDiagnosis,
    addDiagnosis,
    saveDiagnosis,
    clearDiagnosis,
    refDiagnosisSelect,
    diagnosisOptions,
    diagnosisModel,
  };
};
