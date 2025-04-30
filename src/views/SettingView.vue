<template>
  <div class="setting-view">
    <el-card>
      <div class="theme-settings">
        <h2>皮肤设置</h2>
        <div class="theme-list">
          <div
            v-for="theme in SYSTEM_THEMES"
            :key="theme.name"
            class="theme-item"
            :class="{ active: currentTheme === theme.name }"
            @click="changeTheme(theme.name)"
          >
            <div class="theme-preview">
              <img fill="contain" :src="theme.preview" alt="" />
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
import Config from "../tool/config";
import { SYSTEM_THEMES } from "../const/const";

const themes = ref([]);

const currentTheme = ref("default");

const changeTheme = async (theme) => {
  currentTheme.value = theme;
  await Config.setTheme(theme);
  await Config.applyTheme();
  // 这里可以添加主题切换的具体实现逻辑
  // 例如：修改CSS变量、存储用户偏好等
};

onMounted(async () => {
  // 在这里可以加载用户已保存的主题设置
  const config = await Config.getConfiguration();
  currentTheme.value = config.theme;
});
</script>

<style lang="less">
.setting-view {
  width: 100%;
  padding: 20px;

  .theme-settings {
    h2 {
      margin-bottom: 30px;
      font-size: 28px;
      color: #2c3e50;
      font-weight: 600;
      position: relative;
      padding-left: 15px;

      &:before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 70%;
        background: #f59712;
        border-radius: 2px;
      }
    }

    .theme-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 25px;
      padding: 10px;

      .theme-item {
        cursor: pointer;
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
        border: 3px solid transparent;
        background: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
        }

        &.active {
          border-color: #f59712;
          box-shadow: 0 0 0 2px rgba(245, 151, 18, 0.3);
        }

        .theme-preview {
          height: 150px;
          padding: 0px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(45deg, #f5f7fa, #e4e7eb);

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            transition: transform 0.3s ease;
          }

          &:hover img {
            transform: scale(1.05);
          }
        }

        .theme-name {
          padding: 12px;
          text-align: center;
          background: #2c3e50;
          color: #ffffff;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: background-color 0.3s ease;
        }

        &:hover .theme-name {
          background: #34495e;
        }
      }
    }
  }
}
</style>
