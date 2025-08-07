import { inject, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { format } from "date-fns";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export const usePolicy = (state) => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n();

  const policyOptions = ref([]);
  const policyModel = ref([]);
  const refPolicySelect = ref();

  function filterFnPolicy(val, update, abort) {
    update(async () => {
      if (val.length < 1) {
        policyOptions.value = [];
        return;
      }
      if (val === "") {
        policyOptions.value = [];
        return;
      }
      const needle = val.toLowerCase();
      const items = await getPolicy(needle);
      policyOptions.value = items.filter((v) =>
        state.searchKey
          .replace("orlike:", "")
          .split(",")
          .some((i) => String(v[i]).toLowerCase().includes(needle))
      );
      setTimeout(() => {
        if (val !== "" && refPolicySelect.value.options.length > 0) {
          refPolicySelect.value.setOptionIndex(-1);
          refPolicySelect.value.moveOptionSelection(1, true);
        }
      }, 0);
    });
  }

  async function addPolicy(id) {
    if (!id) {
      refPolicySelect.value.focus();
      setTimeout(() => {
        refPolicySelect.value.blur();
      });
      return;
    }

    $q.notify({
      type: "success",
      message: `${t("policy")} añadido`,
    });
  }

  async function savePolicy() {
    const response = await $api.post(`policy`, {
      insured_description: policyModel.value,
    });

    if (response) {
      $q.notify({
        type: "warning",
        message: `${t("policy")} agregado`,
      });
      policyModel.value = null;
      refPolicySelect.value.hidePopup();
      refPolicySelect.value.focus();
      setTimeout(() => {
        refPolicySelect.value.blur();
      });
    }
  }

  function clearPolicy(item) {
    policyModel.value = null;
  }

  async function getPolicy(needle) {

    return await $api.get(`policy`, {
      params: {
        groupBy: state.titular ? ["t_policy_insured.titular_id"] : ["t_policy.id"],
        join: state.titular ? [{ table: 't_policy_insured', relationB: 't_policy_insured.policy_id', relationA: 't_policy.id' }] : [{ table: 't_policy_insured', relationA: 't_policy_insured.policy_id', relationB: 't_policy.id' }],
        where: {
          [`t_policy.c_status`]: 4,
          [state.searchKey]: needle,
          insured_id: state.insuredId ?? null,
          insurance_id: state.insuranceId ?? null,
          policy_number: state.policy_number ?? null,
          policy_id: state.titular ? state.policy_id : null,
        },
        columns: {
          t_policy: ['id', 'policy_number', 'deductible', 'validity_date_end'],
          t_policy_insured: ['insured_description'],
        },
        limit: 10,
        returnItems: true
      }
    })

  }

  return {
    filterFnPolicy,
    addPolicy,
    savePolicy,
    clearPolicy,
    refPolicySelect,
    policyOptions,
    policyModel,
  };
};
