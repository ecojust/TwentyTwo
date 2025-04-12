import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { IPlugin, IResult } from "../const/interface";
import { invoke } from "@tauri-apps/api/core";
import Plugin from "../tool/plugin";
import Generater from "../tool/generater";
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
    const savedPlugins = await Plugin.getPlugins();

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
      // 基本调用
      const response = (await invoke("http_get", {
        url: url,
      })) as IResult;

      console.log("response", response);
      if (!response.success) {
        throw new Error(`请求失败: ${response.data}`);
      }

      const pluginName = Generater.generatePluginName(url);

      console.log("pluginName", pluginName);

      // const existingPlugin = plugins.value.find(
      //   (plugin) => plugin.file_name === pluginName
      // );
      // if (existingPlugin) {
      //   throw new Error("插件已存在");
      // }
      await Plugin.pushPlugin(pluginName, response.data);
      await loadPlugins();
      ElMessage.success(`导入插件成功:${pluginName}`);
    } catch (error) {
      console.error("导入插件失败:", error);
      ElMessage.error("导入插件失败");

      throw error;
    }
  };

  // 移除插件
  const removePlugin = async (name: string) => {
    await Plugin.deletePlugin(name);
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
