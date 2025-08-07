import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useInsurance = () => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const insuranceOptions = ref([]);
  const insuranceModel = ref([]);
  const refInsuranceSelect = ref();
  const searchKey = "orlike:description";

  function filterFnInsurance(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        insuranceOptions.value = [];
        return;
      }
      if (val === "") {
        insuranceOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getInsurance(needle);
      insuranceOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refInsuranceSelect.value.options.length > 0) {
          refInsuranceSelect.value.setOptionIndex(-1);
          refInsuranceSelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addInsurance(id) {
    if (!id) {
      refInsuranceSelect.value.focus();
      setTimeout(() => {
        refInsuranceSelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("insurance")} añadido`,
    });
  }

  async function saveInsurance() {
    const response = await $api.post(`insurance`, {
      description: insuranceModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("insurance")} agregado`,
      });
      insuranceModel.value = null;
      refInsuranceSelect.value.hidePopup();
      refInsuranceSelect.value.focus();
      setTimeout(() => {
        refInsuranceSelect.value.blur();
      });
    }
  }

  function clearInsurance(item) {
    insuranceModel.value = null;
  }

  async function getInsurance(needle) {
    return await $api.get(`insurance`, {
      params: {
        groupBy: ["t_insurance.id"],
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
    filterFnInsurance,
    addInsurance,
    saveInsurance,
    clearInsurance,
    refInsuranceSelect,
    insuranceOptions,
    insuranceModel,
  };
};
