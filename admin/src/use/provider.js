import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useProvider = (state) => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const providerOptions = ref([]);
  const providerModel = ref([]);
  const refProviderSelect = ref();
  const searchKey = "orlike:description";

  function filterFnProvider(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        providerOptions.value = [];
        return;
      }
      if (val === "") {
        providerOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getProvider(needle);
      providerOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refProviderSelect.value.options.length > 0) {
          refProviderSelect.value.setOptionIndex(-1);
          refProviderSelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addProvider(id) {
    if (!id) {
      refProviderSelect.value.focus();
      setTimeout(() => {
        refProviderSelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("provider")} añadido`,
    });
  }

  async function saveProvider() {
    const response = await $api.post(`provider`, {
      description: providerModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("provider")} agregado`,
      });
      providerModel.value = null;
      refProviderSelect.value.hidePopup();
      refProviderSelect.value.focus();
      setTimeout(() => {
        refProviderSelect.value.blur();
      });
    }
  }

  function clearProvider(item) {
    providerModel.value = null;
  }

  async function getProvider(needle) {
    console.log(state.countryId);
    return await $api.get(`provider`, {
      params: {
        groupBy: ["t_provider.id"],
        order: {
          description: "ASC",
        },
        where: {
          c_status: 4,
          country_id: state.country_id,
          state_id: state.countryId === 62 ? null : state.stateId,
          [searchKey]: needle,
        },
        limit: 10,
        returnItems: true,
      },
    });
  }

  return {
    filterFnProvider,
    addProvider,
    saveProvider,
    clearProvider,
    refProviderSelect,
    providerOptions,
    providerModel,
  };
};
