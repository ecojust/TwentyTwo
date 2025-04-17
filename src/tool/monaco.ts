import * as monaco from "monaco-editor";
import { invoke } from "@tauri-apps/api/core";
import * as cheerio from "cheerio";
import { IPlugin, IResult } from "../const/interface";

export default class Monaco {
  static editor: monaco.editor.IStandaloneCodeEditor | null = null;
  static container: HTMLElement | null = null;

  /**
   * 创建Monaco编辑器实例
   * @param container 编辑器容器元素
   * @param options 编辑器配置选项
   * @param value 初始内容
   * @returns 编辑器实例
   */
  static create(
    container: HTMLElement,
    options: monaco.editor.IStandaloneEditorConstructionOptions = {},
    value?: string,
    onBlur?: Function
  ): monaco.editor.IStandaloneCodeEditor {
    this.container = container;

    const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
      value:
        value ||
        `
(() => {
  return {
    name: "lzrs",
    description: "xxxxxx",
    version: "1.0.0",
    author: "lzrs.cc",
    search: {
      url: "https://xxxxxx?wd={keyword}",
      description: "获取搜索列表",
      parse: function (html) {
        const $ = cheerio.load(html);
        const listItems = $(".module-items .module-item")
                    .map((index, element) => {
                        // 或者获取元素的特定属性
                        const href = $(element).find(".module-card-item-title a").attr("href");
                        const title = $(element).find(".module-card-item-title").text().trim();
                        const thumbnail = $(element).find(".module-item-pic img").data("original");
                        const score = $(element).find(".pic-tag-top").text().trim();
                        // 返回你需要的数据结构
                        return {
                            title,
                            href: "https://lzrs.cc" + href,
                            thumbnail,
                            score:'--',
                            source: "lzrs",
                        };
                    })
                    .get();
        return listItems;
      },
    },
    detail: {
      description: "详情页面，获取播放地址",
      parse: function (html) {
        const $ = cheerio.load(html);
        const playUrl = $('.module-info-content').find(".module-info-play a").attr("href");
        return "https://lzrs.cc" + playUrl;
      },
    },
    play: {
      description: "播放页面，获取真实播放地址",
      mediaType: "m3u8",
      parse: function (html) {                
                let url = '';
                return url;
      },
    },
  };
})()
      

      `,
      language: "javascript",
      theme: "vs-dark",
      automaticLayout: true,
      minimap: {
        enabled: true,
      },
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 4,
    };

    // 创建编辑器实例
    this.editor = monaco.editor.create(container, {
      ...defaultOptions,
      ...options,
    });
    this.editor.onDidBlurEditorText(() => {
      onBlur && onBlur();
    });

    return this.editor;
  }

  /**
   * 获取当前编辑器实例
   */
  static getEditor(): monaco.editor.IStandaloneCodeEditor | null {
    return this.editor;
  }

  /**
   * 获取编辑器内容
   */
  static getValue(): string {
    return this.editor?.getValue() || "";
  }

  /**
   * 设置编辑器内容
   * @param value 要设置的内容
   */
  static setValue(value: string): void {
    this.editor?.setValue(value);
  }

  /**
   * 更新编辑器配置
   * @param options 要更新的配置选项
   */
  static updateOptions(options: monaco.editor.IEditorOptions): void {
    this.editor?.updateOptions(options);
  }

  /**
   * 销毁编辑器实例，释放资源
   */
  static dispose(): void {
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }

    // 清空容器内容
    if (this.container) {
      this.container.innerHTML = "";
      this.container = null;
    }
  }

  static async _fetchIPC(url: string, type: string = "html") {
    return await invoke(type == "html" ? "fetch_url" : "fetch_request", {
      url: url,
    });
  }

  static async runSearch() {
    //@ts-ignore
    window.cheerio = cheerio;
    const value = this.getValue().trim();
    const func = eval(value) as any;
    const search = func.search;

    const keyword = "成龙";
    const url = search.url.replace("{keyword}", keyword);
    const res = (await this._fetchIPC(url)) as IResult;
    if (!res.success) {
      return res;
    }
    const html = res.data;
    const list = search.parse(html);
    return list;
  }

  static async runDetails(detail_url: string) {
    //@ts-ignore
    window.cheerio = cheerio;
    const value = this.getValue().trim();
    const func = eval(value) as IPlugin;
    const detail = func.detail;
    const res = (await this._fetchIPC(detail_url as string)) as IResult;
    if (!res.success) {
      return res;
    }
    const play_url = detail.parse(res.data);
    return play_url;
  }

  static async runPlay(play_url: string) {
    //@ts-ignore
    window.cheerio = cheerio;
    const value = this.getValue().trim();
    const func = eval(value) as IPlugin;
    const play = func.play;
    const res = (await this._fetchIPC(
      play_url as string,
      play.parseType
    )) as IResult;
    if (!res.success) {
      return res;
    }
    const video_url = play.parse(res.data);
    return video_url;
  }
}
