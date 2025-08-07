import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { format } from "date-fns";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useCustomer = () => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const customerOptions = ref([]);
  const customerModel = ref([]);
  const refCustomerSelect = ref();
  const searchKey = "orlike:description,ident_no,phone";

  function filterFnCustomer(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        customerOptions.value = [];
        return;
      }
      if (val === "") {
        customerOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getCustomer(needle);
      customerOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refCustomerSelect.value.options.length > 0) {
          refCustomerSelect.value.setOptionIndex(-1);
          refCustomerSelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addCustomer(id) {
    if (!id) {
      refCustomerSelect.value.focus();
      setTimeout(() => {
        refCustomerSelect.value.blur();
      });
      return;
    }
    const item = await $api.get(`customer/${id}`);

    $q.notify({
      type: "success",
      message: `${t("customer")} añadido`,
    });
  }

  async function saveCustomer() {
    const response = await $api.post(`customer`, {
      description: customerModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("customer")} agregado`,
      });
      customerModel.value = null;
      refCustomerSelect.value.hidePopup();
      refCustomerSelect.value.focus();
      setTimeout(() => {
        refCustomerSelect.value.blur();
      });
    }
  }

  function clearCustomer(item) {
    customerModel.value = null;
  }

  async function getCustomer(needle) {
    return await $api.get(`customer`, {
      params: {
        groupBy: ["t_customer.id"],
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
    filterFnCustomer,
    addCustomer,
    saveCustomer,
    clearCustomer,
    refCustomerSelect,
    customerOptions,
    customerModel,
  };
};
