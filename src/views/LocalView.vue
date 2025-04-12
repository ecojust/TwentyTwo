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
            <el-scrollbar wrap-style="height:calc(100vh - 290px);width:100%;">
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

        <!-- <el-tab-pane label="本地视频" name="local">
          <div class="actions">
            <el-button type="primary" @click="openFileDialog" :icon="Folder">
              选择视频文件
            </el-button>
            <el-button
              type="info"
              @click="openFolderDialog"
              :icon="FolderOpened"
            >
              选择视频文件夹
            </el-button>
          </div>

          <el-empty
            v-if="localVideos.length === 0"
            description="暂无本地视频，请选择视频文件或文件夹"
            :image-size="200"
          ></el-empty>

          <el-table v-else :data="localVideos" style="width: 100%" border>
            <el-table-column prop="name" label="文件名" min-width="200">
              <template #default="scope">
                <el-tooltip
                  :content="scope.row.path"
                  placement="top"
                  :show-after="1000"
                >
                  <span>{{ scope.row.name }}</span>
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
                  @click="playLocalVideo(scope.row)"
                  type="primary"
                  size="small"
                  :icon="VideoPlay"
                  plain
                >
                  播放
                </el-button>
                <el-button
                  @click="addToFavorites(scope.row)"
                  type="warning"
                  size="small"
                  :icon="Star"
                  plain
                >
                  收藏
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane> -->

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFavoritesStore } from "../stores/favorites";
// 修改这一行，使用新的插件
import { open } from "@tauri-apps/plugin-dialog";
import {
  Folder,
  FolderOpened,
  VideoPlay,
  Star,
  Delete,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import File from "../tool/file";
import History from "../tool/history";

const router = useRouter();
const favoritesStore = useFavoritesStore();
const activeTab = ref("history");

const localVideos = ref([]);
const favoriteVideos = computed(() => {
  return favoritesStore.favorites.filter((item) => item.type === "local");
});

// 视频文件扩展名
const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".mkv", ".avi"];

// 检查是否为视频文件
function isVideoFile(path) {
  const lowerPath = path.toLowerCase();
  return videoExtensions.some((ext) => lowerPath.endsWith(ext));
}

// 打开文件选择对话框
async function openFileDialog() {
  try {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: "视频文件",
          extensions: videoExtensions.map((ext) => ext.substring(1)),
        },
      ],
    });

    if (selected && Array.isArray(selected)) {
      const newVideos = selected.map((path) => {
        const name = path.split("/").pop() || path;
        return { name, path };
      });

      // 添加到本地视频列表，避免重复
      newVideos.forEach((video) => {
        if (!localVideos.value.some((v) => v.path === video.path)) {
          localVideos.value.push(video);
        }
      });

      ElMessage.success(`已添加 ${newVideos.length} 个视频文件`);
    }
  } catch (error) {
    console.error("选择文件出错:", error);
    ElMessage.error("选择文件失败");
  }
}

// 打开文件夹选择对话框
async function openFolderDialog() {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
    });

    if (selected && typeof selected === "string") {
      // 这里应该使用Tauri API来读取文件夹内容
      // 由于Tauri API限制，这里只是模拟添加一个文件夹条目
      const folderName = selected.split("/").pop() || selected;

      const folderEntry = {
        name: `${folderName} (文件夹)`,
        path: selected,
      };

      if (!localVideos.value.some((v) => v.path === folderEntry.path)) {
        localVideos.value.push(folderEntry);
      }

      ElMessage.success(`已添加文件夹: ${folderName}`);
    }
  } catch (error) {
    console.error("选择文件夹出错:", error);
    ElMessage.error("选择文件夹失败");
  }
}

// 播放本地视频
function playLocalVideo(video) {
  router.push({
    name: "player",
    params: {
      source: "local",
      id: encodeURIComponent(video.path),
    },
    query: {
      title: video.name,
    },
  });
}

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

// 添加到收藏
function addToFavorites(video) {
  favoritesStore.addFavorite({
    id: video.path,
    title: video.name,
    source: "local",
    path: video.path,
    type: "local",
  });

  ElMessage({
    message: `已将 ${video.name} 添加到收藏`,
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
  // 从本地存储中加载收藏视频

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

  .plugin-collapse {
    margin-bottom: 20px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
  }

  .search-form {
    margin: 20px 0;
  }

  .actions {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
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
