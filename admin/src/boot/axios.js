import { boot } from "quasar/wrappers";
import axios from "axios";
import { getToken } from "src/helpers/auth";
const api = axios.create({ baseURL: process.env.API, timeout: 0 });
import { Notify } from "quasar";
export default boot(({ app }) => {
  api.interceptors.request.use(
    (config) => {
      if (getToken()) {
        config.headers["authorization"] = getToken();
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      const { data } = response;
      return data;
    },
    (error) => {
      console.log(error.response);
      if (error.response) {
        Notify.create({
          type: 'warning',
          message: error.response.data.description,
        });

        return Promise.reject(error.response.data);
      }
      return Promise.reject();
    }
  );
  app.provide("$api", api);
});

export { api };
