<template>
  <div
    class="video-player"
    @mousemove="handleMouseMove"
    @mouseleave="hideControls"
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { Close } from "@element-plus/icons-vue";

const emit = defineEmits(["on-close"]);
const props = defineProps({
  videoSources: {
    type: Array,
    required: true,
  },
  videoType: {
    type: String,
    default: "",
  },
  videoTitle: {
    type: String,
    default: "未命名视频",
  },
});

const currentVideo = ref({
  origin: "",
  real: "",
});

// 根据视频URL自动分析视频类型
const computedVideoType = computed(() => {
  const extension =
    props.videoType?.toLowerCase() ||
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
  if (computedVideoType.value == "iframe") return;
  // 显示控制栏
  controlsHidden.value = false;

  // 清除之前的定时器
  if (hideControlsTimer) {
    clearTimeout(hideControlsTimer);
  }

  // 设置新的定时器，3秒后隐藏控制栏
  hideControlsTimer = setTimeout(() => {
    controlsHidden.value = true;
  }, 3000);
};

// 立即隐藏控制栏
const hideControls = () => {
  if (computedVideoType.value == "iframe") return;

  controlsHidden.value = true;
  if (hideControlsTimer) {
    clearTimeout(hideControlsTimer);
  }
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

// Clean up when component is unmounted
onMounted(() => {
  handleMouseMove();

  console.log("props.videoSources", props.videoSources);

  if (props.videoSources.length == 0) return;
  currentVideo.value = props.videoSources[0];
  // if (!videoRef.value) return;
  // videoRef.value.load();
  // videoRef.value.play().catch((err) => {
  //   console.error("自动播放失败:", err);
  // });

  // 初始化时启动隐藏控制栏的定时器
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
}
</style>
