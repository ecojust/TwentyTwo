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
            description="该频道暂无合集..."
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
                      :src="coll.thumb || '/placeholder.jpg'"
                      :alt="coll.title"
                      fit="contain"
                    ></el-image>
                  </div>
                  <div class="video-info">
                    <h3>{{ coll.title }}({{ coll.items }}集)</h3>
                    <el-text class="video-path" truncated>
                      <span class="author">
                        {{ coll.author }}
                      </span>
                    </el-text>
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

    <!-- 其他对话框保持不变 -->
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
                <!-- <el-upload
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
                </el-upload> -->
                <div class="cover-tip">暂无</div>
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
            @click="saveCollection()"
            :loading="isadding"
            :disabled="isadding"
          >
            确定
          </el-button>
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
        {{ currentCollection.title }}
        <el-icon class="add-item" @click="handleAddItem"
          ><CirclePlusFilled
        /></el-icon>
      </div>
      <el-empty
        v-if="!currentCollection || currentCollection.zyhjnr.length === 0"
        description="该合集暂无视频"
        :image-size="200"
      ></el-empty>

      <el-scrollbar
        v-else
        wrap-style="height:calc(100vh - 500px);width:calc(100% - 0px);"
      >
        <div
          class="video-item"
          v-for="(video, index) in currentCollection.zyhjnr"
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
              <div class="video-actions"></div>
              <!-- <div class="time">{{ video.time }}</div> -->
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

    <!-- 添加资源对话框 -->
    <el-dialog
      v-model="addDialog"
      title="新增资源"
      width="500"
      :close-on-click-modal="false"
    >
      <el-form :model="addForm" label-width="150px">
        <el-form-item label="标题" required>
          <el-input
            clearable
            v-model="addForm.title"
            placeholder="请输入资源标题"
          ></el-input>
        </el-form-item>

        <el-form-item label="原始网站播放页" required>
          <el-input
            clearable
            v-model="addForm.origin"
            placeholder="请输入资源播放页网址"
          ></el-input>
        </el-form-item>

        <el-form-item label="视频源地址(体验更佳)">
          <el-input
            clearable
            v-model="addForm.real"
            placeholder="请输入视频源地址，如果没有则留空"
          ></el-input>
        </el-form-item>

        <el-form-item label="视频格式">
          <el-select
            v-model="addForm.type"
            placeholder="请选择资源格式（如果不确定则留空）"
            clearable
          >
            <el-option label="网页" value="iframe"></el-option>
            <el-option label="mp4" value="mp4"></el-option>
            <el-option label="m3u8" value="m3u8"></el-option>
            <el-option label="flv" value="flv"></el-option>
            <el-option label="avi" value="avi"></el-option>
            <el-option label="wmv" value="wmv"></el-option>
            <el-option label="mov" value="mov"></el-option>
            <el-option label="ogg" value="ogg"></el-option>
            <el-option label="mkv" value="mkv"></el-option>
            <el-option label="mkv" value="mkv"></el-option>
            <el-option label="ts" value="ts"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialog = false">取消</el-button>
          <el-button type="primary" @click="handleAddConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, nextTick } from "vue";
import {
  VideoPlay,
  Delete,
  Plus,
  Check,
  CirclePlusFilled,
} from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import Collection from "../tool/collection";
import PlayerList from "../tool/playerList";
import Channel from "../api/channel";
import Config from "../tool/config";
import VideoPlayer from "../components/VideoPlayer.vue";
import { DEFAULT_COLLECTION_COVER } from "../const/const";

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
const collection = ref([]);
const isTitleEditing = ref(false);
const originalTitle = ref("");
const collectionCreateMode = ref("manual");
const importing = ref(false);
const addDialog = ref(false);
const isadding = ref(false);

const addForm = ref({
  title: "",
  origin: "",
  real: "",
  type: "",
});

// 处理新增确认
const handleAddConfirm = async () => {
  if (!addForm.value.title || !addForm.value.origin) {
    ElMessage.warning("请填写必填项");
    return;
  }

  try {
    // await PlayerList.pushVideo(addForm.value, currentCollection.value.id);
    await Channel.pushItemToCollection(
      addForm.value,
      currentCollection.value.id
    );

    const data = await Channel.getCollectionDetails(currentCollection.value.id);
    currentCollection.value = data;
    nextTick();

    addDialog.value = false;

    // 重置表单
    addForm.value = {
      title: "",
      origin: "",
      real: "",
      type: "",
    };
  } catch (error) {
    ElMessage.error(error);
  }
};

const handleAddItem = () => {
  addDialog.value = true;
};

async function playVideo(video, type) {
  playMode.value = type;
  currentVideo.value = video;
  await PlayerList.pushVideo(video);
  showPlayer.value = true;
}

function addCollection() {
  isadding.value = false;
  showCollectionDialog.value = true;
  collectionCreateMode.value = "manual";
  collectionForm.value = {
    title: "",
    description: "",
    coverUrl: DEFAULT_COLLECTION_COVER,
  };
}

// 处理封面图片变更
function handleCoverChange(file) {
  const isImage = file.raw.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("只能上传图片文件!");
    return;
  }

  // 限制文件大小为 5MB
  const isLt2M = file.size / 1024 / 1024 < 5;
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 5MB!");
    return;
  }

  // 将文件转换为 Base64 格式
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = () => {
    collectionForm.value.coverUrl = reader.result;
  };
}

async function openCollection(coll) {
  const data = await Channel.getCollectionDetails(coll.id);
  currentCollection.value = data;
  showCollectionVideosDialog.value = true;
}

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
  const newCollection = {
    title: collectionForm.value.title,
    description: collectionForm.value.description,
    coverUrl: "",
  };
  isadding.value = true;
  const success = await Channel.addCollection(newCollection);
  if (success) {
    getChannelCollections();
    collectionForm.value = {
      title: "",
      description: "",
      coverUrl: "",
    };
    showCollectionDialog.value = false;
  }
  isadding.value = false;
}

const getChannelCollections = async (channelId) => {
  if (!channelId) {
    const config = await Config.getConfiguration();
    channelId = config.channel;
  }
  const res = await Channel.getChannelCollections(channelId);
  if (res) {
    collection.value = res;
  } else {
    collection.value = [];
  }
};

onActivated(async () => {
  await getChannelCollections();
});

onMounted(async () => {
  await getChannelCollections();
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
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 20px;
    font-size: 28px;
    .add-item {
      // font-size: 28px;
      cursor: pointer;
      margin-left: 10px;
    }
    .add-item:hover {
      color: var(--el-color-primary);
    }
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
