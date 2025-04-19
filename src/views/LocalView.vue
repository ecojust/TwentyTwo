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
                    <!-- 添加居中的播放图标 -->
                    <div class="play-icon-overlay" @click="playVideo(result)">
                      <el-icon class="play-icon"><VideoPlay /></el-icon>
                    </div>
                  </div>
                  <div class="video-info">
                    <h3>{{ result.title }}</h3>
                    <span>{{ result.text }}</span>
                    <!-- 移除原来的播放按钮，只保留收藏按钮 -->
                    <div class="video-actions">
                      <el-button
                        @click="addToCollection(result)"
                        type="warning"
                        size="small"
                        plain
                      >
                        加入合集
                      </el-button>
                    </div>

                    <div class="time">{{ result.time }}</div>
                  </div>
                </el-card>
              </div>
            </el-scrollbar>
          </el-row>
        </el-tab-pane>

        <el-tab-pane label="我的合集" name="favorites">
          <el-empty
            v-if="collection.length === 0"
            @click="addCollection"
            description="暂无合集，点击添加"
            :image-size="200"
          ></el-empty>

          <el-row v-else :gutter="20">
            <el-scrollbar wrap-style="height:calc(100vh - 300px);width:100%;">
              <div
                class="history-item"
                v-for="(coll, index) in collection"
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
                      :src="coll.thumbnail || '/placeholder.jpg'"
                      :alt="coll.title"
                      fit="cover"
                    ></el-image>
                    <!-- 添加居中的播放图标 -->
                  </div>
                  <div class="video-info">
                    <h3>{{ coll.title }}</h3>
                    <el-text class="video-path" truncated>{{
                      coll.id
                    }}</el-text>
                    <div class="video-actions"></div>
                  </div>
                </el-card>
              </div>
              <div class="history-item-add" :xs="24" :sm="12" :md="8" :lg="6">
                <el-card
                  class="video-card add-collection-card"
                  :body-style="{ padding: '0px' }"
                  shadow="hover"
                  @click="addCollection"
                >
                  <div class="video-thumbnail add-collection-thumbnail">
                    <el-icon class="add-icon"><Plus /></el-icon>
                  </div>
                </el-card>
              </div>
            </el-scrollbar>
          </el-row>
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

    <!-- 添加合集对话框 -->
    <el-dialog
      v-model="showCollectionDialog"
      title="添加新合集"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="collectionForm" label-width="80px">
        <el-form-item label="合集名称" required>
          <el-input
            v-model="collectionForm.name"
            placeholder="请输入合集名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="封面图">
          <el-upload
            class="cover-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleCoverChange"
          >
            <div v-if="collectionForm.coverUrl" class="cover-preview-container">
              <img :src="collectionForm.coverUrl" class="cover-preview" />
              <div class="cover-delete-icon" @click.stop="removeCoverImage">
                <el-icon><Delete /></el-icon>
              </div>
            </div>
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="cover-tip">默认会以合集内容自动生成封面</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCollectionDialog = false">取消</el-button>
          <el-button type="primary" @click="saveCollection">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFavoritesStore } from "../stores/favorites";
import { VideoPlay, Delete, Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import History from "../tool/history";
import Collection from "../tool/collection";
import Generater from "../tool/generater";

import VideoPlayer from "../components/VideoPlayer.vue";

const router = useRouter();
const favoritesStore = useFavoritesStore();
const activeTab = ref("history");

const showPlayer = ref(false);
const playerSource = ref("");
const playerType = ref("");
const playerTitle = ref("");

// 播放合集视频
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
async function addToCollection(video) {
  // favoritesStore.addFavorite({
  //   id: video.id || video.path,
  //   title: video.title || video.name,
  //   source: video.source || "local",
  //   path: video.path,
  //   type: "local",
  // });

  await Collection.pushVideo2Collection("", video);

  ElMessage({
    message: `已将 ${video.title || video.name} 添加到合集`,
    type: "success",
    duration: 2000,
  });
}

// 从合集中移除
function removeFromCollection(video) {
  favoritesStore.removeFavorite(video.id);

  ElMessage({
    message: `已将 ${video.title} 从合集中移除`,
    type: "success",
    duration: 2000,
  });
}

// 添加合集相关变量
const showCollectionDialog = ref(false);
const collectionForm = ref({
  name: "",
  coverUrl: "",
  coverFile: null,
});

// 添加合集函数
function addCollection() {
  showCollectionDialog.value = true;
  collectionForm.value = {
    name: "",
    coverUrl: "",
    coverFile: null,
  };
}

// 处理封面图片变更
function handleCoverChange(file) {
  const isImage = file.raw.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("只能上传图片文件!");
    return;
  }

  // 限制文件大小为 2MB
  const isLt2M = file.size / 1024 / 1024 < 5;
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB!");
    return;
  }

  collectionForm.value.coverFile = file.raw;
  collectionForm.value.coverUrl = URL.createObjectURL(file.raw);
}

// 删除封面图片
function removeCoverImage(e) {
  e.stopPropagation(); // 阻止事件冒泡
  collectionForm.value.coverFile = null;
  collectionForm.value.coverUrl = "";

  // 如果有创建的对象URL，需要释放它
  if (
    collectionForm.value.coverUrl &&
    collectionForm.value.coverUrl.startsWith("blob:")
  ) {
    URL.revokeObjectURL(collectionForm.value.coverUrl);
  }
}

// 保存合集
async function saveCollection() {
  if (!collectionForm.value.name.trim()) {
    ElMessage.warning("请输入合集名称");
    return;
  }

  // 生成基于标题和当前时间的唯一ID
  const timestamp = new Date().getTime();
  const uniqueId = Generater.generateName(
    `${collectionForm.value.name}-${timestamp}`
  );

  // 创建一个新合集
  const newCollection = {
    id: uniqueId,
    title: collectionForm.value.name,
    coverUrl: collectionForm.value.coverUrl,
    videos: [],
  };
  await Collection.pushCollection(`${uniqueId}.json`, newCollection);
  collection.value = await Collection.getCollections();

  ElMessage({
    message: `已创建合集: ${collectionForm.value.name}`,
    type: "success",
    duration: 2000,
  });

  showCollectionDialog.value = false;
}

const history = ref([]);
const collection = ref([]);

onMounted(async () => {
  history.value = await History.getHistory();
  collection.value = await Collection.getCollections();
  console.log("history", history.value);
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
    width: 260px;
    display: inline-block;
    margin: 10px;
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

  .history-item-add {
    width: 260px;
    display: inline-block;
    margin: 10px;
    vertical-align: top;
    .video-thumbnail {
      height: 270px;
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

  .add-collection-thumbnail {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--el-color-info-light-9);

    .add-icon {
      font-size: 48px;
      color: var(--el-color-primary);
    }
  }

  .add-collection-card {
    cursor: pointer;
  }

  .cover-uploader {
    width: 178px;
    height: 178px;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }

    .cover-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .cover-preview-container {
      position: relative;
      width: 178px;
      height: 178px;

      .cover-preview {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .cover-delete-icon {
        position: absolute;
        top: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;

        &:hover {
          background-color: rgba(220, 53, 69, 0.8);
        }
      }
    }
  }

  .cover-tip {
    width: 100%;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    margin-top: 8px;
  }
}
</style>
