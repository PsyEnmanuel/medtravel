import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useBroker = (state) => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const brokerOptions = ref([]);
  const brokerModel = ref([]);
  const refBrokerSelect = ref();
  const searchKey = "orlike:description";

  function filterFnBroker(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        brokerOptions.value = [];
        return;
      }
      if (val === "") {
        brokerOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getBroker(needle);
      brokerOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refBrokerSelect.value.options.length > 0) {
          refBrokerSelect.value.setOptionIndex(-1);
          refBrokerSelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addBroker(id) {
    if (!id) {
      refBrokerSelect.value.focus();
      setTimeout(() => {
        refBrokerSelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("broker")} añadido`,
    });
  }

  async function saveBroker() {
    const response = await $api.post(`broker`, {
      description: brokerModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("broker")} agregado`,
      });
      brokerModel.value = null;
      refBrokerSelect.value.hidePopup();
      refBrokerSelect.value.focus();
      setTimeout(() => {
        refBrokerSelect.value.blur();
      });
    }
  }

  function clearBroker(item) {
    brokerModel.value = null;
  }

  async function getBroker(needle) {
    console.log(state.countryId);
    return await $api.get(`broker`, {
      params: {
        groupBy: ["t_broker.id"],
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
    filterFnBroker,
    addBroker,
    saveBroker,
    clearBroker,
    refBrokerSelect,
    brokerOptions,
    brokerModel,
  };
};
