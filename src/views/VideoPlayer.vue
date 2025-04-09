<template>
  <div class="video-player">
    <el-card>
      <template #header>
        <div class="player-header">
          <el-button class="back-button" @click="goBack" :icon="ArrowLeft" plain>返回</el-button>
          <h2 class="video-title">{{ videoTitle }}</h2>
          <el-button 
            class="favorite-button" 
            @click="toggleFavorite"
            :type="isFavorite ? 'warning' : 'info'"
            :icon="isFavorite ? Star : StarFilled"
            plain
          >
            {{ isFavorite ? '已收藏' : '收藏' }}
          </el-button>
        </div>
      </template>
      
      <div class="player-container">
        <video
          ref="videoRef"
          controls
          autoplay
          class="video-element"
          @timeupdate="updateProgress"
          @loadedmetadata="videoLoaded"
        >
          <source :src="videoSrc" :type="videoType">
          您的浏览器不支持 HTML5 视频播放。
        </video>
      </div>
      
      <div class="player-controls">
        <el-slider
          v-model="progress"
          :show-tooltip="false"
          @change="seekVideo"
          class="progress-slider"
        />
        
        <div class="control-buttons">
          <el-button-group>
            <el-button @click="togglePlay" :icon="isPlaying ? VideoPause : VideoPlay" plain>
              {{ isPlaying ? '暂停' : '播放' }}
            </el-button>
            <el-button @click="skipBackward" :icon="Back" plain>-10秒</el-button>
            <el-button @click="skipForward" :icon="Right" plain>+10秒</el-button>
          </el-button-group>
          
          <div class="volume-control">
            <el-button @click="toggleMute" :icon="isMuted ? Mute : Microphone" plain>
              {{ isMuted ? '取消静音' : '静音' }}
            </el-button>
            <el-slider 
              v-model="volume" 
              :min="0" 
              :max="1" 
              :step="0.1" 
              @input="updateVolume"
              class="volume-slider"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFavoritesStore } from '../stores/favorites'
import { ArrowLeft, Star, StarFilled, VideoPause, VideoPlay, Back, Right, Mute, Microphone } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const favoritesStore = useFavoritesStore()

const videoRef = ref(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(1)
const progress = ref(0)

// Get video information from route params
const videoSource = computed(() => route.params.source)
const videoId = computed(() => route.params.id)
const videoTitle = computed(() => route.query.title || '未知视频')

// Determine video source URL based on source type
const videoSrc = computed(() => {
  if (videoSource.value === 'local') {
    // For local files, use the file:// protocol
    return `file://${decodeURIComponent(videoId.value)}`
  } else {
    // For plugin sources, we might need to fetch the actual URL
    // This would depend on your plugin implementation
    return videoId.value
  }
})

// Determine video MIME type based on file extension
const videoType = computed(() => {
  const path = videoSrc.value.toLowerCase()
  if (path.endsWith('.mp4')) return 'video/mp4'
  if (path.endsWith('.webm')) return 'video/webm'
  if (path.endsWith('.ogg')) return 'video/ogg'
  if (path.endsWith('.mov')) return 'video/quicktime'
  if (path.endsWith('.mkv')) return 'video/x-matroska'
  if (path.endsWith('.avi')) return 'video/x-msvideo'
  return 'video/mp4' // Default
})

// Check if the current video is in favorites
const isFavorite = computed(() => {
  return favoritesStore.isFavorite(videoId.value)
})

// Video player functions
function videoLoaded() {
  if (videoRef.value) {
    videoRef.value.volume = volume.value
  }
}

function updateProgress() {
  if (videoRef.value) {
    const currentTime = videoRef.value.currentTime
    const duration = videoRef.value.duration
    progress.value = (currentTime / duration) * 100
  }
}

// 新增：通过进度条拖动来调整视频进度
function seekVideo(value) {
  if (videoRef.value) {
    const duration = videoRef.value.duration
    videoRef.value.currentTime = (value / 100) * duration
  }
}

function togglePlay() {
  if (videoRef.value) {
    if (videoRef.value.paused) {
      videoRef.value.play()
      isPlaying.value = true
    } else {
      videoRef.value.pause()
      isPlaying.value = false
    }
  }
}

function skipBackward() {
  if (videoRef.value) {
    videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime - 10)
  }
}

function skipForward() {
  if (videoRef.value) {
    videoRef.value.currentTime = Math.min(
      videoRef.value.duration,
      videoRef.value.currentTime + 10
    )
  }
}

function toggleMute() {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted
    isMuted.value = videoRef.value.muted
  }
}

function updateVolume() {
  if (videoRef.value) {
    videoRef.value.volume = volume.value
    if (volume.value > 0) {
      videoRef.value.muted = false
      isMuted.value = false
    }
  }
}

function toggleFavorite() {
  if (isFavorite.value) {
    favoritesStore.removeFavorite(videoId.value)
  } else {
    favoritesStore.addFavorite({
      id: videoId.value,
      title: videoTitle.value,
      source: videoSource.value,
      type: videoSource.value === 'local' ? 'local' : 'plugin'
    })
  }
}

function goBack() {
  router.back()
}

// Watch for video element changes
watch(videoRef, (newVideo) => {
  if (newVideo) {
    // Update initial state based on video element
    isPlaying.value = !newVideo.paused
    isMuted.value = newVideo.muted
    volume.value = newVideo.volume
    
    // Add event listeners
    newVideo.addEventListener('play', () => {
      isPlaying.value = true
    })
    
    newVideo.addEventListener('pause', () => {
      isPlaying.value = false
    })
  }
})

// Clean up when component is unmounted
onMounted(() => {
  // Save current playback position for resume later
  const savePlaybackPosition = () => {
    if (videoRef.value) {
      localStorage.setItem(
        `video-position-${videoId.value}`,
        videoRef.value.currentTime.toString()
      )
    }
  }
  
  // Save position every 5 seconds and before unload
  const intervalId = setInterval(savePlaybackPosition, 5000)
  window.addEventListener('beforeunload', savePlaybackPosition)
  
  // Try to restore previous position
  const savedPosition = localStorage.getItem(`video-position-${videoId.value}`)
  if (savedPosition && videoRef.value) {
    videoRef.value.currentTime = parseFloat(savedPosition)
  }
  
  // Clean up
  return () => {
    clearInterval(intervalId)
    window.removeEventListener('beforeunload', savePlaybackPosition)
  }
})
</script>

<style scoped>
.video-player {
  width: 100%;
}

.player-header {
  display: flex;
  align-items: center;
}

.back-button {
  margin-right: 1rem;
}

.video-title {
  flex: 1;
  margin: 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-button {
  margin-left: 1rem;
}

.player-container {
  position: relative;
  width: 100%;
  background-color: #000;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 8px;
  margin: 20px 0;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.player-controls {
  margin-top: 1rem;
}

.progress-slider {
  margin-bottom: 1rem;
}

.control-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-slider {
  width: 100px;
}

@media (max-width: 768px) {
  .control-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .volume-control {
    width: 100%;
    justify-content: space-between;
  }
  
  .volume-slider {
    width: calc(100% - 100px);
  }
}
</style>