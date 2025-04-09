<template>
  <div class="local-view">
    <el-card>
      <template #header>
        <div class="view-header">
          <h2>本地资源</h2>
        </div>
      </template>

      <div class="actions">
        <el-button type="primary" @click="openFileDialog" :icon="Folder">
          选择视频文件
        </el-button>
        <el-button type="info" @click="openFolderDialog" :icon="FolderOpened">
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
            <el-text class="video-path" truncated>{{ scope.row.path }}</el-text>
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
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useFavoritesStore } from "../stores/favorites";
// 修改这一行，使用新的插件
import { open } from "@tauri-apps/plugin-dialog";
import { Folder, FolderOpened, VideoPlay, Star } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const router = useRouter();
const favoritesStore = useFavoritesStore();

const localVideos = ref([]);

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
</script>

<style scoped>
.local-view {
  width: 100%;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.video-path {
  font-size: 0.9rem;
  color: var(--text-secondary);
  max-width: 300px;
}
</style>
