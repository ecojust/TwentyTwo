<template>
  <div class="favorites-view">
    <el-card>
      <template #header>
        <div class="view-header">
          <h2>我的收藏</h2>
          <el-button
            v-if="favorites.length > 0"
            type="danger"
            size="small"
            @click="clearAllFavorites"
            plain
            :icon="Delete"
          >
            清空收藏
          </el-button>
        </div>
      </template>

      <el-empty
        v-if="favorites.length === 0"
        description="暂无收藏内容，可以在搜索或本地资源页面添加收藏"
        :image-size="200"
      ></el-empty>

      <el-table v-else :data="favorites" style="width: 100%" border>
        <el-table-column
          prop="title"
          label="标题"
          min-width="200"
        ></el-table-column>
        <el-table-column prop="source" label="来源" width="180">
          <template #default="scope">
            <el-tag
              size="small"
              :type="getSourceType(scope.row.source)"
              effect="light"
            >
              {{ scope.row.source }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              @click="playVideo(scope.row)"
              type="primary"
              size="small"
              :icon="VideoPlay"
              plain
            >
              播放
            </el-button>
            <el-button
              @click="removeFavorite(scope.row.id)"
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
    </el-card>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useFavoritesStore } from "../stores/favorites";
import { VideoPlay, Delete } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";

const router = useRouter();
const favoritesStore = useFavoritesStore();

const favorites = computed(() => favoritesStore.favorites);

// 根据来源获取标签类型
function getSourceType(source) {
  if (source === "local") return "success";
  if (source === "示例插件") return "warning";
  return "info";
}

// 播放视频
function playVideo(video) {
  router.push({
    name: "player",
    params: {
      source: video.source,
      id: video.id,
    },
    query: {
      title: video.title,
    },
  });
}

// 移除收藏
function removeFavorite(id) {
  ElMessageBox.confirm("确定要移除这个收藏吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      favoritesStore.removeFavorite(id);
      ElMessage({
        type: "success",
        message: "已移除收藏",
      });
    })
    .catch(() => {
      // 用户取消操作
    });
}

// 清空所有收藏
function clearAllFavorites() {
  if (favorites.value.length === 0) return;

  ElMessageBox.confirm("确定要清空所有收藏吗？此操作不可恢复！", "警告", {
    confirmButtonText: "确定清空",
    cancelButtonText: "取消",
    type: "error",
  })
    .then(() => {
      // 这里需要在favoritesStore中添加clearAll方法
      favorites.value.forEach((item) => {
        favoritesStore.removeFavorite(item.id);
      });
      ElMessage({
        type: "success",
        message: "已清空所有收藏",
      });
    })
    .catch(() => {
      // 用户取消操作
    });
}
</script>

<style scoped>
.favorites-view {
  width: 100%;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
