import { defineStore } from "pinia";
import { ref, computed } from "vue";
import File from "../tool/file";
import { IPlugin, IResult } from "../const/interface";
import { invoke } from "@tauri-apps/api/core";
import { ElMessage } from "element-plus";

export const usePluginsStore = defineStore("plugins", () => {
  // 存储插件列表
  const plugins = ref<IPlugin[]>([]);

  // 计算活跃的插件
  const activePlugins = computed(() => {
    // return plugins.value.filter((plugin) => plugin.active);
    return [];
  });

  // 从本地存储加载插件
  const loadPlugins = async () => {
    const savedPlugins = await File.getPlugins();

    console.log("savedPlugins", savedPlugins);
    if (savedPlugins) {
      try {
        plugins.value = savedPlugins;
      } catch (e) {
        console.error("加载插件失败:", e);
      }
    }
  };

  // 从URL导入插件
  const importPluginFromUrl = async (url: string) => {
    try {
      const response = (await invoke("fetch_url", {
        url: url,
      })) as IResult;
      if (!response.success) {
        throw new Error(`请求失败: ${response.data}`);
      }

      const pluginName = url.split("/").pop();
      if (!pluginName) {
        throw new Error("无法获取插件名称");
      }

      await File.pushPlugin(pluginName!, response.data);
      await loadPlugins();
      ElMessage.success("导入插件成功");
    } catch (error) {
      console.error("导入插件失败:", error);
      ElMessage.error("导入插件失败");

      throw error;
    }
  };

  // 移除插件
  const removePlugin = async (name: string) => {
    await File.deletePlugin(name);
    await loadPlugins();
  };

  // 初始化时加载插件
  loadPlugins();

  return {
    plugins,
    activePlugins,
    importPluginFromUrl,
    removePlugin,
    loadPlugins,
  };
});
