<template>
  <div
    class="video-player"
    @mousemove="handleMouseMove"
    :class="{ 'cursor-hidden': controlsHidden }"
  >
    <div class="player-header" :class="{ 'controls-hidden': controlsHidden }">
      <div class="tv-style-title">{{ videoTitle }}</div>

      <span>{{ currentVideo.real }}</span>
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
      v-else
      ref="videoRef"
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
      <div class="episode-list-content">
        <div
          v-for="(source, index) in videoSources"
          :key="index"
          class="episode-item"
          :class="{ active: source.real === currentVideo.real }"
          @click="switchVideo(source)"
        >
          <span>第 {{ index + 1 }} 集</span>
          <el-icon v-if="source.real === currentVideo.real" class="check-icon"
            ><Check
          /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { Close, Check } from "@element-plus/icons-vue";
import Plugin from "../tool/plugin";
// import { IVideo } from "../const/interface";

const emit = defineEmits(["on-close", "on-update-item"]);
const props = defineProps({
  video: {
    type: Object,
    required: true,
    default: {
      origin: "",
      real: "-1",
    },
  },
});

const videoSources = ref([]);

const currentVideo = ref({
  origin: "",
  real: "-1",
});

const videoTitle = computed(() => {
  return props.video.title;
});

const videoType = computed(() => {
  return props.video.type;
});

// 根据视频URL自动分析视频类型
const computedVideoType = computed(() => {
  const extension =
    videoType.value?.toLowerCase() ||
    currentVideo.value.real.toLowerCase().split(".").pop().split("?")[0]; // 处理可能的查询参数

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
  };
  return mimeTypes[extension] || "iframe";
});

const videoRef = ref(null);
const controlsHidden = ref(false);
let hideControlsTimer = null;

// 处理鼠标移动事件
const handleMouseMove = () => {
  // 显示控制栏
  controlsHidden.value = false;
  // 清除之前的定时器
  if (hideControlsTimer) {
    clearTimeout(hideControlsTimer);
  }
  if (computedVideoType.value == "iframe") return;

  // 设置新的定时器，3秒后隐藏控制栏
  hideControlsTimer = setTimeout(() => {
    controlsHidden.value = true;
  }, 3000);
};

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
const switchVideo = async (video) => {
  if (!video.real) {
    const res = await Plugin.parseVideoUrl(video.origin);
    currentVideo.value = res[0];
    videoSources.value.splice(
      videoSources.value.findIndex((s) => s.origin == video.origin),
      1,
      res[0]
    );
    console.log("videoSources.value", videoSources.value);
  } else {
    currentVideo.value = video;
  }
  if (videoRef.value) {
    videoRef.value.load();
    videoRef.value.play().catch((err) => {
      console.error("播放失败:", err);
    });
  }
};

// Clean up when component is unmounted
onMounted(async () => {
  handleMouseMove();
  videoSources.value = [...(props.video.video_urls || [])];
  if (videoSources.value[0]) {
    await switchVideo(videoSources.value[0]);
  }
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (hideControlsTimer) {
    clearTimeout(hideControlsTimer);
  }
});
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

  .video-element {
    width: 100%;
    height: 100%;
  }

  iframe {
    position: absolute;

    width: 100%;
    height: 100%;
    border: none;
    z-index: 0;
  }

  .episode-list {
    position: absolute;
    height: calc(100% - 70px);
    right: 0;
    bottom: 0;
    width: 200px;
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
      color: #fff;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .check-icon {
        color: #67c23a;
        font-size: 16px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.active {
        background: rgba(64, 158, 255, 0.2);
        color: #409eff;
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
</style>
