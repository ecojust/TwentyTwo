import { createRouter, createWebHistory } from "vue-router";
import SearchView from "../views/SearchView.vue";
import LocalView from "../views/LocalView.vue";
import PluginsView from "../views/PluginsView.vue";
import AboutView from "../views/AboutView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/search",
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
      path: "/about",
      name: "about",
      component: AboutView,
    },
  ],
});

export default router;
