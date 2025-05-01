<template>
  <div class="setting-view">
    <el-card>
      <div class="theme-settings">
        <h2 v-on="longPress()">皮肤设置</h2>
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

    <!-- 新增皮肤开发对话框 -->
    <el-dialog
      class="dev-dialog"
      v-model="showDevDialog"
      width="80%"
      :close-on-click-modal="false"
      destroy-on-close
      :show-close="false"
      @close="handlecloseDevDialog"
    >
      <div class="dev-container">
        <div class="dev-header">
          <div class="style-title">
            <span title="点击查看效果" class="run" @click="run">🎨</span>
            <!-- <el-button size="small" >🎨</el-button> -->
          </div>

          <span
            class="header-close"
            size="small"
            @click="showDevDialog = false"
          >
            ❎
          </span>
        </div>
        <div class="editor-container">
          <div ref="monacoContainer" class="monaco-editor"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import Config from "../tool/config";
import { SYSTEM_THEMES, THEME_TEMPLATE } from "../const/const";
import Monaco from "../tool/monaco";
import { Close } from "@element-plus/icons-vue";
import Event from "../tool/event";

const themes = ref([]);
const currentTheme = ref("default");
const showDevDialog = ref(false);
const monacoContainer = ref(null);

const longPress = () => {
  return Event.longPress(1000, handleOpenEditorDialog).value;
};

const changeTheme = async (theme) => {
  currentTheme.value = theme;
  await Config.setTheme(theme);
  await Config.applyTheme();
};

const handleOpenEditorDialog = () => {
  showDevDialog.value = true;
  nextTick(async () => {
    if (monacoContainer.value) {
      Monaco.create(
        monacoContainer.value,
        {
          language: "css",
        },
        THEME_TEMPLATE,
        () => {
          // const content = Monaco.getValue().trim();
          // Config.applyDraftTheme(content);
        }
      );
    }
  });
};

const run = () => {
  const content = Monaco.getValue().trim();
  Config.applyDraftTheme(content);
};

const handlecloseDevDialog = async () => {
  Monaco.dispose();
  await Config.applyTheme();
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
  .el-overlay {
    pointer-events: none;
  }
  .dev-dialog {
    background: rgba(0, 0, 0, 0.5);
    pointer-events: auto;

    header {
      display: none;
    }
    .dev-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      position: relative;
      padding-top: 40px;
      backdrop-filter: blur(10px);
      opacity: 0.5;
      .dev-header {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 90;
        width: calc(100% - 40px);
        padding: 5px 20px !important;
        transition: opacity 0.3s ease;
        .run {
          cursor: pointer;
          font-size: 16px;
          margin-left: 10px;
        }
        .header-close {
          position: absolute;
          right: 0;
          top: 0px;
          cursor: pointer;
        }
      }
      .editor-container {
        flex: 1;
        height: 80%;
        // border: 1px solid #dcdfe6;
        // border-radius: 4px;
        overflow: hidden;

        .monaco-editor {
          height: 100%;
          min-height: 400px;
        }
      }
    }
  }
}
</style>
