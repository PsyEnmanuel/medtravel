import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { format } from "date-fns";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useContact = (state) => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const contactOptions = ref([]);
  const contactModel = ref([]);
  const refContactSelect = ref();
  const searchKey = "orlike:description";

  function filterFnContact(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        contactOptions.value = [];
        return;
      }
      if (val === "") {
        contactOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getContact(needle);
      contactOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refContactSelect.value.options.length > 0) {
          refContactSelect.value.setOptionIndex(-1);
          refContactSelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addContact(id) {
    if (!id) {
      refContactSelect.value.focus();
      setTimeout(() => {
        refContactSelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("contact")} añadido`,
    });
  }

  async function saveContact() {
    const response = await $api.post(`contact`, {
      description: contactModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("contact")} agregado`,
      });
      contactModel.value = null;
      refContactSelect.value.hidePopup();
      refContactSelect.value.focus();
      setTimeout(() => {
        refContactSelect.value.blur();
      });
    }
  }

  function clearContact(item) {
    contactModel.value = null;
  }

  async function getContact(needle) {
    return await $api.get(`contact`, {
      params: {
        groupBy: ["t_contact.id"],
        order: {
          description: "ASC",
        },
        where: {
          c_status: 4,
          'js:provider': [state.refId],
          [searchKey]: needle,
        },
        limit: 10,
        returnItems: true,
      },
    });
  }

  return {
    filterFnContact,
    addContact,
    saveContact,
    clearContact,
    refContactSelect,
    contactOptions,
    contactModel,
  };
};
