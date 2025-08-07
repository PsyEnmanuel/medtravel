import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { format } from "date-fns";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useInsured = () => {
  const $api = inject("$api");
  const $me = inject("$me");
  const $q = useQuasar();
  const { t } = useI18n();

  const insuredOptions = ref([]);
  const insuredModel = ref([]);
  const refInsuredSelect = ref();
  const searchKey = "orlike:fullname,ident_no,phone";

  function filterFnInsured(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        insuredOptions.value = [];
        return;
      }
      if (val === "") {
        insuredOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getInsured(needle);
      insuredOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refInsuredSelect.value.options.length > 0) {
          refInsuredSelect.value.setOptionIndex(-1);
          refInsuredSelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addInsured(id) {
    if (!id) {
      refInsuredSelect.value.focus();
      setTimeout(() => {
        refInsuredSelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("insured")} añadido`,
    });
  }

  async function saveInsured() {
    const response = await $api.post(`insured`, {
      fullname: insuredModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("insured")} agregado`,
      });
      insuredModel.value = null;
      refInsuredSelect.value.hidePopup();
      refInsuredSelect.value.focus();
      setTimeout(() => {
        refInsuredSelect.value.blur();
      });
    }
  }

  function clearInsured(item) {
    insuredModel.value = null;
  }

  async function getInsured(needle) {
    return await $api.get(`insured`, {
      params: {
        groupBy: ["t_insured.id"],
        order: {
          fullname: "ASC",
        },
        where: {
          c_status: 4,
          [searchKey]: needle,
          high_profile: $me.high_profile ? null : 0,
        },
        limit: 10,
        returnItems: true,
      },
    });
  }

  return {
    filterFnInsured,
    addInsured,
    saveInsured,
    clearInsured,
    refInsuredSelect,
    insuredOptions,
    insuredModel,
  };
};
