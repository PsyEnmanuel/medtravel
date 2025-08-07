import { inject, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { removeDiacritics } from "src/helpers";

export const useAnalytic = (state) => {
    const $api = inject("$api");
    const $q = useQuasar();
  
    const stringOptions = ref();
    const analytic = ref([]);
    const analyticModel = ref([]);
    const refAnalyticSelect = ref();
  
    function filterFnAnalytic(val, update, abort) {
      update(
        () => {
          const needle = val.toLocaleLowerCase();
          analytic.value = stringOptions.value.filter(
            (v) => {
              return removeDiacritics(v.description.toLocaleLowerCase()).indexOf(needle) > -1
            }
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
  
    async function addAnalytic(id) {
      if(state.item.analytic.some(i => i.id === id)) {
        $q.notify({
          type: "warning",
          message: "Este tratamiento ya esta agregado",
        });
        return;
      }
      if (!id) {
        refAnalyticSelect.value.focus();
        setTimeout(() => {
          refAnalyticSelect.value.blur();
        });
        return;
      }
      analyticModel.value = null;
      const item = await $api.get(`analytic/${id}`);
  
      state.item.analytic.push({
        id: item.id,
        description: item.description,
        $analytic_group_id: item.$analytic_group_id,
        analytic_group: item.analytic_group,
      });
  
      $q.notify({
        type: "success",
        message: "Tratamiento agregado",
      });
    }
  
    async function saveAnalytic() {
      const response = await $api.post(`analytic`, {
        description: analyticModel.value,
      });
  
      state.item.analytic.push({
        id: String(response.id),
        description: analyticModel.value,
      });
      
      getAnalytic();
  
      if (response) {
        $q.notify({
          type: "warning",
          message: "Tratamiento agregado",
        });
        analyticModel.value = null;
        refAnalyticSelect.value.hidePopup();
        refAnalyticSelect.value.focus();
        setTimeout(() => {
          refAnalyticSelect.value.blur();
        });
      }
    }
  
    function removeAnalytic(item) {
      const index = state.item.analytic.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        state.item.analytic.splice(index, 1);
      }
    }
  
    async function getAnalytic() {
      stringOptions.value = await $api.get(`analytic`, {
        params: {
          order: {
            description: "ASC",
          },
          groupBy: ["t_analytic.id"],
          where: {
            c_status: 4,
          },
          returnItems: true,
        },
      });
    }
  
    onMounted(async () => {
      getAnalytic();
    });
  
    return {
      filterFnAnalytic,
      addAnalytic,
      saveAnalytic,
      removeAnalytic,
      refAnalyticSelect,
      analytic,
      analyticModel,
    };
  };