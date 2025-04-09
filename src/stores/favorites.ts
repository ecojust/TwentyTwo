import { defineStore } from "pinia";
import { ref } from "vue";

interface FavoriteItem {
  id: string;
  title: string;
  source: string;
  type: "local" | "plugin";
  thumbnail?: string;
  path?: string;
}

export const useFavoritesStore = defineStore("favorites", () => {
  // 存储收藏项
  const favorites = ref<FavoriteItem[]>([]);

  // 从本地存储加载收藏
  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem("video-favorites");
    if (savedFavorites) {
      try {
        favorites.value = JSON.parse(savedFavorites);
      } catch (e) {
        console.error("加载收藏失败:", e);
      }
    }
  };

  // 保存收藏到本地存储
  const saveFavorites = () => {
    localStorage.setItem("video-favorites", JSON.stringify(favorites.value));
  };

  // 添加收藏
  const addFavorite = (item: FavoriteItem) => {
    if (!isFavorite(item.id)) {
      favorites.value.push(item);
      saveFavorites();
    }
  };

  // 移除收藏
  const removeFavorite = (id: string) => {
    const index = favorites.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      favorites.value.splice(index, 1);
      saveFavorites();
    }
  };

  // 检查是否已收藏
  const isFavorite = (id: string) => {
    return favorites.value.some((item) => item.id === id);
  };

  // 初始化时加载收藏
  loadFavorites();

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
});
