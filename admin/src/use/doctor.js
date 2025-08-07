import { inject, onBeforeUnmount, onMounted, ref } from "vue";
import { format } from "date-fns";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const useDoctor = (state) => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const doctorOptions = ref([]);
  const doctorModel = ref([]);
  const refDoctorSelect = ref();
  const searchKey = "orlike:description";

  function filterFnDoctor(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        doctorOptions.value = [];
        return;
      }
      if (val === "") {
        doctorOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getDoctor(needle);
      doctorOptions.value = items.filter((v) =>
        searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refDoctorSelect.value.options.length > 0) {
          refDoctorSelect.value.setOptionIndex(-1);
          refDoctorSelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addDoctor(id) {
    if (!id) {
      refDoctorSelect.value.focus();
      setTimeout(() => {
        refDoctorSelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("doctor")} añadido`,
    });
  }

  async function saveDoctor() {
    const response = await $api.post(`doctor`, {
      description: doctorModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("doctor")} agregado`,
      });
      doctorModel.value = null;
      refDoctorSelect.value.hidePopup();
      refDoctorSelect.value.focus();
      setTimeout(() => {
        refDoctorSelect.value.blur();
      });
    }
  }

  function clearDoctor(item) {
    doctorModel.value = null;
  }

  async function getDoctor(needle) {
    return await $api.get(`doctor`, {
      params: {
        groupBy: ["t_doctor.id"],
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
    filterFnDoctor,
    addDoctor,
    saveDoctor,
    clearDoctor,
    refDoctorSelect,
    doctorOptions,
    doctorModel,
  };
};
