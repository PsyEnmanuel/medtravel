import { removeToken } from "src/helpers/auth";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    me: {},
  }),
  actions: {
    setMe(state) {
      this.me = state;
    },
    logOut() {
      this.setMe();
      removeToken();
    },
  },
});
