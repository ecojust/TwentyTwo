<template>
  <div class="plugins-view">
    <el-card>
      <template #header>
        <div class="view-header">
          <h2>插件管理</h2>
          <el-button type="primary" @click="showImportDialog = true"
            >导入插件</el-button
          >
          <el-button type="primary" @click="handleOpenEditorDialog"
            >插件开发</el-button
          >
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
          <el-scrollbar wrap-style="height:calc(100vh - 300px);width:100%;">
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
                    v-show="plugin.file_name === config.active_plugin"
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
                  <span class="file-name">{{ plugin.file_name }}</span>
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
      <!-- <div class="import-options">
        <el-button @click="importFromLocal" :icon="Upload" type="info" plain>
          从本地文件导入
        </el-button>
      </div> -->
    </el-dialog>

    <!-- 新增插件开发对话框 -->
    <el-dialog
      v-model="showDevDialog"
      title="插件调试"
      width="80%"
      height="80%"
      destroy-on-close
      fullscreen
      @close="handlecloseDevDialog"
    >
      <div class="dev-container">
        <div class="editor-container">
          <div ref="monacoContainer" class="monaco-editor"></div>
        </div>
        <div class="console-container">
          <div class="console-header">
            <h4>日志控制台</h4>
            <el-button type="primary" size="small" @click="runSearch"
              >运行search</el-button
            >
            <el-button type="success" size="small" @click="runDetail"
              >运行detail</el-button
            >
            <el-button type="warning" size="small" @click="runPlay"
              >运行play</el-button
            >
          </div>
          <div class="console-output" ref="consoleOutput">
            <div
              v-for="(log, index) in logs"
              :key="index"
              :class="['log-item', log.type]"
            >
              {{ log.content }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { usePluginsStore } from "../stores/plugins";
// 修改这一行，使用新的插件
import { open } from "@tauri-apps/plugin-dialog";
import { Upload } from "@element-plus/icons-vue";
import File from "../tool/file";
import Config from "../tool/config";
import { ElMessage } from "element-plus";
import Monaco from "../tool/monaco";
const pluginsStore = usePluginsStore();

const monacoContainer = ref(null);
const consoleOutput = ref(null);
const logs = ref([]);
const pluginUrl = ref("");
const isImporting = ref(false);
const showImportDialog = ref(false);
const showDevDialog = ref(false);
const searchList = ref([]);
const detailInfo = ref({});
const playUrl = ref("");
const config = ref({
  theme: "light",
  active_plugin: "",
});

const plugins = computed(() => pluginsStore.plugins);

const handleOpenEditorDialog = () => {
  showDevDialog.value = true;
  nextTick(() => {
    if (monacoContainer.value) {
      Monaco.create(monacoContainer.value);
    }
  });
};

const handlecloseDevDialog = () => {
  Monaco.dispose();
};

const runSearch = async () => {
  searchList.value = await Monaco.runSearch();
};

const runDetail = async () => {
  const url = await Monaco.runDetails();
};

const runPlay = async () => {
  const url = searchList.value[0].href;
  await Monaco.runPlay(url);
};

// 从URL导入插件
async function importPlugin() {
  if (!pluginUrl.value.trim()) return;
  isImporting.value = true;
  try {
    await pluginsStore.importPluginFromUrl(pluginUrl.value);
    pluginUrl.value = "";
    showImportDialog.value = false; // 导入成功后关闭对话框
  } catch (error) {
    console.error("导入插件出错:", error);
  } finally {
    isImporting.value = false;
    console.log(plugins.value);
  }
}

const setPlugin = async (plugin) => {
  config.value.active_plugin = plugin.file_name;
  await Config.setConfiguration(config.value);
};

// 清空日志
function clearLogs() {
  logs.value = [];
}

onMounted(async () => {
  // pluginsStore.loadPlugins();
  config.value = await Config.getConfiguration();
});

onBeforeUnmount(() => {});
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
      display: inline-block;
      margin: 5px;
      cursor: pointer;

      .plugin-card {
        margin-bottom: 20px;
        height: 100%;
        transition: transform 0.3s;

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

  // 插件开发相关样式
  .dev-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 120px);

    .editor-container {
      flex: 1;
      min-height: 60%;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;

      .monaco-editor {
        height: 100%;
        min-height: 400px;
      }
    }

    .console-container {
      height: 250px;
      margin-top: 15px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      display: flex;
      flex-direction: column;

      .console-header {
        display: flex;
        align-items: center;
        padding: 8px 15px;
        border-bottom: 1px solid #dcdfe6;
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

        .log-item {
          padding: 3px 0;
          white-space: pre-wrap;
          word-break: break-all;

          &.info {
            color: #d4d4d4;
          }

          &.success {
            color: #4caf50;
          }

          &.error {
            color: #f44336;
          }
        }
      }
    }
  }
}
</style>
