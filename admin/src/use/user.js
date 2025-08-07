import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { format } from "date-fns";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useUser = (state) => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const userOptions = ref([]);
  const userModel = ref([]);
  const refUserSelect = ref();
  const searchKey = "orlike:description";

  function filterFnUser(val, update, abort) {
    update(async () => {
      if (val === "") {
        userOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getUser(needle);
      userOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refUserSelect.value.options.length > 0) {
          refUserSelect.value.setOptionIndex(-1);
          refUserSelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addUser(id) {
    if (!id) {
      refUserSelect.value.focus();
      setTimeout(() => {
        refUserSelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("user")} añadido`,
    });
  }

  async function saveUser() {
    const response = await $api.post(`user`, {
      description: userModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("user")} agregado`,
      });
      userModel.value = null;
      refUserSelect.value.hidePopup();
      refUserSelect.value.focus();
      setTimeout(() => {
        refUserSelect.value.blur();
      });
    }
  }

  function clearUser(item) {
    userModel.value = null;
  }

  async function getUser(needle) {
    return await $api.get(`user`, {
      params: {
        groupBy: ["t_user.id"],
        order: {
          description: "ASC",
        },
        where: {
          'bi:unixroles': state.unixroles ? state.unixroles : 12,
          c_status: 4,
          [searchKey]: needle,
        },
        limit: 10,
        returnItems: true,
      },
    });
  }

  return {
    filterFnUser,
    addUser,
    saveUser,
    clearUser,
    refUserSelect,
    userOptions,
    userModel,
  };
};
