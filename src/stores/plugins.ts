import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  active: boolean
  url?: string
  path?: string
}

export const usePluginsStore = defineStore('plugins', () => {
  // 存储插件列表
  const plugins = ref<Plugin[]>([])

  // 计算活跃的插件
  const activePlugins = computed(() => {
    return plugins.value.filter(plugin => plugin.active)
  })

  // 从本地存储加载插件
  const loadPlugins = () => {
    const savedPlugins = localStorage.getItem('video-plugins')
    if (savedPlugins) {
      try {
        plugins.value = JSON.parse(savedPlugins)
      } catch (e) {
        console.error('加载插件失败:', e)
      }
    }
  }

  // 保存插件到本地存储
  const savePlugins = () => {
    localStorage.setItem('video-plugins', JSON.stringify(plugins.value))
  }

  // 从URL导入插件
  const importPluginFromUrl = async (url: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`)
      }
      
      const pluginData = await response.json()
      
      // 验证插件数据
      if (!pluginData.id || !pluginData.name) {
        throw new Error('无效的插件格式')
      }
      
      // 检查是否已存在
      const existingIndex = plugins.value.findIndex(p => p.id === pluginData.id)
      if (existingIndex !== -1) {
        // 更新现有插件
        plugins.value[existingIndex] = {
          ...pluginData,
          active: plugins.value[existingIndex].active,
          url
        }
      } else {
        // 添加新插件
        plugins.value.push({
          ...pluginData,
          active: true,
          url
        })
      }
      
      savePlugins()
      return true
    } catch (error) {
      console.error('导入插件失败:', error)
      throw error
    }
  }

  // 从本地文件导入插件
  const importPluginFromFile = async (path: string) => {
    try {
      // 这里需要使用Tauri API读取文件
      // 简化版本，实际实现需要使用Tauri的文件API
      const pluginData = { id: 'local-plugin', name: '本地插件', description: '从本地文件导入的插件', version: '1.0.0', author: '用户' }
      
      // 检查是否已存在
      const existingIndex = plugins.value.findIndex(p => p.id === pluginData.id)
      if (existingIndex !== -1) {
        // 更新现有插件
        plugins.value[existingIndex] = {
          ...pluginData,
          active: plugins.value[existingIndex].active,
          path
        }
      } else {
        // 添加新插件
        plugins.value.push({
          ...pluginData,
          active: true,
          path
        })
      }
      
      savePlugins()
      return true
    } catch (error) {
      console.error('导入本地插件失败:', error)
      throw error
    }
  }

  // 切换插件启用状态
  const togglePlugin = (id: string) => {
    const plugin = plugins.value.find(p => p.id === id)
    if (plugin) {
      plugin.active = !plugin.active
      savePlugins()
    }
  }

  // 移除插件
  const removePlugin = (id: string) => {
    const index = plugins.value.findIndex(p => p.id === id)
    if (index !== -1) {
      plugins.value.splice(index, 1)
      savePlugins()
    }
  }

  // 使用插件进行搜索
  const searchWithPlugin = async (pluginId: string, query: string) => {
    const plugin = plugins.value.find(p => p.id === pluginId)
    if (!plugin || !plugin.active) {
      return []
    }

    // 这里应该是实际调用插件的搜索功能
    // 简化版本，返回模拟数据
    return [
      {
        id: `${pluginId}-result-1`,
        title: `${query} 搜索结果 1 (来自 ${plugin.name})`,
        source: plugin.name,
        thumbnail: 'https://via.placeholder.com/300x200'
      },
      {
        id: `${pluginId}-result-2`,
        title: `${query} 搜索结果 2 (来自 ${plugin.name})`,
        source: plugin.name,
        thumbnail: 'https://via.placeholder.com/300x200'
      }
    ]
  }

  // 初始化时加载插件
  loadPlugins()

  // 如果没有插件，添加一个示例插件
  if (plugins.value.length === 0) {
    plugins.value.push({
      id: 'example-plugin',
      name: '示例插件',
      description: '这是一个示例插件，用于演示功能',
      version: '1.0.0',
      author: 'VideoSearch',
      active: true
    })
    savePlugins()
  }

  return {
    plugins,
    activePlugins,
    importPluginFromUrl,
    importPluginFromFile,
    togglePlugin,
    removePlugin,
    searchWithPlugin
  }
})