import { boot } from "quasar/wrappers";
import { asyncRoutes } from "src/router/routes";
import { getToken, removeToken } from "src/helpers/auth";
import { api } from "src/boot/axios";
import { useUserStore } from "src/stores/user";
const whiteList = ["login_index", "password_index", "poll_quality"];
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

export default boot(({ app, router }) => {
  const user = useUserStore();
  router.beforeEach(async (to, from, next) => {
    try {
      NProgress.start();
      const isAuthenticated = getToken();

      if (isAuthenticated) {
        if (user.me?.unixroles) {
          NProgress.done();
          next(to.fullpath);
          return;
        }

        const me = await api.get("user/me");
        app.config.globalProperties.$me = me;
        app.provide("$me", me);
        user.setMe(me);
        for (let i = 0; i < asyncRoutes.length; i++) {
          const asyncRoute = asyncRoutes[i];
          if (
            me?.menu.indexOf(asyncRoute.name) !== -1 ||
            me?.unixroles & 1 ||
            asyncRoute.name === "NotFound"
          ) {
            router.addRoute(asyncRoute);
          } else {
            router.removeRoute(asyncRoute.name);
          }
        }

        NProgress.done();
        next({ ...to, replace: true });
      } else if (whiteList.indexOf(to.name) === -1) {
        NProgress.done();
        next({ name: "login_index" });
      } else {
        NProgress.done();
        next();
      }
    } catch (error) {
      removeToken()
    }
  });
});
