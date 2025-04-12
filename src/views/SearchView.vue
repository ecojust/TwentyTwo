<template>
  <div class="search-view">
    <el-card>
      <template #header>
        <div class="view-header">
          <h2>视频搜索</h2>
          <p>当前插件：{{ activePlugin }}</p>
        </div>
        <div class="status">{{ status }}</div>
      </template>

      <!-- <el-collapse class="plugin-collapse">
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
      </el-collapse> -->

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
        <el-scrollbar wrap-style="height:calc(100vh - 330px);width:100%;">
          <div
            class="video-item"
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
          </div>
        </el-scrollbar>
      </el-row>

      <div v-if="isSearching" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
    </el-card>

    <el-dialog
      class="player-dialog"
      :close-on-click-modal="false"
      v-model="showPlayer"
      height="400px"
      fullscreen
      :title="playerTitle"
    >
      <div ref="playerContainer" class="player-container"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { usePluginsStore } from "../stores/plugins";
import { useFavoritesStore } from "../stores/favorites";
import { invoke } from "@tauri-apps/api/core";
import Plugin from "../tool/plugin";
import Player from "../tool/player";
import File from "../tool/file";

const router = useRouter();
const pluginsStore = usePluginsStore();
const favoritesStore = useFavoritesStore();

// 搜索状态
const searchQuery = ref("成龙");
const isSearching = ref(false);
const hasSearched = ref(false);
const searchResults = ref([]);

const PlayerDom = ref(null);
const showPlayer = ref(false);
const hhtml = ref("");

const activePlugin = ref("");

// 搜索视频
async function searchVideos() {
  if (!searchQuery.value.trim()) return;
  status.value = "正在搜索...";
  console.log("开始搜索");
  isSearching.value = true;
  searchResults.value = [];

  try {
    const res = await Plugin.search(searchQuery.value);
    if (res.success) {
      searchResults.value = res.data;
      status.value = "搜索结束，共搜索到 " + res.data.length + " 条结果";
    }
  } catch (error) {
    console.error("搜索出错:", error);
    status.value = "搜索出错：" + error;
  } finally {
    isSearching.value = false;
    hasSearched.value = true;
  }
}

const playerContainer = ref(null); // 添加对播放器容器的引用
const playerTitle = ref("");
const status = ref("输入关键字开始查询");
// 播放视频
async function playVideo(video) {
  if (!video.play_url) {
    const res = await Plugin.getPlayUrl(video.href, (msg) => {
      status.value = msg;
    });
    if (res.success) {
      video.play_url = res.data;
      video.type = res.type;
    }
  }
  await File.pushHistory(video);
  showPlayer.value = true;
  status.value = "等待操作...";

  await nextTick();
  playerTitle.value = video.name;
  if (playerContainer.value) {
    playerContainer.value.innerHTML = "";
    switch (video.type) {
      case "m3u8":
        const playerElement = Player.m3u8Parser(video.play_url);
        playerContainer.value.appendChild(playerElement);
        break;
    }
  }
}

// 监听对话框关闭事件，清理播放器
watch(showPlayer, (newVal) => {
  if (!newVal && playerContainer.value) {
    playerContainer.value.innerHTML = "";
  }
});

// 添加到收藏
function addToFavorites(video) {
  favoritesStore.addFavorite(video);
}

onMounted(async () => {
  await Plugin.setPlugin();
  if (!Plugin._currentPlugin) {
    status.value = "请先安装插件";
  } else {
    activePlugin.value = Plugin._currentPlugin.name;
    status.value = "输入关键字开始查询";
  }
});
</script>

<style lang="less">
.search-view {
  width: 100%;

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin: 20px 0;
  }

  .video-item {
    width: 270px;
    display: inline-block;
    margin: 5px;

    .video-card {
      margin-bottom: 20px;
      transition: transform 0.3s;
      border-radius: 8px;
      overflow: hidden;

      &:hover {
        transform: translateY(-5px);
      }
    }

    .video-thumbnail {
      height: 180px;
      overflow: hidden;
    }

    .video-info {
      padding: 14px;

      h3 {
        margin: 0 0 10px;
        font-size: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    .video-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
    }
  }
}

.player-dialog {
  position: relative;
  
  .el-dialog__header {
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - 40px);
    z-index: 90;
    padding: 20px !important;
    
    button {
      i {
        transition: all 0.3s;
        font-weight: 900;
        
        &:hover {
          filter: drop-shadow(0 0 20px #24c8db);
          transform: scale(1.5);
        }
      }
    }
  }
  
  .el-dialog__body {
    height: 100%;
    
    .player-container {
      height: 100%;
    }
  }
}

.loading {
  padding: 20px;
}
</style>
