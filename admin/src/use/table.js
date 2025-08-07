import { useQuasar } from "quasar";
import { computed, inject, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

export const useTable = (state, tableRef) => {
  const $api = inject("$api");
  const $q = useQuasar();
  const { t } = useI18n()
  const timeout = ref();

  async function onRequest(props) {
    state.loading = true;
    const { page, rowsPerPage, sortBy, descending } = props.pagination;

    let sortKey;

    if (sortBy) {
      if (state.table && ['provider_description', 'created_by'].includes(sortBy)) {
        sortKey = `${state.table}.${sortBy}`
      } else {
        sortKey = sortBy
      }
    } else {
      sortKey = state.table ? `${state.table}.id` : 'id'
    }

    const res = await $api.get(state.url, {
      params: {
        ...state.query,
        page,
        limit: rowsPerPage,
        order: {
          [sortKey]: descending ? "DESC" : "ASC",
        },
      },
    });

    state.pagination.rowsNumber = res.total;
    state.pagination.page = page;
    state.pagination.rowsPerPage = rowsPerPage;
    state.pagination.sortBy = sortBy;
    state.pagination.descending = descending;
    state.rows = res.items;

    state.loading = false;
  }

  function getSelectedString() {
    return state.selected.length === 0
      ? ""
      : `${state.selected.length} record${state.selected.length > 1 ? "s seleccionados de" : " seleccionado de"
      }  ${state.rows.length}`;
  }

  async function updateRowInput(row, name) {
    try {
      clearTimeout(timeout.value);
      timeout.value = setTimeout(async () => {
        await $api.put(`${state.url}/general/${row.id}`, {
          [name]: row[name]
        })
        $q.notify({
          type: 'success',
          message: 'Linea actualizada'
        })
      }, 500)
    } catch (error) {
      console.log(error);
    }
  }


  async function onDeleteRows($event, key = "id") {
    const res = await $api.delete(state.url, {
      data: state.selected.map((item) => item[key]),
    });
    if (res.lines) {
      $q.notify({
        type: "success",
        message: "Lineas borradas.",
      });
    } else {
      $q.notify({
        type: "warning",
        message: "Operación interrumpida.",
      });
    }
  }

  async function addMore() {
    state.loading = true;
    const { page, rowsPerPage, sortBy, descending } = tableRef.value.pagination;
    const res = await $api.get(state.url, {
      params: {
        ...state.query,
        page: page + 1,
        limit: rowsPerPage,
        order: {
          [sortBy || "id"]: descending ? "DESC" : "ASC",
        },
      },
    });

    if (!res.items.length) {
      $q.notify({
        type: "warning",
        message: "No hay más datos.",
      });
      state.loading = false;
      return;
    }

    state.pagination.rowsNumber = res.total;
    state.pagination.page = page + 1;
    state.pagination.rowsPerPage = rowsPerPage;
    state.pagination.sortBy = sortBy;
    state.pagination.descending = descending;
    state.rows = state.rows.concat(res.items);
    state.loading = false;
  }

  async function saveRow(row) {
    clearTimeout(timeout.value)
    timeout.value = setTimeout(async () => {
      await $api.put(`${state.url}/${row.id}`, {
        description: row.description,
      });

      $q.notify({
        type: "warning",
        message: "Linea actualizada",
      });
    }, 1000)

  }

  const itemsRange = computed(() => {
    if (!state.pagination.rowsNumber) {
      return false;
    }
    const start =
      (state.pagination.page - 1) * state.pagination.rowsPerPage + 1;
    const end = Math.min(
      state.pagination.page * state.pagination.rowsPerPage,
      state.pagination.rowsNumber
    );

    return { start, end };
  });

  watch(
    () => state.search,
    (val) => {
      clearTimeout(timeout.value);
      timeout.value = setTimeout(() => {
        if (!state.query.where) {
          state.query.where = {};
        }
        state.query.where[state.search_key] = val.trim();
        tableRef.value.requestServerInteraction();
      }, 0);
    }
  );

  watch(
    () => state.query.where,
    (val) => {
      clearTimeout(timeout.value);
      timeout.value = setTimeout(() => {
        tableRef.value.requestServerInteraction();
      }, 0);
    },
    { deep: true }
  );

  watch(
    () => state.pagination.sortBy,
    (val) => {
      clearTimeout(timeout.value);
      timeout.value = setTimeout(() => {
        tableRef.value.requestServerInteraction();
      }, 0);
    }
  );

  watch(
    () => state.pagination.descending,
    (val) => {
      clearTimeout(timeout.value);
      timeout.value = setTimeout(() => {
        tableRef.value.requestServerInteraction();
      }, 0);
    }
  );

  onMounted(() => {
    tableRef.value.requestServerInteraction();
    state.search_key_text = state.search_key.replace('orlike:', '').split(',').reduce((acc, curr) => {
      acc.push(t(curr))
      return acc
    }, []).join(', ')
  });

  return {
    onRequest,
    addMore,
    getSelectedString,
    onDeleteRows,
    saveRow,
    updateRowInput,
    itemsRange
  };
};
