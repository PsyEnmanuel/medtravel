import { inject, onMounted, ref } from "vue";
import { format } from "date-fns";
import { useQuasar } from "quasar";

export const useTreatment = (state) => {
  const $api = inject("$api");
  const $me = inject("$me");
  const $q = useQuasar();

  const stringOptions = ref();
  const treatment = ref([]);
  const treatmentModel = ref([]);
  const refTreatmentSelect = ref();

  function filterFnTreatment(val, update, abort) {
    update(
      () => {
        const needle = val.toLocaleLowerCase();
        treatment.value = stringOptions.value.filter(
          (v) => v.description.toLocaleLowerCase().indexOf(needle) > -1
        );
      },
      (ref) => {
        if (val !== "" && ref.options.length > 0) {
          ref.setOptionIndex(-1);
          ref.moveOptionSelection(1, true);
        }
      }
    );
  }

  async function addTreatment(id) {
    if (state.item.treatment.some(i => i.id === id)) {
      $q.notify({
        type: "warning",
        message: "Este tratamiento ya esta agregado",
      });
      return;
    }
    if (!id) {
      refTreatmentSelect.value.focus();
      setTimeout(() => {
        refTreatmentSelect.value.blur();
      });
      return;
    }
    treatmentModel.value = null;
    const item = await $api.get(`catalogue/${id}`);

    state.item.treatment.push({
      id: String(item.id),
      description: item.description,
      detail: item.detail,
      date: format(new Date(), "dd-MM-yyyy"),
      created_by_doctor: $me.id
    });

    $q.notify({
      type: "success",
      message: "Tratamiento agregado",
    });
  }

  async function saveTreatment() {
    const response = await $api.post(`catalogue`, {
      description: treatmentModel.value,
    });

    state.item.treatment.push({
      id: String(response.id),
      description: treatmentModel.value,
      date: format(new Date(), "dd-MM-yyyy"),
    });

    getTreatment();

    if (response) {
      $q.notify({
        type: "warning",
        message: "Tratamiento agregado",
      });
      treatmentModel.value = null;
      refTreatmentSelect.value.hidePopup();
      refTreatmentSelect.value.focus();
      setTimeout(() => {
        refTreatmentSelect.value.blur();
      });
    }
  }

  function removeTreatment(item) {
    const index = state.item.treatment.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      state.item.treatment.splice(index, 1);
    }
  }

  async function getTreatment() {
    stringOptions.value = await $api.get(`catalogue`, {
      params: {
        order: {
          description: "ASC",
        },
        groupBy: ["t_catalogue.id"],
        where: {
          c_status: 4,
        },
        returnItems: true,
      },
    });
  }

  onMounted(async () => {
    getTreatment();
  });

  return {
    filterFnTreatment,
    addTreatment,
    saveTreatment,
    removeTreatment,
    refTreatmentSelect,
    treatment,
    treatmentModel,
  };
};