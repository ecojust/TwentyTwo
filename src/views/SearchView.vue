<template>
  <div class="search-view">
    <el-card>
      <template #header>
        <div class="view-header">
          <h2>视频搜索</h2>
        </div>
      </template>

      <el-collapse class="plugin-collapse">
        <el-collapse-item title="搜索源选择" name="1">
          <el-checkbox-group v-model="selectedPlugins">
            <el-checkbox
              v-for="plugin in activePlugins"
              :key="plugin.id"
              :label="plugin.id"
            >
              {{ plugin.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-collapse-item>
      </el-collapse>

      <div class="search-form">
        <el-input
          v-model="searchQuery"
          placeholder="输入搜索关键词..."
          @keyup.enter="searchVideos"
          clearable
        >
          <template #append>
            <el-button
              @click="searchVideos"
              :loading="isSearching"
              type="primary"
            >
              {{ isSearching ? "搜索中..." : "搜索" }}
            </el-button>
          </template>
        </el-input>
      </div>

      <el-empty
        v-if="hasSearched && searchResults.length === 0"
        description="未找到相关视频，请尝试其他关键词或选择更多搜索源"
        :image-size="200"
      ></el-empty>

      <el-row v-else-if="searchResults.length > 0" :gutter="20">
        <el-col
          v-for="(result, index) in searchResults"
          :key="index"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card
            class="video-card"
            :body-style="{ padding: '0px' }"
            shadow="hover"
          >
            <div class="video-thumbnail">
              <el-image
                :src="result.thumbnail || '/placeholder.jpg'"
                :alt="result.title"
                fit="cover"
              ></el-image>
            </div>
            <div class="video-info">
              <h3>{{ result.title }}</h3>
              <el-tag size="small" effect="light">{{ result.score }}</el-tag>
              <span>{{ result.text }}</span>
              <div class="video-actions">
                <el-button
                  @click="playVideo(result)"
                  type="primary"
                  size="small"
                  plain
                >
                  播放
                </el-button>
                <el-button
                  @click="addToFavorites(result)"
                  type="warning"
                  size="small"
                  plain
                >
                  收藏
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div v-if="isSearching" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
    </el-card>

    <div class="html">{{ hhtml }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePluginsStore } from "../stores/plugins";
import { useFavoritesStore } from "../stores/favorites";
import { invoke } from "@tauri-apps/api/core";
import Plugin from "../tool/plugin";

const router = useRouter();
const pluginsStore = usePluginsStore();
const favoritesStore = useFavoritesStore();

// 搜索状态
const searchQuery = ref("成龙");
const isSearching = ref(false);
const hasSearched = ref(false);
const searchResults = ref([]);

const hhtml = ref("");

// 插件选择
const activePlugins = computed(() => pluginsStore.activePlugins);
const selectedPlugins = ref([]);

// 初始化选中所有活跃插件
if (selectedPlugins.value.length === 0 && activePlugins.value.length > 0) {
  selectedPlugins.value = activePlugins.value.map((plugin) => plugin.id);
}

// 搜索视频
async function searchVideos() {
  if (!searchQuery.value.trim() || selectedPlugins.value.length === 0) return;

  isSearching.value = true;
  searchResults.value = [];

  try {
    // 从每个选中的插件中搜索
    // const searchPromises = selectedPlugins.value.map((pluginId) => {
    //   const plugin = activePlugins.value.find((p) => p.id === pluginId);
    //   if (!plugin) return Promise.resolve([]);

    //   // 这里应该调用插件的搜索方法
    //   return pluginsStore.searchWithPlugin(pluginId, searchQuery.value);
    // });

    const res = await Plugin.search(searchQuery.value);
    if (res.success) {
      searchResults.value = res.data;
    }
  } catch (error) {
    console.error("搜索出错:", error);
  } finally {
    isSearching.value = false;
    hasSearched.value = true;
  }
}

// 播放视频
async function playVideo(video) {
  // router.push({
  //   name: "player",
  //   params: {
  //     source: video.source,
  //     id: video.id,
  //   },
  //   query: {
  //     title: video.title,
  //   },
  // });

  const res = await Plugin.getPlayUrl(video.href);
  if (res.success) {
    const videoURL = res.data;
    console.log(videoURL);
  }
}

// 添加到收藏
function addToFavorites(video) {
  favoritesStore.addFavorite(video);
}

onMounted(async () => {
  Plugin.setPlugin({
    search: {
      url: "https://www.x139.cn/search.php?searchword={keyword}",
      description: "x139搜索",
    },
  });
});
</script>

<style scoped>
.search-view {
  width: 100%;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plugin-collapse {
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.search-form {
  margin: 20px 0;
}

.video-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
  border-radius: 8px;
  overflow: hidden;
}

.video-card:hover {
  transform: translateY(-5px);
}

.video-thumbnail {
  height: 180px;
  overflow: hidden;
}

.video-info {
  padding: 14px;
}

.video-info h3 {
  margin: 0 0 10px;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.video-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.loading {
  padding: 20px;
}
</style>
