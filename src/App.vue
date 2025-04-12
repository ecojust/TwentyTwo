<template>
  <div class="app-container">
    <!-- 使用独立的导航栏组件 -->
    <FreshNavbar />

    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import FreshNavbar from "./components/FreshNavbar.vue";
</script>

<style lang="less">
:root {
  --primary-color: #409eff;
  --background-color: #f5f7fa;
  --card-background: #ffffff;
  --text-color: #333333;
  --text-secondary: #666666;
  --border-color: #e4e7ed;
  --hover-color: #f2f6fc;

  // 小清新颜色变量
  --fresh-primary: #5e9eff;
  --fresh-secondary: #ff9e7d;
  --fresh-success: #8dd1a3;
  --fresh-bg: rgba(255, 255, 255, 0.9);
  --fresh-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border: none;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  &__header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    font-weight: 500;
  }

  &__body {
    padding: 20px;
  }
}

/* 按钮样式优化 */
.el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &--primary {
    background-color: var(--fresh-primary);
    border-color: var(--fresh-primary);

    &:hover {
      background-color: var(--fresh-primary);
      border-color: var(--fresh-primary);
      opacity: 0.9;
    }
  }
}

/* 表格样式优化 */
.el-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  th {
    background-color: #f5f7fa;
    font-weight: 500;
  }

  td {
    transition: all 0.2s ease;
  }

  tr:hover td {
    background-color: rgba(94, 158, 255, 0.05);
  }
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
