<template>
  <div class="local-view">
    <el-card>
      <template #header>
        <div class="view-header">
          <h2>本地资源</h2>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="历史记录" name="history">
          <el-empty
            v-if="history.length === 0"
            description="暂无历史记录"
            :image-size="200"
          ></el-empty>

          <el-row v-else-if="history.length > 0" :gutter="20">
            <el-scrollbar wrap-style="height:calc(100vh - 300px);width:100%;">
              <div
                class="history-item"
                v-for="(result, index) in history"
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
                    <el-tag size="small" effect="light">{{
                      result.score
                    }}</el-tag>
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

                    <div class="time">{{ result.time }}</div>
                  </div>
                </el-card>
              </div>
            </el-scrollbar>
          </el-row>
        </el-tab-pane>

        <el-tab-pane label="已收藏" name="favorites">
          <el-empty
            v-if="favoriteVideos.length === 0"
            description="暂无收藏视频"
            :image-size="200"
          ></el-empty>

          <el-table v-else :data="favoriteVideos" style="width: 100%" border>
            <el-table-column prop="title" label="标题" min-width="200">
              <template #default="scope">
                <el-tooltip
                  :content="scope.row.path"
                  placement="top"
                  :show-after="1000"
                >
                  <span>{{ scope.row.title }}</span>
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column prop="path" label="路径" min-width="300">
              <template #default="scope">
                <el-text class="video-path" truncated>{{
                  scope.row.path
                }}</el-text>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button
                  @click="playFavoriteVideo(scope.row)"
                  type="primary"
                  size="small"
                  :icon="VideoPlay"
                  plain
                >
                  播放
                </el-button>
                <el-button
                  @click="removeFromFavorites(scope.row)"
                  type="danger"
                  size="small"
                  :icon="Delete"
                  plain
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      class="player-dialog"
      :close-on-click-modal="false"
      v-model="showPlayer"
      height="400px"
      fullscreen
      :show-close="false"
    >
      <VideoPlayer
        v-if="showPlayer"
        :video-source="playerSource"
        :video-title="playerTitle"
        :video-type="playerType"
        @onClose="showPlayer = false"
      ></VideoPlayer>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFavoritesStore } from "../stores/favorites";
import { VideoPlay, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import History from "../tool/history";
import VideoPlayer from "../components/VideoPlayer.vue";

const router = useRouter();
const favoritesStore = useFavoritesStore();
const activeTab = ref("history");

const showPlayer = ref(false);
const playerSource = ref("");
const playerType = ref("");
const playerTitle = ref("");

const favoriteVideos = computed(() => {
  return favoritesStore.favorites.filter((item) => item.type === "local");
});

// 播放收藏视频
function playFavoriteVideo(video) {
  router.push({
    name: "player",
    params: {
      source: video.source,
      id: encodeURIComponent(video.id),
    },
    query: {
      title: video.title,
    },
  });
}

// 播放历史视频
function playVideo(video) {
  console.log("playVideo", video);
  playerSource.value = video.play_url;
  playerType.value = video.type;
  playerTitle.value = video.title;
  showPlayer.value = true;
}

// 添加到收藏
function addToFavorites(video) {
  favoritesStore.addFavorite({
    id: video.id || video.path,
    title: video.title || video.name,
    source: video.source || "local",
    path: video.path,
    type: "local",
  });

  ElMessage({
    message: `已将 ${video.title || video.name} 添加到收藏`,
    type: "success",
    duration: 2000,
  });
}

// 从收藏中移除
function removeFromFavorites(video) {
  favoritesStore.removeFavorite(video.id);

  ElMessage({
    message: `已将 ${video.title} 从收藏中移除`,
    type: "success",
    duration: 2000,
  });
}

const history = ref([]);

onMounted(async () => {
  history.value = await History.getHistory();
});
</script>

<style lang="less">
.local-view {
  width: 100%;

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .history-item {
    width: 270px;
    display: inline-block;
    margin: 5px;
  }

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
    justify-content: flex-start;
    margin-top: 15px;
  }

  .time {
    width: 100%;
    font-size: 0.8rem;
    color: var(--el-text-color-secondary);
    text-align: right;
    margin-top: 8px;
    padding: 0;
  }

  .video-path {
    font-size: 0.9rem;
    color: var(--text-secondary);
    max-width: 300px;
  }
}
</style>
