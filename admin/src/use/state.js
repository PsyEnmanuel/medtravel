import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useState = (state) => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const stateOptions = ref([]);
  const stateModel = ref([]);
  const refStateSelect = ref();
  const searchKey = "orlike:name";

  function filterFnState(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        stateOptions.value = [];
        return;
      }
      if (val === "") {
        stateOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getState(needle);

      stateOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => {
            return String(v[i]).toLowerCase().includes(needle)
          })
      );
      setTimeout(() => {
        if (val !== "" && refStateSelect.value.options.length > 0) {
          refStateSelect.value.setOptionIndex(-1);
          refStateSelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  function clearState(item) {
    stateModel.value = null;
  }

  async function getState(needle) {
    console.log(state);
    return await $api.get(`utility/states`, {
      params: {
        groupBy: ["states.id"],
        order: {
          name: "ASC",
        },
        where: {
          [searchKey]: needle,
          country_id: state.refId
        },
        columns: ['id', 'name'],
        limit: 10,
        returnItems: true,
      },
    });
  }

  return {
    filterFnState,
    clearState,
    refStateSelect,
    stateOptions,
    stateModel,
  };
};
