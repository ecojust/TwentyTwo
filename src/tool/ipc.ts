import { invoke } from "@tauri-apps/api/core";

export default class IPC {
  static async crawlWebsite(url: string, useCheerio = false) {
    try {
      const method = useCheerio ? "crawlWithCheerio" : "crawlWithPuppeteer";
      const result = await invoke("node:call", {
        module: "crawler",
        method,
        args: [url],
      });

      return result;
    } catch (error) {
      console.error("爬取失败:", error);
      throw error;
    }
  }
}
