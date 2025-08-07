import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useCity = (state) => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const cityOptions = ref([]);
  const cityModel = ref([]);
  const refCitySelect = ref();
  const searchKey = "orlike:name";

  const compareStrings = (s1, s2) => {
    const normalizedS1 = String(s1).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normalizedS2 = String(s2).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return normalizedS1.includes(normalizedS2);
  };

  function filterFnCity(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        cityOptions.value = [];
        return;
      }
      if (val === "") {
        cityOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getCity(needle);

      cityOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => {
            if (typeof v[i] === 'object' && v[i] !== null) {
              return compareStrings(v[i].es, needle)
            } else {
              return String(v[i]).toLowerCase().includes(needle)
            }
          })
      );
      setTimeout(() => {
        if (val !== "" && refCitySelect.value.options.length > 0) {
          refCitySelect.value.setOptionIndex(-1);
          refCitySelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  function clearCity(item) {
    cityModel.value = null;
  }

  async function getCity(needle) {
    return await $api.get(`utility/cities`, {
      params: {
        groupBy: ["cities.id"],
        order: {
          name: "ASC",
        },
        where: {
          [searchKey]: needle,
          state_id: state.refId
        },
        columns: ['id', 'name'],
        limit: 10,
        returnItems: true,
      },
    });
  }

  return {
    filterFnCity,
    clearCity,
    refCitySelect,
    cityOptions,
    cityModel,
  };
};
