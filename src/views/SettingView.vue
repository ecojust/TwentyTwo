<template>
  <div class="setting-view">
    <el-card>
      <div class="theme-settings">
        <h2>皮肤设置</h2>
        <div class="theme-list">
          <div
            v-for="theme in themes"
            :key="theme.id"
            class="theme-item"
            :class="{ active: currentTheme === theme.id }"
            @click="changeTheme(theme.id)"
          >
            <div
              class="theme-preview"
              :style="{ backgroundColor: theme.primary }"
            >
              <div class="theme-colors">
                <div
                  class="color-block"
                  :style="{ backgroundColor: theme.primary }"
                ></div>
                <div
                  class="color-block"
                  :style="{ backgroundColor: theme.secondary }"
                ></div>
                <div
                  class="color-block"
                  :style="{ backgroundColor: theme.background }"
                ></div>
              </div>
            </div>
            <div class="theme-name">{{ theme.name }}</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const themes = ref([
  {
    id: "default",
    name: "默认主题",
    primary: "#409EFF",
    secondary: "#79bbff",
    background: "#ffffff",
  },
  {
    id: "dark",
    name: "深色主题",
    primary: "#252525",
    secondary: "#363636",
    background: "#1a1a1a",
  },
]);

const currentTheme = ref("default");

const changeTheme = (themeId) => {
  currentTheme.value = themeId;
  // 这里可以添加主题切换的具体实现逻辑
  // 例如：修改CSS变量、存储用户偏好等
};

onMounted(async () => {
  // 在这里可以加载用户已保存的主题设置
});
</script>

<style lang="less">
.setting-view {
  width: 100%;

  .theme-settings {
    h2 {
      margin-bottom: 20px;
      font-size: 24px;
      color: #333;
    }

    .theme-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;

      .theme-item {
        cursor: pointer;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s;
        border: 2px solid transparent;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        &.active {
          border-color: #409eff;
        }

        .theme-preview {
          height: 120px;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-colors {
          display: flex;
          gap: 8px;

          .color-block {
            width: 30px;
            height: 30px;
            border-radius: 4px;
          }
        }

        .theme-name {
          padding: 10px;
          text-align: center;
          background: #f5f7fa;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
