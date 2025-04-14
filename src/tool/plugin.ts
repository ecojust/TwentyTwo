import { invoke } from "@tauri-apps/api/core";
import * as cheerio from "cheerio";
import { IPlugin, IResult } from "../const/interface";
import File from "./file";
import Config from "./config";
import { PLUGIN_FOLDER_NAME, DRAFT_PLUGIN_FILE } from "../const/const";

export default class Plugin {
  static _currentPlugin: IPlugin;

  static async getDraftPlugin() {
    const res = (await File._readFile(DRAFT_PLUGIN_FILE)) as IResult;
    if (!res.success) {
      return "";
    } else {
      return res.data;
    }
  }

  static async setDraftPlugin(content: string) {
    await File._writeFile(DRAFT_PLUGIN_FILE, content);
  }

  static async getPlugins() {
    const entries = await File._readDir(PLUGIN_FOLDER_NAME);
    const plugins: Array<IPlugin> = [];
    for (const entry of entries) {
      if (entry.isFile) {
        const file = await File._readFile(
          `${PLUGIN_FOLDER_NAME}/${entry.name}`
        );

        if (file?.success) {
          const plugin = eval(file.data) as IPlugin;
          plugins.push(Object.assign(plugin, { file_name: entry.name }));
        }
      }
    }
    return plugins;
  }

  static async pushPlugin(name: string, data: string) {
    await File._writeFile(`${PLUGIN_FOLDER_NAME}/${name}`, data);
  }

  static async deletePlugin(name: string): Promise<IResult> {
    return File._deleteFile(`${PLUGIN_FOLDER_NAME}/${name}`);
  }

  static async setPlugin() {
    const config = await Config.getConfiguration();
    const plugins = await this.getPlugins();
    const activePlugin = plugins.find(
      (plugin) => plugin.file_name === config.active_plugin
    );
    if (!activePlugin) {
      return;
    }
    this._currentPlugin = activePlugin;

    //@ts-ignore
    window.cheerio = cheerio;
  }

  static async _fetchIPC(url: string) {
    return await invoke("fetch_url", {
      url: url,
    });
  }

  static async search(keyword: string) {
    if (!this._currentPlugin) {
      return {
        success: false,
        message: "请先设置插件",
        data: "",
      };
    }
    const targetURL = this._currentPlugin.search.url.replace(
      "{keyword}",
      keyword
    );
    const res = (await this._fetchIPC(targetURL)) as IResult;
    if (!res.success) {
      return res;
    }
    const html = res.data;
    const list = this._currentPlugin.search.parse(html);
    return {
      success: true,
      message: "解析成功",
      data: list,
    };
  }

  static async getPlayUrl(detail_url: string, updateMessage: Function) {
    let play_url = detail_url,
      res = {} as IResult;

    let message = "";
    if (this._currentPlugin.detail) {
      message += "解析详情页...";
      updateMessage(message);
      res = (await this._fetchIPC(detail_url)) as IResult;
      if (!res.success) {
        return res;
      }
      const html = res.data;
      play_url = this._currentPlugin.detail.parse(html);
    }

    message += ";解析播放页...";
    updateMessage(message);
    res = (await this._fetchIPC(play_url as string)) as IResult;
    if (!res.success) {
      return res;
    }
    const video_url = this._currentPlugin.play.parse(res.data);

    message += ";解析结束，即将播放...";
    updateMessage(message);
    return {
      success: true,
      message: "解析成功",
      data: video_url,
      type: this._currentPlugin.play.mediaType,
    };
  }
}
