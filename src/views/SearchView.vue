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

      <!-- 搜索表单 -->
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

      <!-- 搜索结果展示区域 -->
      <el-empty
        v-if="!isSearching && hasSearched && searchResults.length === 0"
        description="未找到相关视频，请尝试其他关键词或选择更多搜索源"
        :image-size="200"
      ></el-empty>

      <el-row v-else-if="searchResults.length > 0" :gutter="20">
        <el-scrollbar wrap-style="height:calc(100vh - 340px);width:100%;">
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
                <!-- 添加居中的播放图标 -->
                <div class="play-icon-overlay" @click="playVideo(result)">
                  <el-icon class="play-icon"><VideoPlay /></el-icon>
                </div>
              </div>
              <div class="video-info">
                <h3>{{ result.title }}</h3>
                <el-tag size="small" effect="light">{{ result.score }}</el-tag>
                <span>{{ result.text }}</span>
                <!-- 移除原来的播放按钮
                <div class="video-actions">
                  <el-button
                    @click="playVideo(result)"
                    type="primary"
                    size="small"
                    plain
                  >
                    播放
                  </el-button>
                </div>
                -->
              </div>
            </el-card>
          </div>
        </el-scrollbar>
      </el-row>

      <!-- 加载状态 -->
      <div v-if="isSearching" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
    </el-card>

    <!-- 视频播放器对话框 -->
    <el-dialog
      class="player-dialog"
      :close-on-click-modal="false"
      v-model="showPlayer"
      height="400px"
      fullscreen
      :title="playerTitle"
      :show-close="false"
    >
      <VideoPlayer
        v-if="showPlayer"
        :video-sources="playerSource"
        :video-title="playerTitle"
        :video-type="playerType"
        @onClose="showPlayer = false"
      ></VideoPlayer>
    </el-dialog>
  </div>
</template>

<script setup>
// 导入依赖
import { ref, onMounted, nextTick, onActivated } from "vue";
import { useRouter } from "vue-router";
import { usePluginsStore } from "../stores/plugins";
import { useFavoritesStore } from "../stores/favorites";
import { Close, VideoPlay } from "@element-plus/icons-vue";
import VideoPlayer from "../components/VideoPlayer.vue";

// 导入工具类
import Plugin from "../tool/plugin";
import History from "../tool/history";

// 初始化 store
const router = useRouter();
const pluginsStore = usePluginsStore();
const favoritesStore = useFavoritesStore();

// 状态管理
const status = ref("输入关键字开始查询");
const activePlugin = ref("");

// 搜索相关状态
const searchQuery = ref("成龙");
const isSearching = ref(false);
const hasSearched = ref(false);
const searchResults = ref([]);

// 播放器相关状态
const showPlayer = ref(false);
const playerSource = ref("");
const playerType = ref("");
const playerTitle = ref("");

/**
 * 搜索视频
 */
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
      status.value = `搜索结束，共搜索到 ${res.data.length} 条结果`;
    }
  } catch (error) {
    console.error("搜索出错:", error);
    status.value = `搜索出错：${error}`;
  } finally {
    isSearching.value = false;
    hasSearched.value = true;
  }
}

/**
 * 播放视频
 * @param {Object} video 视频对象
 */
async function playVideo(video) {
  // 如果没有播放链接，先获取
  if (!video.video_urls || video.video_urls.length === 0) {
    const res = await Plugin.getPlayUrl(video.href, (msg) => {
      status.value = msg;
    });
    console.log("获取播放链接", res);

    if (res.success) {
      if (!res.data) {
        status.value = `获取播放链接失败：值为空`;
        return;
      }
      video.video_urls = res.data;
    } else {
      //
      status.value = res.message;
      return;
    }
  }

  // 添加到历史记录
  await History.pushHistory(video);
  status.value = "等待操作...";

  // 设置播放器参数并显示
  playerTitle.value = video.title;
  playerSource.value = video.video_urls;
  // playerType.value = video.type;
  showPlayer.value = true;
  await nextTick();
}

/**
 * 添加到收藏
 * @param {Object} video 视频对象
 */
function addToFavorites(video) {
  favoritesStore.addFavorite(video);
}

// onActivated(async () => {
//   await Plugin.setPlugin();
//   if (!Plugin._currentPlugin) {
//     status.value = "请先安装插件";
//   } else {
//     activePlugin.value = Plugin._currentPlugin.name;
//     status.value = "输入关键字开始查询";
//   }
// });

// 生命周期钩子
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

  // 头部样式
  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin: 20px 0;
  }

  // 视频列表样式
  .video-item {
    width: 260px;
    display: inline-block;
    margin: 10px;

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
      position: relative;

      .play-icon-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.3);
        opacity: 0;
        transition: opacity 0.3s;
        cursor: pointer;

        &:hover {
          opacity: 1;
        }

        .play-icon {
          font-size: 48px;
          color: #fff;
          filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.5));
        }
      }
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

  // 加载状态样式
  .loading {
    padding: 20px;
  }
}

// 播放器对话框样式
.player-dialog {
  position: relative;

  .el-dialog__header {
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - 40px);
    z-index: 90;
    padding: 15px 20px !important;

    .tv-style-title {
      display: inline-block;
      font-size: 18px;
      font-weight: 500;
      color: #ffffff;
      background-color: rgba(0, 0, 0, 0.5);
      padding: 6px 12px;
      border-radius: 4px;
      margin-right: 10px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      letter-spacing: 1px;
      backdrop-filter: blur(2px);
      border-left: 3px solid #409eff;
    }

    .player-header-close {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 18px;
      background-color: rgba(255, 255, 255, 0.2);
      border: none;
      color: #ffffff;
      opacity: 0.7;

      .el-icon {
        transition: all 0.2s ease;
      }

      &:hover {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.3);

        .el-icon {
          transform: scale(1.1);
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
</style>
