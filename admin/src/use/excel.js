import { useQuasar } from "quasar";
import { utils, writeFile, write } from "xlsx";
import { useI18n } from "vue-i18n";

const downloadxls = (data, filename) => {
  let ws = utils.json_to_sheet(data);
  let wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "sheet");
  writeFile(wb, `${filename}.xlsx`);
};

function filterObjectsByLabels(rows, columns) {
  // Extract the list of labels from the labels array
  const columnList = columns.map((item) => item.label);

  // Filter the objects based on the extracted labels
  return rows.map((obj) => {
    let filteredObj = {};
    for (let key in obj) {
      if (columnList.includes(key)) {
        filteredObj[key] = obj[key];
      }
    }
    return filteredObj;
  });
}

export const useExcel = () => {
  const $q = useQuasar();
  const { t } = useI18n()

  function exportTable({ rows, columns, filename }) {
    if (rows.length) {

      // Extract the list of labels from the labels array
      const columnList = columns.map((item) => item.label);

      // Filter the objects based on the extracted labels
      const _rows = rows.map((obj) => {
        let filteredObj = {};
        for (let key in obj) {
          if (columnList.includes(key)) {
            filteredObj[t(key)] = obj[key];
          }
        }
        return filteredObj;
      });

      downloadxls(_rows, filename);

      $q.notify({
        color: "primary-light",
        message: "Archivo Excel Descargado.",
        icon: "task_alt",
      });
    }
  }

  return {
    exportTable,
  };
};
