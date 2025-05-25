<template>
  <div
    class="video-player"
    @mousemove="handleMouseMove"
    :class="{ 'cursor-hidden': controlsHidden }"
  >
    <div class="player-header" :class="{ 'controls-hidden': controlsHidden }">
      <div class="tv-style-title">{{ videoTitle }}</div>

      <span class="label">{{ currentVideo.real }}</span>

      <span class="label">视频剩余时间(s):{{ leftEndingTime.toFixed(2) }}</span>

      <span class="label">片头片尾跳过时间(s):</span>

      <el-input-number
        class="skip-ending-setting"
        v-model="skipStartTime"
        :min="0"
        :max="300"
        :step="10"
        size="small"
        controls-position="right"
        placeholder="设置片尾跳过时间(秒)"
      />
      <el-input-number
        class="skip-ending-setting"
        v-model="skipEndingTime"
        :min="0"
        :max="300"
        :step="10"
        size="small"
        controls-position="right"
        placeholder="设置片尾跳过时间(秒)"
      />
      <el-button
        class="player-header-close"
        type="primary"
        size="small"
        @click="handleClose"
      >
        <el-icon><Close /></el-icon>
      </el-button>
    </div>

    <iframe
      v-if="computedVideoType == 'iframe'"
      :src="currentVideo.real"
      frameborder="0"
    ></iframe>

    <video
      v-else-if="computedVideoType.includes('/')"
      ref="videoRef"
      :id="id"
      controls
      autoplay
      class="video-element"
      @timeupdate="updateProgress"
      @loadedmetadata="videoLoaded"
    >
      <source :src="currentVideo.real" :type="computedVideoType" />
      您的浏览器不支持 HTML5 视频播放。
    </video>

    <!-- 添加剧集列表 -->
    <div class="episode-list" :class="{ 'controls-hidden': controlsHidden }">
      <div class="episode-list-header">剧集列表</div>
      <div class="episode-list-content" ref="listRef">
        <div ref="sortableContainer">
          <div
            v-for="(source, index) in videoSources"
            :key="index"
            class="episode-item"
            :class="{ active: source.real === currentVideo.real }"
            @click="switchVideo(source, index)"
            :data-id="index"
          >
            <span class="drag-handle"> ... </span>
            <span class="title">{{ source.title }}</span>
            <el-button
              class="delete-btn"
              type="danger"
              size="small"
              @click.stop="handleDeleteVideo(source, index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 添加自动播放提示 -->
    <div v-if="showNextEpisodeHint" class="next-episode-hint">
      <div class="hint-content">
        <div class="tips">{{ countDown }}秒后自动播放下一集</div>
        <div class="hint-buttons">
          <el-button type="primary" size="small" @click="playNextEpisode"
            >立即播放</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { Close, Delete, More } from "@element-plus/icons-vue";
import Player from "../tool/player";
import PlayerList from "../tool/playerList";
import Sortable from "sortable-dnd";

const emit = defineEmits(["on-close", "on-update"]);
const props = defineProps({
  id: {
    type: String,
    required: false,
    default: "video-player",
  },
});

const videoSources = ref([]);
const videoSources2 = ref([
  {
    title: "第1集",
    real: "URL_ADDRESS.baidu.com",
  },
]);

const currentVideo = ref({});
const sortableContainer = ref(null);
let sortableInstance = null;
const videoTitle = computed(() => {
  return currentVideo.value?.title;
});

const videoType = computed(() => {
  return currentVideo.value?.type;
});

// 根据视频URL自动分析视频类型
const computedVideoType = computed(() => {
  const url = currentVideo.value?.real;
  console.log("url", url);
  if (!url) return "";
  const extension =
    videoType.value?.toLowerCase() ||
    currentVideo.value?.real.toLowerCase().split(".").pop().split("?")[0]; // 处理可能的查询参数

  // 根据扩展名映射到MIME类型
  const mimeTypes = {
    mp4: "video/mp4",
    webm: "video/webm",
    ogg: "video/ogg",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    flv: "video/x-flv",
    wmv: "video/x-ms-wmv",
    m3u8: "application/x-mpegURL",
    ts: "video/mp2t",
    mkv: "video/x-matroska",
    iframe: "iframe",
  };
  return mimeTypes[extension] || "";
});

const listRef = ref(null);
const videoRef = ref(null);
const controlsHidden = ref(false);
let hideControlsTimer = null;

// 处理关闭按钮点击事件
const handleClose = () => {
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.currentTime = 0;
    videoRef.value.src = "";
  }
  emit("on-close");
};

// 切换视频
const switchVideo = async (video, index) => {
  currentVideo.value = video;

  if (listRef.value) {
    listRef.value.scrollTop = Math.max(index - 7, 0) * 44;
  }

  console.log("切换视频成功");
  const bool = await Player.waitForElement(`#${props.id}`, 10000);
  if (bool) {
    console.log("开始自动播放");
    videoRef.value.load();
    videoRef.value.play().catch((err) => {
      console.error("播放失败:", err);
    });
  }
};

const showNextEpisodeHint = ref(false);
const countDown = ref(3);
let countDownTimer = null;

// 添加片头跳过时间设置
const skipStartTime = ref(100);

// 视频加载完成时的处理
const videoLoaded = () => {
  if (!videoRef.value || !skipStartTime.value) return;
  // 设置视频播放位置到跳过片头的时间点
  videoRef.value.currentTime = skipStartTime.value;
};

// 添加片尾跳过时间设置
const skipEndingTime = ref(180);
const leftEndingTime = ref(180);

let skipEndingTimer = null;
const startEndingProcess = ref(false);

// 更新视频进度时检查是否需要跳过片尾
const updateProgress = () => {
  if (!videoRef.value || !skipEndingTime.value) return;
  leftEndingTime.value = videoRef.value.duration - videoRef.value.currentTime;
  // 直接使用 showNextEpisodeHint 来检查状态
  if (
    leftEndingTime.value <= skipEndingTime.value &&
    !skipEndingTimer &&
    !startEndingProcess.value
  ) {
    skipEndingTimer = setTimeout(() => {
      handleVideoEnded();
      clearTimeout(skipEndingTimer);
      skipEndingTimer = null;
    }, 1000);
  }
};

// 处理视频播放结束事件
const handleVideoEnded = async () => {
  if (startEndingProcess.value) return;

  const currentIndex = videoSources.value.findIndex(
    (source) => source.real === currentVideo.value.real
  );
  if (currentIndex > -1 && currentIndex < videoSources.value.length - 1) {
    showNextEpisodeHint.value = true;
    startEndingProcess.value = true;
    countDown.value = 5;
    if (countDownTimer) {
      clearInterval(countDownTimer);
      countDownTimer = null;
    }
    countDownTimer = setInterval(() => {
      countDown.value--;
      if (countDown.value <= 0) {
        clearInterval(countDownTimer);
        playNextEpisode();
      }
    }, 1000);
  }
};

// 立即播放下一集
const playNextEpisode = async () => {
  if (countDownTimer) {
    clearInterval(countDownTimer);
    countDownTimer = null;
  }
  const currentIndex = videoSources.value.findIndex(
    (source) => source.real === currentVideo.value.real
  );
  showNextEpisodeHint.value = false;
  if (currentIndex > -1 && currentIndex < videoSources.value.length - 1) {
    await switchVideo(videoSources.value[currentIndex + 1], currentIndex + 1);
  }
  startEndingProcess.value = false;
};

// 处理鼠标移动事件
const handleMouseMove = () => {
  controlsHidden.value = false;
  if (hideControlsTimer) {
    clearTimeout(hideControlsTimer);
  }
  if (computedVideoType.value == "iframe") return;
  hideControlsTimer = setTimeout(() => {
    controlsHidden.value = true;
  }, 10000);
};

// 清除定时器
const clearTimers = () => {
  if (hideControlsTimer) {
    clearTimeout(hideControlsTimer);
    hideControlsTimer = null;
  }

  if (skipEndingTimer) {
    clearTimeout(skipEndingTimer);
    skipEndingTimer = null;
  }

  if (countDownTimer) {
    clearInterval(countDownTimer);
    countDownTimer = null;
  }
};

// 初始化可排序列表
const initSortable = () => {
  if (!sortableContainer.value) return;

  sortableInstance = new Sortable(sortableContainer.value, {
    animation: 0,
    handle: ".drag-handle", // 添加拖拽手柄
    onDrop: async (evt) => {
      const { oldIndex, newIndex } = evt;
      if (oldIndex !== newIndex) {
        const newArray = [...videoSources.value];
        const movedItem = newArray[oldIndex];
        newArray.splice(oldIndex, 1);
        newArray.splice(newIndex, 0, movedItem);

        // 强制更新视图
        videoSources.value = [];
        await nextTick();
        videoSources.value = newArray;

        await PlayerList.updateVideoList(videoSources.value);
        await nextTick();
      }
    },
  });
};

// 清除Sortable实例
const destroySortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
};

// Clean up when component is unmounted
onMounted(async () => {
  clearTimers();
  handleMouseMove();
  videoSources.value = await PlayerList.getDeduplicatedVideoList();
  if (videoSources.value[0]) {
    await switchVideo(videoSources.value[0]);
  }

  // 等待DOM更新后初始化Sortable
  nextTick(() => {
    initSortable();
  });
});

// 组件卸载时清除定时器
onUnmounted(() => {
  clearTimers();
  destroySortable();
});
// 处理视频删除
const handleDeleteVideo = async (video, index) => {
  // 从视频源列表中删除
  videoSources.value.splice(index, 1);

  // 如果删除的是当前播放的视频，且列表不为空，切换到第一个视频
  if (video.real === currentVideo.value.real && videoSources.value.length > 0) {
    await switchVideo(videoSources.value[0], 0);
  }
  await PlayerList.updateVideoList(videoSources.value);
};
</script>

<style lang="less">
.video-player {
  width: 100%;
  height: 100%;
  background: black;
  position: relative;
  overflow: hidden;
  &.cursor-hidden {
    cursor: none;
  }
  .player-header {
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - 40px);
    z-index: 90;
    padding: 15px 20px !important;
    transition: opacity 0.3s ease;
    pointer-events: none;
    color: #c1c1c1;

    &.controls-hidden {
      opacity: 0;
      pointer-events: none;
    }
    .player-header-close {
      pointer-events: all;
    }

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
    .label {
      padding: 4px 8px;
      border-radius: 4px;
    }
    .skip-ending-setting {
      pointer-events: all;
      width: 70px;
      cursor: pointer;
      .el-input-number__decrease,
      .el-input-number__increase {
        opacity: 0;
      }
      .el-input {
        background: transparent;
        .el-input__wrapper {
          background: transparent;
          box-shadow: none;
          .el-input__inner {
            // background: transparent;
            color: #c1c1c1;
          }
        }
      }
    }

    .skip-ending-setting:hover {
      pointer-events: all;
      .el-input-number__decrease,
      .el-input-number__increase {
        opacity: 1;
      }
      .el-input {
        // background: #fff;
        .el-input__wrapper {
          background: #fff;
          box-shadow: 0 0 0 1px
            var(--el-input-border-color, var(--el-border-color)) inset;

          .el-input__inner {
            // background: transparent;
          }
        }
      }
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
        background-color: rgba(255, 255, 255, 0.5);

        .el-icon {
          transform: scale(1.1);
        }
      }
    }
  }

  // .video-element {
  //   width: 100%;
  //   height: 100%;
  // }

  iframe {
    position: absolute;

    width: 100%;
    height: 100%;
    border: none;
    z-index: 0;
  }

  .episode-list {
    position: absolute;
    height: calc(100% - 120px);
    right: 0;
    top: 50px;
    width: 160px;
    // background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
    opacity: 1;

    z-index: 90;
    transition: all 0.3s ease;

    &.controls-hidden {
      opacity: 0;
      pointer-events: none;
    }

    .episode-list-header {
      padding: 15px;
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .episode-list-content {
      height: calc(100% - 50px);
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.2); // 修改为半透明黑色背景

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }
    }

    .episode-item {
      padding: 12px 15px;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      user-select: none !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      position: relative; // 添加相对定位
      .title {
        font-size: 12px;
      }
      &:hover {
        background: rgba(255, 255, 255, 0.1); // 增加hover时的背景透明度
      }

      &.active {
        background: rgba(64, 158, 255, 0.2); // 增加选中状态的背景透明度
        color: #fff;
        border-left: 3px solid #409eff; // 添加左侧边框标识
        padding-left: 12px; // 调整左内边距以补偿边框宽度

        .drag-handle {
          color: #409eff; // 选中状态下图标颜色改为主题色
        }

        .title {
          font-weight: 500; // 选中状态下文字加粗
        }
      }

      .drag-handle {
        cursor: move;
        color: rgba(255, 255, 255, 0.4);
        font-size: 16px;
        transition: all 0.3s ease;
        transform: rotateZ(90deg);
        font-weight: 900;

        &:hover {
          color: #409eff; // 鼠标悬停在拖拽图标上时变为主题色
        }
      }
    }
  }

  .next-episode-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    padding: 20px;
    border-radius: 8px;
    z-index: 100;

    .hint-content {
      text-align: center;
      color: #fff;
      .tips {
        margin-bottom: 15px;
        font-size: 16px;
      }
      .hint-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
    }
  }

  // 删除这个样式，让视频保持全宽
  // .video-element,
  // iframe {
  //   width: calc(100% - 200px);
  // }

  // 视频元素恢复原始样式
  .video-element,
  iframe {
    width: 100%;
    height: 100%;
  }
}
.episode-item {
  padding: 12px 15px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative; // 添加相对定位
  .title {
    font-size: 12px;
  }
  &:hover {
    background: rgba(255, 255, 255, 0.1); // 增加hover时的背景透明度
  }

  &.active {
    background: rgba(64, 158, 255, 0.2); // 增加选中状态的背景透明度
    color: #fff;
    border-left: 3px solid #409eff; // 添加左侧边框标识
    padding-left: 12px; // 调整左内边距以补偿边框宽度

    .drag-handle {
      color: #409eff; // 选中状态下图标颜色改为主题色
    }

    .title {
      font-weight: 500; // 选中状态下文字加粗
    }
  }

  .drag-handle {
    cursor: move;
    color: rgba(255, 255, 255, 0.4);
    font-size: 16px;
    transition: all 0.3s ease;
    transform: rotateZ(90deg);
    font-weight: 900;

    &:hover {
      color: #409eff; // 鼠标悬停在拖拽图标上时变为主题色
    }
  }
  .delete-btn {
    opacity: 0;
    transition: opacity 0.3s;
    margin-left: auto;
    padding: 2px;

    .el-icon {
      font-size: 14px;
    }
  }

  &:hover {
    .delete-btn {
      opacity: 1;
    }
  }
}
</style>
