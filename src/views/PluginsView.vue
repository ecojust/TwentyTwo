<template>
  <div class="plugins-view">
    <el-card>
      <template #header>
        <div class="view-header" v-on="longPress()">
          <h2>插件管理</h2>
          <div>
            <el-button type="primary" @click="showImportDialog = true"
              >导入插件</el-button
            >
          </div>
        </div>
      </template>

      <!-- 原来的导入插件卡片被移除 -->

      <div class="plugin-list">
        <h3>已安装插件</h3>

        <el-empty
          v-if="plugins.length === 0"
          description="暂无已安装插件，请通过URL导入插件"
          :image-size="200"
        ></el-empty>

        <el-row v-else :gutter="20">
          <el-scrollbar wrap-style="height:calc(100vh - 310px);width:100%;">
            <div
              class="plugin-item"
              v-for="plugin in plugins"
              :key="plugin.id"
              :xs="24"
              :sm="12"
              :md="8"
            >
              <el-card
                @click="setPlugin(plugin)"
                class="plugin-card"
                shadow="hover"
              >
                <div class="plugin-header">
                  <h4>{{ plugin.name }}</h4>
                  <el-tag
                    v-show="plugin.id === config.active_plugin"
                    type="success"
                    size="small"
                    effect="light"
                  >
                    已启用
                  </el-tag>
                </div>

                <div class="plugin-info">
                  <p>{{ plugin.description }}</p>
                  <p class="plugin-version">版本: {{ plugin.version }}</p>
                  <p class="plugin-author">作者: {{ plugin.author }}</p>
                </div>

                <div class="plugin-actions">
                  <span class="file-name">{{ plugin.id }}</span>
                  <el-button
                    @click.stop="deletePlugin(plugin)"
                    type="warning"
                    size="small"
                    plain
                  >
                    删除插件
                  </el-button>
                </div>

                <div class="count">
                  {{ plugin.usage }}
                </div>
              </el-card>
            </div>
          </el-scrollbar>
        </el-row>
      </div>
    </el-card>

    <!-- 新增导入插件对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="导入插件"
      width="500px"
      destroy-on-close
    >
      <div class="import-form">
        <el-input v-model="pluginUrl" placeholder="输入插件URL..." clearable>
          <template #append>
            <el-button
              @click="importPlugin"
              :loading="isImporting"
              type="primary"
            >
              {{ isImporting ? "导入中..." : "导入" }}
            </el-button>
          </template>
        </el-input>
      </div>
    </el-dialog>

    <!-- 新增插件开发对话框 -->
    <el-dialog
      class="dev-dialog"
      v-model="showDevDialog"
      width="80%"
      destroy-on-close
      fullscreen
      :show-close="false"
      @close="handlecloseDevDialog"
    >
      <div class="dev-container">
        <div class="dev-header">
          <!-- <div class="tv-style-title">插件调试</div> -->
          <el-button
            class="player-header-close"
            type="primary"
            size="small"
            @click="showDevDialog = false"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="editor-container">
          <div ref="monacoContainer" class="monaco-editor"></div>
        </div>
        <div class="console-container">
          <div class="console-header">
            <h4>控制台</h4>
            <el-button
              v-show="showSearch"
              type="primary"
              size="small"
              @click="runSearch"
              >运行search</el-button
            >
            <el-button
              v-show="showDetail"
              type="success"
              size="small"
              @click="runDetail"
              >运行detail</el-button
            >
            <el-button
              v-show="showPlay"
              type="warning"
              size="small"
              @click="runPlay"
              >运行play</el-button
            >
          </div>
          <div class="console-output" ref="consoleOutput">
            <pre>{{ result }}</pre>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  onActivated,
} from "vue";
import { usePluginsStore } from "../stores/plugins";
// 移除未使用的 open 导入
import { Upload } from "@element-plus/icons-vue";
import Config from "../tool/config";
import { ElMessage } from "element-plus";
import Monaco from "../tool/monaco";
import { Close } from "@element-plus/icons-vue";
import Event from "../tool/event";
import Plugin from "../tool/plugin";

const longPress = () => {
  return Event.longPress(1000, handleOpenEditorDialog).value;
};
const pluginsStore = usePluginsStore();
const monacoContainer = ref(null);
const consoleOutput = ref(null);
const pluginUrl = ref("");
const isImporting = ref(false);
const showImportDialog = ref(false);
const showDevDialog = ref(false);
const searchList = ref([]);
const detailInfo = ref({});
const config = ref({
  theme: "light",
  active_plugin: "",
});
const result = ref([]);
const plugins = computed(() => pluginsStore.plugins);
const showSearch = ref(true);
const showDetail = ref(true);
const showPlay = ref(true);
const usage = ref({});

const handleOpenEditorDialog = () => {
  showDevDialog.value = true;
  nextTick(async () => {
    if (monacoContainer.value) {
      const content = await Plugin.getDraftPlugin();

      console.log("content", content);
      Monaco.create(monacoContainer.value, {}, content, () => {
        const content = Monaco.getValue().trim();
        Plugin.setDraftPlugin(content);
        const obj = eval(content);
        if (obj) {
          showSearch.value = Object.prototype.hasOwnProperty.call(
            obj,
            "search"
          );
          showDetail.value = Object.prototype.hasOwnProperty.call(
            obj,
            "detail"
          );
          showPlay.value = Object.prototype.hasOwnProperty.call(obj, "play");
        } else {
          showSearch.value = false;
          showDetail.value = false;
          showPlay.value = false;
        }
      });
    }
  });
};

const handlecloseDevDialog = () => {
  Monaco.dispose();
};

const runSearch = async () => {
  try {
    result.value = await Monaco.runSearch();
    searchList.value = result.value;
  } catch (error) {
    ElMessage.error(`运行search失败: ${error.message}`);
    console.error("运行search失败:", error);
  }
};

const runDetail = async () => {
  try {
    if (searchList.value.length === 0) {
      ElMessage.warning("请先运行search获取列表");
      return;
    }
    const url = searchList.value[0].href;
    const detail = await Monaco.runDetails(url);
    detailInfo.value = detail;
    result.value = detail;
  } catch (error) {
    ElMessage.error(`运行detail失败: ${error.message}`);
    console.error("运行detail失败:", error);
  }
};

const runPlay = async () => {
  try {
    const url = detailInfo.value;
    const playInfo = await Monaco.runPlay(url);
    result.value = playInfo;
  } catch (error) {
    ElMessage.error(`运行play失败: ${error.message}`);
    console.error("运行play失败:", error);
  }
};

// 从URL导入插件
async function importPlugin() {
  if (!pluginUrl.value.trim()) {
    ElMessage.warning("请输入插件URL");
    return;
  }

  isImporting.value = true;
  try {
    await pluginsStore.importPluginFromUrl(pluginUrl.value);
    pluginUrl.value = "";
    showImportDialog.value = false;
  } catch (error) {
    console.error("导入插件出错:", error);
  } finally {
    isImporting.value = false;
  }
}

const setPlugin = async (plugin) => {
  try {
    config.value.active_plugin = plugin.id;
    await Config.setConfiguration(config.value);
    ElMessage.success(`已启用插件: ${plugin.name}`);
  } catch (error) {
    ElMessage.error(`设置插件失败: ${error.message}`);
    console.error("设置插件失败:", error);
  }
};

const deletePlugin = async (plugin) => {
  try {
    console.log("plugin", plugin);
    await Plugin.deletePlugin(plugin.id);
    await pluginsStore.loadPlugins();
    ElMessage.success(`已删除插件: ${plugin.name}`);
  } catch (error) {
    ElMessage.error(`删除插件失败: ${error.message}`);
    console.error("删除插件失败:", error);
  }
};

const init = async () => {
  try {
    await pluginsStore.loadPlugins();
    config.value = await Config.getConfiguration();
  } catch (error) {
    console.error("初始化失败:", error);
  }
};

onActivated(async () => {
  await init();
});

onMounted(async () => {
  await init();
});

onBeforeUnmount(() => {
  Monaco.dispose();
});
</script>

<style lang="less">
.plugins-view {
  width: 100%;

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .plugin-list {
    margin-top: 20px;

    .plugin-item {
      width: 300px;
      height: 200px;
      vertical-align: top;
      display: inline-block;
      margin: 10px;
      cursor: pointer;
      position: relative;

      .plugin-card {
        margin-bottom: 20px;
        height: 100%;
        transition: transform 0.3s;
        transform: translateY(0px);

        &:hover {
          transform: translateY(-5px);
        }

        .plugin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;

          h4 {
            margin: 0;
            font-size: 16px;
          }
        }

        .plugin-info {
          margin-bottom: 20px;

          p {
            margin: 5px 0;
          }

          .plugin-version,
          .plugin-author {
            font-size: 0.9rem;
            color: var(--text-secondary);
          }
        }

        .plugin-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          .file-name {
            font-size: 0.9rem;
            color: var(--el-text-color-secondary);
          }
        }
        .count {
          position: absolute;
          left: 0px;
          top: 0px;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(10px); /* 添加毛玻璃效果 */
          -webkit-backdrop-filter: blur(10px); /* Safari 浏览器兼容 */
          z-index: -1;
          font-size: 3rem;
          color: transparent;
          -webkit-text-stroke: 1px var(--el-text-color-secondary);
        }
      }
    }
  }

  .import-form {
    margin-bottom: 15px;
  }

  .import-options {
    display: flex;
    gap: 10px;
  }

  .dev-dialog {
    background: black;
    header {
      display: none;
    }
    // 插件开发相关样式
    .dev-container {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 0px);
      overflow: hidden;
      position: relative;
      .dev-header {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 90;
        width: calc(100% - 40px);
        padding: 5px 20px !important;
        transition: opacity 0.3s ease;

        &.controls-hidden {
          opacity: 0;
          pointer-events: none;
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

      .console-container {
        min-height: 260px;
        height: 20%;

        // border: 1px solid #dcdfe6;
        // border-radius: 4px;
        display: flex;
        flex-direction: column;

        .console-header {
          display: flex;
          align-items: center;
          padding: 8px 15px;
          // border-bottom: 1px solid #dcdfe6;
          background-color: #f5f7fa;

          h4 {
            margin: 0;
            margin-right: auto;
          }

          .el-button {
            margin-left: 10px;
          }
        }

        .console-output {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          background-color: #1e1e1e;
          color: #d4d4d4;
          font-family: monospace;
        }
      }
    }
  }
}
</style>
