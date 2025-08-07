import { inject, onMounted, ref } from "vue";
import { format } from "date-fns";
import { useQuasar } from "quasar";

export const useRecomendation = (state) => {
  const $api = inject("$api");
  const $q = useQuasar();

  const stringOptions = ref();
  const recomendation = ref([]);
  const recomendationModel = ref([]);
  const refRecomendationSelect = ref();

  function filterFnRecomendation(val, update, abort) {
    update(
      () => {
        const needle = val.toLocaleLowerCase();
        recomendation.value = stringOptions.value.filter(
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

  async function addRecomendation(id) {
    if(state.item.recomendation.some(i => i.id === id)) {
      $q.notify({
        type: "warning",
        message: "Este Recomendación ya esta agregado",
      });
      return;
    }
    if (!id) {
      refRecomendationSelect.value.focus();
      setTimeout(() => {
        refRecomendationSelect.value.blur();
      });
      return;
    }
    recomendationModel.value = null;
    const item = await $api.get(`recomendation/${id}`);

    state.item.recomendation.push({
      id: String(item.id),
      description: item.description,
      detail: item.detail,
      date: format(new Date(), "dd-MM-yyyy"),
    });

    $q.notify({
      type: "success",
      message: "Recomendación agregado",
    });
  }

  async function saveRecomendation() {
    const response = await $api.post(`recomendation`, {
      description: recomendationModel.value,
    });

    state.item.recomendation.push({
      id: String(response.id),
      description: recomendationModel.value,
      date: format(new Date(), "dd-MM-yyyy"),
    });
    
    getRecomendation();

    if (response) {
      $q.notify({
        type: "warning",
        message: "Recomendación agregado",
      });
      recomendationModel.value = null;
      refRecomendationSelect.value.hidePopup();
      refRecomendationSelect.value.focus();
      setTimeout(() => {
        refRecomendationSelect.value.blur();
      });
    }
  }

  function removeRecomendation(item) {
    const index = state.item.recomendation.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      state.item.recomendation.splice(index, 1);
    }
  }

  async function getRecomendation() {
    stringOptions.value = await $api.get(`recomendation`, {
      params: {
        order: {
          description: "ASC",
        },
        groupBy: ["t_recomendation.id"],
        where: {
          c_status: 4,
        },
        returnItems: true,
      },
    });
  }

  onMounted(async () => {
    getRecomendation();
  });

  return {
    filterFnRecomendation,
    addRecomendation,
    saveRecomendation,
    removeRecomendation,
    refRecomendationSelect,
    recomendation,
    recomendationModel,
  };
};