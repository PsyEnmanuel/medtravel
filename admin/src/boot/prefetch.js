import { boot } from "quasar/wrappers";
import { api } from "src/boot/axios";
import local from "src/helpers/local";
import categories from "src/data/categories";
import path from "src/data/path";
import { ref } from "vue";

export default boot(async ({ app }) => {
  app.provide("$path", path);
  app.config.globalProperties.$path = path;
  // if (local.get("cats")) {
  //   const cats = local.get("cats");
  //   app.provide("$cats", ref(cats));
  //   return;
  // }
  const cats = await api.get("category/children", {
    params: {
      data: categories,
    },
  });
  app.provide("$cats", ref(cats));
  local.set("cats", (data) => {
    if (!data.cats) data.cats = {};
    data.cats = cats
  });
});
