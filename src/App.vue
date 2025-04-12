<template>
  <div class="app-container">
    <el-menu
      mode="horizontal"
      router
      class="main-menu"
      :ellipsis="false"
      background-color="#ffffff"
      text-color="#333333"
      active-text-color="#409EFF"
      default-active="/search"
    >
      <el-menu-item>
        <el-icon><VideoCamera /></el-icon>
        <span>视频搜索</span>
      </el-menu-item>
      <div class="flex-grow" />
      <el-menu-item index="/search">
        <el-icon><Search /></el-icon>
        <span>搜索</span>
      </el-menu-item>
      <el-menu-item index="/local">
        <el-icon><Folder /></el-icon>
        <span>本地资源</span>
      </el-menu-item>
      <!-- <el-menu-item index="/favorites">
        <el-icon><Star /></el-icon>
        <span>收藏</span>
      </el-menu-item> -->
      <el-menu-item index="/plugins">
        <el-icon><Connection /></el-icon>
        <span>插件</span>
      </el-menu-item>
      <el-menu-item index="/about">
        <el-icon><InfoFilled /></el-icon>
        <span>关于</span>
      </el-menu-item>
    </el-menu>

    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import {
  VideoCamera,
  Search,
  Folder,
  Star,
  Connection,
  InfoFilled,
} from "@element-plus/icons-vue";
</script>

<style>
:root {
  --primary-color: #409eff;
  --background-color: #f5f7fa;
  --card-background: #ffffff;
  --text-color: #333333;
  --text-secondary: #666666;
  --border-color: #e4e7ed;
  --hover-color: #f2f6fc;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", Arial, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-menu {
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.flex-grow {
  flex-grow: 1;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* 全局卡片样式 */
.el-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important;
}

.el-card__header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  font-weight: 500;
}

.el-card__body {
  padding: 20px;
}

/* 按钮样式优化 */
.el-button {
  border-radius: 4px;
  font-weight: 500;
}

/* 表格样式优化 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background-color: #f5f7fa !important;
  font-weight: 500;
}

/* 标题样式 */
h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 500;
  color: var(--text-color);
}

h3 {
  font-weight: 500;
  color: var(--text-color);
}
</style>
