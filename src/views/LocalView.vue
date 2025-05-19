<template>
  <div class="local-view">
    <el-card>
      <template #header>
        <div class="view-header">
          <h2>频道资源</h2>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="视频合集" name="video">
          <el-empty
            v-if="collection.length === 0"
            @click="addCollection"
            description="暂无合集，点击添加"
            :image-size="200"
          ></el-empty>

          <el-row v-else :gutter="20">
            <el-scrollbar wrap-style="height:calc(100vh - 260px);width:100%;">
              <div
                class="collection-item"
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
                      fit="contain"
                    ></el-image>
                    <!-- 添加居中的播放图标 -->
                  </div>
                  <div class="video-info">
                    <h3>{{ coll.title }} ({{ coll.video_urls.length }})</h3>
                    <el-text class="video-path" truncated
                      >{{ coll.id }}
                      <span class="author">
                        {{ coll.author }}
                      </span>
                    </el-text>
                    <!-- <el-button
                      class="copy-collection"
                      @click.stop="exportCollection(coll)"
                      >拷贝合集</el-button
                    > -->
                    <!-- <span></span> -->
                    <el-button
                      type="warning"
                      class="copy-collection"
                      @click.stop="deleteCollection(coll)"
                      >删除合集</el-button
                    >
                    <div class="video-actions"></div>
                  </div>
                </el-card>
              </div>
              <div
                class="collection-item-add"
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
              >
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
        :current-video="currentVideo"
        @on-close="showPlayer = false"
      ></VideoPlayer>
    </el-dialog>

    <!-- 添加合集对话框 -->
    <el-dialog
      v-model="showCollectionDialog"
      title="添加新合集"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-tabs v-model="collectionCreateMode">
        <el-scrollbar wrap-style="height:340px">
          <el-tab-pane label="手动创建" name="manual">
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
                  <div
                    v-if="collectionForm.coverUrl"
                    class="cover-preview-container"
                  >
                    <img :src="collectionForm.coverUrl" class="cover-preview" />
                    <div
                      class="cover-delete-icon"
                      @click.stop="removeCoverImage"
                    >
                      <el-icon><Delete /></el-icon>
                    </div>
                  </div>
                  <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="cover-tip">默认会以合集内容自动生成封面</div>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="从URL导入" name="url">
            <el-form :model="urlImportForm" label-width="80px">
              <el-form-item label="URL" required>
                <el-input
                  v-model="urlImportForm.url"
                  placeholder="请输入合集URL"
                  type="textarea"
                  :rows="3"
                ></el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="从JSON导入" name="json">
            <el-form :model="jsonImportForm" label-width="80px">
              <el-form-item label="URL" required>
                <el-input
                  v-model="jsonImportForm.json"
                  placeholder="请输入合集URL"
                  type="textarea"
                  :rows="3"
                ></el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-scrollbar>
      </el-tabs>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCollectionDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="
              collectionCreateMode === 'manual'
                ? saveCollection()
                : importCollection()
            "
            :loading="importing"
          >
            {{ collectionCreateMode === "manual" ? "确定" : "导入" }}
          </el-button>
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
                  fit="contain"
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
      title=""
      width="70%"
      class="collection-videos-dialog"
      :show-close="false"
    >
      <div class="title">
        <el-input
          v-model="currentCollection.title"
          :class="{ editing: isTitleEditing }"
          @focus="isTitleEditing = true"
          @blur="handleTitleBlur"
        ></el-input>
        <el-button
          v-if="isTitleEditing"
          class="confirm-button"
          type="success"
          :icon="Check"
          circle
          @click="updateCollectionTitle"
        />
      </div>
      <el-empty
        v-if="!currentCollection || currentCollection.video_urls.length === 0"
        description="该合集暂无视频"
        :image-size="200"
      ></el-empty>

      <el-scrollbar
        v-else
        wrap-style="height:calc(100vh - 500px);width:calc(100% - 0px);"
      >
        <div
          class="video-item"
          v-for="(video, index) in currentCollection.video_urls"
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
              <!-- <el-image
                :src="video.thumbnail || '/placeholder.jpg'"
                :alt="video.title"
                fit="contain"
              ></el-image> -->
              <div
                class="play-icon-overlay"
                @click="playVideo(video, 'collection')"
              >
                <el-icon class="play-icon"><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="video-info">
              <h3>{{ video.title || "暂无" }}</h3>
              <!-- <span>{{ video.text }}</span> -->
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
import { ref, computed, onMounted, onActivated } from "vue";
import { useRouter } from "vue-router";
import { VideoPlay, Delete, Plus, Check } from "@element-plus/icons-vue"; // 添加 Delete 图标
import { ElMessageBox, ElMessage } from "element-plus";
import History from "../tool/history";
import Collection from "../tool/collection";
import Generater from "../tool/generater";
import Plugin from "../tool/plugin";
import PlayerList from "../tool/playerList";

import VideoPlayer from "../components/VideoPlayer.vue";
import { DEFAULT_COLLECTION_COVER } from "../const/const";

const router = useRouter();
const activeTab = ref("video");
const showPlayer = ref(false);
const currentVideo = ref({});
const playMode = ref("history");
const showCollectionDialog = ref(false);
const collectionForm = ref({
  title: "",
  description: "",
  coverUrl: "",
});
const showSelectCollectionDialog = ref(false);
const selectedCollection = ref(null);
const videoToAdd = ref(null);
const showCollectionVideosDialog = ref(false);
const currentCollection = ref(null);
const history = ref([]);
const collection = ref([]);
const isTitleEditing = ref(false);
const originalTitle = ref("");

async function playVideo(video, type) {
  playMode.value = type;
  currentVideo.value = video;
  await PlayerList.pushVideo(video);
  showPlayer.value = true;
  console.log("playVideo", video);
}

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
// 在其他 ref 变量后添加
const collectionCreateMode = ref("manual");
const urlImportForm = ref({
  url: "",
});
const jsonImportForm = ref({
  json: "",
});

const importing = ref(false);

const exportCollection = async (coll) => {
  try {
    const needToParse = Collection.checkCollectionIsReady(coll);
    // if (needToParse.length > 0) {
    //   ElMessage.warning(
    //     `合集 ${coll.title} 中的 ${needToParse.length} 个视频未解析`
    //   );
    //   return;
    // }

    const collectionData = JSON.stringify(coll, null, 2);
    await navigator.clipboard.writeText(collectionData);
    ElMessage.success("合集数据已复制到剪贴板");
  } catch (error) {
    console.error("复制失败:", error);
    ElMessage.error("复制失败，请重试");
  }
};
// 添加导入方法
const importCollection = async () => {
  if (!jsonImportForm.value.json.trim()) {
    ElMessage.warning("请输入合集数据");
    return;
  }

  importing.value = true;
  try {
    // TODO: 实现从URL导入合集的逻辑
    const result = await Collection.importFromData(jsonImportForm.value.json);
    ElMessage.success("导入成功");
    showCollectionDialog.value = false;
    collection.value = await Collection.getCollections();
  } catch (error) {
    ElMessage.error("导入失败：" + error.message);
  } finally {
    importing.value = false;
  }
};

// 修改 addCollection 函数
function addCollection() {
  showCollectionDialog.value = true;
  collectionCreateMode.value = "manual";
  collectionForm.value = {
    title: "",
    description: "",
    coverUrl: DEFAULT_COLLECTION_COVER,
  };
  urlImportForm.value = {
    url: "",
  };
}

const deleteCollection = async (coll) => {
  try {
    await ElMessageBox.confirm(`确定要删除合集 "${coll.title}" 吗？`, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        const res = await Collection.deleteCollection(coll.id);
        if (!res.success) {
          ElMessage.warning(res.message);
        } else {
          ElMessage.success("删除成功");
          collection.value = await Collection.getCollections();
          showCollectionVideosDialog.value = false;
        }
      })
      .catch(() => {
        // ElMessage({
        //   type: "info",
        //   message: "Delete canceled",
        // });
      });
  } catch {
    // 用户点击取消按钮时，不执行任何操作
  }
};

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

// 在 openCollection 函数中添加
function openCollection(coll) {
  currentCollection.value = coll;
  originalTitle.value = coll.title; // 保存原始标题
  showCollectionVideosDialog.value = true;
}

// 添加新的处理函数
const handleTitleBlur = () => {
  // 如果标题没有改变，直接退出编辑模式
  if (currentCollection.value.title === originalTitle.value) {
    isTitleEditing.value = false;
  }
};

const updateCollectionTitle = async () => {
  if (!currentCollection.value.title.trim()) {
    ElMessage.warning("标题不能为空");
    return;
  }

  await Collection.updateCollection(currentCollection.value);
  collection.value = await Collection.getCollections();
  originalTitle.value = currentCollection.value.title;
  isTitleEditing.value = false;
  ElMessage.success("标题更新成功");
};

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

const init = async () => {
  await Plugin.setPlugin();
  history.value = await History.getHistory();
  collection.value = await Collection.getCollections();
  console.log("history", history.value);
  console.log("collection", collection.value);
  const autoPlay = router.currentRoute.value.query.autoPlay;
  if (autoPlay) {
    activeTab.value = "history";
    playVideo(history.value[0], "history");
    router.replace({ query: {} });
  }
};

onActivated(async () => {
  await init();
});

onMounted(async () => {
  // await Collection.clearCollections();
  // await History.clearHistory();
  await init();
});
</script>

<style lang="less">
.local-view {
  .view-header {
    h2 {
      margin: 0;
    }
  }

  .history-item,
  .collection-item,
  .video-item {
    margin: 10px;
    display: inline-block;
    width: 260px;
    cursor: pointer;
  }
  .collection-item {
    .video-info {
      .video-path {
        display: block;
        margin: 5px 0;
        color: #666;
        font-size: 12px;

        .author {
          float: right;
          color: #f35804;
        }
      }
    }
  }

  .video-card {
    height: 100%;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    .video-thumbnail {
      position: relative;
      height: 200px;
      overflow: hidden;

      .el-image {
        width: 100%;
        height: 100%;
      }

      .play-icon-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s;
        cursor: pointer;

        &:hover {
          opacity: 1;
        }

        .play-icon {
          font-size: 48px;
          color: white;
        }
      }
    }

    .video-info {
      padding: 14px;
      position: relative;

      h3 {
        margin: 0;
        font-size: 16px;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      span {
        font-size: 14px;
        color: #666;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .video-actions {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
      }

      .time {
        position: absolute;
        bottom: 14px;
        left: 14px;
        font-size: 12px;
        color: #999;
      }

      .copy-collection {
        margin-top: 10px;
        width: 100%;
      }
    }
  }

  .collection-item-add {
    display: inline-block;
    width: 240px;
    margin: 20px;
    vertical-align: top;

    .add-collection-card {
      cursor: pointer;

      .add-collection-thumbnail {
        height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #f5f7fa;

        .add-icon {
          font-size: 48px;
          color: #909399;
        }
      }
    }
  }

  .cover-uploader {
    .cover-preview-container {
      position: relative;
      width: 178px;
      height: 178px;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      overflow: hidden;

      .cover-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-delete-icon {
        position: absolute;
        top: 0;
        right: 0;
        padding: 8px;
        background: rgba(0, 0, 0, 0.5);
        cursor: pointer;
        color: white;
      }
    }

    .cover-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .cover-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  .collection-select-list {
    .collection-select-item {
      display: block;
      margin-bottom: 10px;
      height: auto;

      .collection-select-content {
        display: flex;
        align-items: center;

        .collection-thumbnail {
          width: 60px;
          height: 60px;
          margin-right: 10px;
          border-radius: 4px;
        }

        .collection-title {
          flex: 1;
        }
      }
    }
  }
}

.collection-videos-dialog {
  .title {
    // display: flex;
    // align-items: center;
    margin-bottom: 20px;

    .el-input {
      // flex: 1;
      margin: 0px 10px;
      width: 240px;

      &.editing {
        .el-input__inner {
          border-color: var(--el-color-primary);
        }
      }
    }
    .delete-button {
      float: right;
    }
  }
}

.player-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.select-collection-dialog {
  :deep(.el-radio__input) {
    align-self: flex-start;
    margin-top: 20px;
  }
}
</style>
