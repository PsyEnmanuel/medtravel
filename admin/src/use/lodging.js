import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useLodging = (state) => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const lodgingOptions = ref([]);
  const lodgingModel = ref([]);
  const refLodgingSelect = ref();
  const searchKey = "orlike:description";

  function filterFnLodging(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        lodgingOptions.value = [];
        return;
      }
      if (val === "") {
        lodgingOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getLodging(needle);
      lodgingOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refLodgingSelect.value.options.length > 0) {
          refLodgingSelect.value.setOptionIndex(-1);
          refLodgingSelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addLodging(id) {
    if (!id) {
      refLodgingSelect.value.focus();
      setTimeout(() => {
        refLodgingSelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("lodging")} añadido`,
    });
  }

  async function saveLodging() {
    const response = await $api.post(`lodging`, {
      description: lodgingModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("lodging")} agregado`,
      });
      lodgingModel.value = null;
      refLodgingSelect.value.hidePopup();
      refLodgingSelect.value.focus();
      setTimeout(() => {
        refLodgingSelect.value.blur();
      });
    }
  }

  function clearLodging(item) {
    lodgingModel.value = null;
  }

  async function getLodging(needle) {
    console.log(state.countryId);
    return await $api.get(`lodging`, {
      params: {
        groupBy: ["t_lodging.id"],
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
    filterFnLodging,
    addLodging,
    saveLodging,
    clearLodging,
    refLodgingSelect,
    lodgingOptions,
    lodgingModel,
  };
};
