import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useCountry = () => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const countryOptions = ref([]);
  const countryModel = ref([]);
  const refCountrySelect = ref();
  const searchKey = "orlike:name,translations,iso2,iso3";

  const compareStrings = (s1, s2) => {
    const normalizedS1 = String(s1).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normalizedS2 = String(s2).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return normalizedS1.includes(normalizedS2);
  };

  function filterFnCountry(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        countryOptions.value = [];
        return;
      }
      if (val === "") {
        countryOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getCountry(needle);

      countryOptions.value = items.filter((v) =>
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
        if (val !== "" && refCountrySelect.value.options.length > 0) {
          refCountrySelect.value.setOptionIndex(-1);
          refCountrySelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  function clearCountry(item) {
    countryModel.value = null;
  }

  async function getCountry(needle) {
    return await $api.get(`utility/countries`, {
      params: {
        groupBy: ["countries.id"],
        order: {
          name: "ASC",
        },
        where: {
          [searchKey]: needle,
        },
        columns: ['id', 'name', 'emojiU', 'translations'],
        limit: 10,
        returnItems: true,
      },
    });
  }

  return {
    filterFnCountry,
    clearCountry,
    refCountrySelect,
    countryOptions,
    countryModel,
  };
};
