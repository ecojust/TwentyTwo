<template>
  <div class="plugins-view">
    <el-card>
      <template #header>
        <div class="view-header">
          <h2>插件管理</h2>
        </div>
      </template>

      <el-card class="plugin-import" shadow="hover">
        <template #header>
          <h3>导入插件</h3>
        </template>
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
        <div class="import-options">
          <el-button @click="importFromLocal" :icon="Upload" type="info" plain>
            从本地文件导入
          </el-button>
        </div>
      </el-card>

      <div class="plugin-list">
        <h3>已安装插件</h3>

        <el-empty
          v-if="plugins.length === 0"
          description="暂无已安装插件，请通过URL或本地文件导入插件"
          :image-size="200"
        ></el-empty>

        <el-row v-else :gutter="20">
          <el-col
            v-for="plugin in plugins"
            :key="plugin.id"
            :xs="24"
            :sm="12"
            :md="8"
          >
            <el-card class="plugin-card" shadow="hover">
              <div class="plugin-header">
                <h4>{{ plugin.name }}</h4>
                <el-tag
                  :type="plugin.active ? 'success' : 'info'"
                  size="small"
                  effect="light"
                >
                  {{ plugin.active ? "已启用" : "已禁用" }}
                </el-tag>
              </div>

              <div class="plugin-info">
                <p>{{ plugin.description }}</p>
                <p class="plugin-version">版本: {{ plugin.version }}</p>
                <p class="plugin-author">作者: {{ plugin.author }}</p>
              </div>

              <div class="plugin-actions">
                <el-button
                  @click="togglePlugin(plugin.id)"
                  :type="plugin.active ? 'warning' : 'success'"
                  size="small"
                  plain
                >
                  {{ plugin.active ? "禁用" : "启用" }}
                </el-button>
                <el-button
                  @click="removePlugin(plugin.id)"
                  type="danger"
                  size="small"
                  plain
                >
                  删除
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { usePluginsStore } from "../stores/plugins";
// 修改这一行，使用新的插件
import { open } from "@tauri-apps/plugin-dialog";
import { Upload } from "@element-plus/icons-vue";
import File from "../tool/file";

const pluginsStore = usePluginsStore();

const pluginUrl = ref("");
const isImporting = ref(false);

const plugins = computed(() => pluginsStore.plugins);

// 从URL导入插件
async function importPlugin() {
  if (!pluginUrl.value.trim()) return;
  isImporting.value = true;
  try {
    await pluginsStore.importPluginFromUrl(pluginUrl.value);
    pluginUrl.value = "";
  } catch (error) {
    console.error("导入插件出错:", error);
  } finally {
    isImporting.value = false;
  }
}

// 切换插件启用状态
function togglePlugin(id) {
  // pluginsStore.togglePlugin(id);
}

// 删除插件
function removePlugin(id) {
  pluginsStore.removePlugin(id);
}

onMounted(() => {
  pluginsStore.loadPlugins();
});
</script>

<style scoped>
.plugins-view {
  width: 100%;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plugin-import {
  margin-bottom: 20px;
}

.import-form {
  margin-bottom: 15px;
}

.import-options {
  display: flex;
  gap: 10px;
}

.plugin-list {
  margin-top: 20px;
}

.plugin-card {
  margin-bottom: 20px;
  height: 100%;
  transition: transform 0.3s;
}

.plugin-card:hover {
  transform: translateY(-5px);
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.plugin-header h4 {
  margin: 0;
  font-size: 16px;
}

.plugin-info {
  margin-bottom: 20px;
}

.plugin-info p {
  margin: 5px 0;
}

.plugin-version,
.plugin-author {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.plugin-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
