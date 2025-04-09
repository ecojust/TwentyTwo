<template>
  <div class="about-view">
    <el-card>
      <template #header>
        <div class="view-header">
          <h2>关于</h2>
        </div>
      </template>

      <div class="about-content">
        <div class="app-logo">
          <el-image src="/logo.png" alt="VideoSearch Logo" fit="contain"></el-image>
        </div>
        
        <h3 class="app-name">VideoSearch</h3>
        <p class="app-version">版本: v1.0.0</p>
        
        <div class="app-description">
          <p>VideoSearch 是一个跨平台的视频搜索和管理工具，支持本地视频播放和在线视频搜索。</p>
          <p>基于 Vue 3 和 Tauri 构建，提供轻量级、高性能的用户体验。</p>
        </div>
        
        <div class="app-features">
          <h4>主要功能</h4>
          <ul>
            <li>本地视频文件管理和播放</li>
            <li>通过插件系统支持多种在线视频源</li>
            <li>视频收藏和历史记录</li>
            <li>自定义插件开发</li>
          </ul>
        </div>
        
        <div class="app-copyright">
          <p>© 2023 VideoSearch. 保留所有权利。</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
// 这里可以引入版本信息，如果有配置文件的话
const appVersion = "v1.0.0";
</script>

<style scoped>
.about-view {
  width: 100%;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.app-logo {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.app-name {
  font-size: 24px;
  font-weight: 600;
  margin: 10px 0;
}

.app-version {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.app-description {
  max-width: 600px;
  margin-bottom: 30px;
  line-height: 1.6;
}

.app-features {
  width: 100%;
  max-width: 600px;
  text-align: left;
  margin-bottom: 30px;
}

.app-features h4 {
  margin-bottom: 15px;
}

.app-features ul {
  padding-left: 20px;
}

.app-features li {
  margin-bottom: 8px;
}

.app-copyright {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 20px;
}
</style>