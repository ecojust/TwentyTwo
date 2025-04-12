export default class Generater {
  static generatePluginName(url: string) {
    // 去除 URL 中的特殊字符
    const cleanUrl = url.replace(/^https?:\/\//, "").replace(/[^\w\d.-]/g, "_");

    // 创建一个基于清理后 URL 的哈希值
    let hash = 0;
    for (let i = 0; i < cleanUrl.length; i++) {
      const char = cleanUrl.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }

    // 确保哈希值为正数并转为16进制
    const positiveHash = Math.abs(hash).toString(16);

    return `plugin_${positiveHash}.js`;
  }
}
