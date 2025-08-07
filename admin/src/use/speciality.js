import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { format } from "date-fns";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useSpeciality = () => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const specialityOptions = ref([]);
  const specialityModel = ref([]);
  const refSpecialitySelect = ref();
  const searchKey = "orlike:description";

  function filterFnSpeciality(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        specialityOptions.value = [];
        return;
      }
      if (val === "") {
        specialityOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getSpeciality(needle);
      specialityOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refSpecialitySelect.value.options.length > 0) {
          refSpecialitySelect.value.setOptionIndex(-1);
          refSpecialitySelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addSpeciality(id) {
    if (!id) {
      refSpecialitySelect.value.focus();
      setTimeout(() => {
        refSpecialitySelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("speciality")} añadido`,
    });
  }

  async function saveSpeciality() {
    const response = await $api.post(`speciality`, {
      description: specialityModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("speciality")} agregado`,
      });
      specialityModel.value = null;
      refSpecialitySelect.value.hidePopup();
      refSpecialitySelect.value.focus();
      setTimeout(() => {
        refSpecialitySelect.value.blur();
      });
    }
  }

  function clearSpeciality(item) {
    specialityModel.value = null;
  }

  async function getSpeciality(needle) {
    return await $api.get(`speciality`, {
      params: {
        groupBy: ["t_speciality.id"],
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
    filterFnSpeciality,
    addSpeciality,
    saveSpeciality,
    clearSpeciality,
    refSpecialitySelect,
    specialityOptions,
    specialityModel,
  };
};
