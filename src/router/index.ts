import { createRouter, createWebHistory } from "vue-router";
import SearchView from "../views/SearchView.vue";
import LocalView from "../views/LocalView.vue";
import FavoritesView from "../views/FavoritesView.vue";
import PluginsView from "../views/PluginsView.vue";
import VideoPlayer from "../views/VideoPlayer.vue";
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
      path: "/favorites",
      name: "favorites",
      component: FavoritesView,
    },
    {
      path: "/plugins",
      name: "plugins",
      component: PluginsView,
    },
    {
      path: "/player/:source/:id",
      name: "player",
      component: VideoPlayer,
      props: true,
    },
    {
      path: "/about",
      name: "about",
      component: AboutView,
    },
  ],
});

export default router;
