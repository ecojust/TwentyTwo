import { createRouter, createWebHistory } from "vue-router";
import SearchView from "../views/SearchView.vue";
import LocalView from "../views/LocalView.vue";
import PluginsView from "../views/PluginsView.vue";
import AboutView from "../views/AboutView.vue";
import SettingView from "../views/SettingView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/local",
    },
    {
      path: "/search",
      name: "search",
      component: SearchView,
    },
    {
      path: "/local",
      name: "local",
      component: LocalView,
    },
    {
      path: "/plugins",
      name: "plugins",
      component: PluginsView,
    },
    {
      path: "/setting",
      name: "setting",
      component: SettingView,
    },
    {
      path: "/about",
      name: "about",
      component: AboutView,
    },
  ],
});

export default router;
