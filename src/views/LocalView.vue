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
                  @click="openCollection(coll)"
                >
                  <div class="video-thumbnail">
                    <el-image
                      :src="coll.coverUrl || '/placeholder.jpg'"
                      :alt="coll.title"
                      fit="cover"
                    ></el-image>
                    <!-- 添加居中的播放图标 -->
                  </div>
                  <div class="video-info">
                    <h3>{{ coll.title }} ({{ coll.videos.length }})</h3>
                    <el-text class="video-path" truncated>{{
                      coll.id
                    }}</el-text>
                    <div class="video-actions">
                      <!-- <el-button @click.stop="generateCover(coll)"
                        >生成封面</el-button
                      > -->
                    </div>
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
        :video-sources="playerSource"
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
        <el-form-item label="名称" required>
          <el-input
            v-model="collectionForm.title"
            placeholder="请输入合集名称"
          ></el-input>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="collectionForm.description"
            placeholder="请输入合集描述"
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

    <el-dialog
      v-model="showSelectCollectionDialog"
      title="选择合集"
      width="30%"
      :close-on-click-modal="false"
      class="select-collection-dialog"
    >
      <el-scrollbar wrap-style="height:300px">
        <el-radio-group v-model="selectedCollection">
          <div class="collection-select-list">
            <el-radio
              v-for="(coll, index) in collection"
              :key="index"
              :label="coll.id"
              class="collection-select-item"
            >
              <div class="collection-select-content">
                <el-image
                  class="collection-thumbnail"
                  :src="coll.coverUrl || '/placeholder.jpg'"
                  fit="cover"
                ></el-image>
                <span class="collection-title">{{ coll.title }}</span>
              </div>
            </el-radio>
          </div>
        </el-radio-group>
      </el-scrollbar>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSelectCollectionDialog = false"
            >取消</el-button
          >
          <el-button type="primary" @click="confirmAddToCollection"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
    <!-- 添加查看合集内容的对话框 -->
    <el-dialog
      v-model="showCollectionVideosDialog"
      :title="currentCollection ? currentCollection.title : '合集内容'"
      width="70%"
      class="collection-videos-dialog"
    >
      <el-empty
        v-if="!currentCollection || currentCollection.videos.length === 0"
        description="该合集暂无视频"
        :image-size="200"
      ></el-empty>

      <el-scrollbar
        v-else
        wrap-style="height:calc(100vh - 500px);width:calc(100% - 0px);"
      >
        <div
          class="history-item"
          v-for="(video, index) in currentCollection.videos"
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
                :src="video.thumbnail || '/placeholder.jpg'"
                :alt="video.title"
                fit="cover"
              ></el-image>
              <div class="play-icon-overlay" @click="playVideo(video)">
                <el-icon class="play-icon"><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="video-info">
              <h3>{{ video.title }}</h3>
              <span>{{ video.text }}</span>
              <div class="video-actions">
                <el-button
                  @click.stop="
                    removeFromCollection(video, currentCollection.id)
                  "
                  type="danger"
                  size="small"
                  plain
                >
                  移除
                </el-button>
              </div>
              <div class="time">{{ video.time }}</div>
            </div>
          </el-card>
        </div>
      </el-scrollbar>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCollectionVideosDialog = false"
            >关闭</el-button
          >
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

import { DEFAULT_COLLECTION_COVER } from "../const/const";

const router = useRouter();
const favoritesStore = useFavoritesStore();
const activeTab = ref("history");

const showPlayer = ref(false);
const playerSource = ref("");
const playerType = ref("");
const playerTitle = ref("");

// 播放历史视频
function playVideo(video) {
  console.log("playVideo", video);
  playerSource.value = video.video_urls || [];
  playerType.value = video.type;
  playerTitle.value = video.title;
  showPlayer.value = true;
}

// 添加合集相关变量
const showCollectionDialog = ref(false);
const collectionForm = ref({
  title: "",
  description: "",
  coverUrl: "",
});

// 添加选择合集对话框相关变量
const showSelectCollectionDialog = ref(false);
const selectedCollection = ref(null);
const videoToAdd = ref(null);

async function addToCollection(video) {
  videoToAdd.value = video;
  showSelectCollectionDialog.value = true;
}

async function confirmAddToCollection() {
  if (!selectedCollection.value) {
    ElMessage.warning("请选择一个合集");
    return;
  }
  if (!videoToAdd.value) {
    ElMessage.warning("没有要添加的视频");
    return;
  }

  console.log("selectedCollection", selectedCollection.value);
  console.log("videoToAdd", videoToAdd.value);
  const collectionId = selectedCollection.value;
  const video = videoToAdd.value;
  const res = await Collection.pushVideo2Collection(collectionId, video);
  if (!res.success) {
    ElMessage.warning(res.message);
  } else {
    ElMessage.success("添加成功");
  }
  showSelectCollectionDialog.value = false;
  collection.value = await Collection.getCollections();
}

const removeFromCollection = async (video, collectionId) => {
  const res = await Collection.removeVideoFromCollection(collectionId, video);
  collection.value = await Collection.getCollections();
  const res2 = await Collection.getCollection(collectionId);
  if (!res.success) {
    ElMessage.warning(res.message);
  } else {
    currentCollection.value = res2.data;
  }
};
// 添加合集函数
function addCollection() {
  showCollectionDialog.value = true;
  collectionForm.value = {
    title: "",
    description: "",
    coverUrl: DEFAULT_COLLECTION_COVER,
  };
}

const generateCover = async (coll) => {
  const thumbnails = coll.videos.map((video) => video.thumbnail);
  const cover = await Generater.generateThumbnailCloud(thumbnails);
  coll.coverUrl = cover;
  await Collection.updateCollection(coll);
  collection.value = await Collection.getCollections();
};

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

  // 将文件转换为 Base64 格式
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = () => {
    collectionForm.value.coverUrl = reader.result;
  };
}

// 添加查看合集内容相关变量
const showCollectionVideosDialog = ref(false);
const currentCollection = ref(null);

// 打开合集查看内容
function openCollection(coll) {
  currentCollection.value = coll;
  showCollectionVideosDialog.value = true;
}

// 删除封面图片
function removeCoverImage(e) {
  e.stopPropagation(); // 阻止事件冒泡
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
  if (!collectionForm.value.title.trim()) {
    ElMessage.warning("请输入合集名称");
    return;
  }

  // 生成基于标题和当前时间的唯一ID
  const timestamp = new Date().getTime();
  const uniqueId = Generater.generateName(
    `${collectionForm.value.title}-${timestamp}`
  );

  // 创建一个新合集
  const newCollection = {
    id: uniqueId,
    title: collectionForm.value.title,
    description: collectionForm.value.description,
    coverUrl: collectionForm.value.coverUrl,
    videos: [],
  };
  await Collection.pushCollection(uniqueId, newCollection);
  collection.value = await Collection.getCollections();

  ElMessage({
    message: `已创建合集: ${collectionForm.value.title}`,
    type: "success",
    duration: 2000,
  });

  showCollectionDialog.value = false;
}

const history = ref([]);
const collection = ref([]);

onMounted(async () => {
  // await Collection.clearCollections();
  await History.clearHistory();
  history.value = await History.getHistory();

  collection.value = await Collection.getCollections();
  console.log("history", history.value);
  console.log("collection", collection.value);
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

.select-collection-dialog {
  .collection-select-list {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .collection-select-content {
    width: 80px;
  }
}
.collection-videos-dialog {
  .el-dialog__body {
    padding: 0px !important;
    overflow: hidden;
  }
}
</style>
