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
    value: string = ""
  ): monaco.editor.IStandaloneCodeEditor {
    this.container = container;

    // 合并默认选项
    const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
      value: `
      
      
      (() => {
  return {
    name: "mgdy5",
    description: "满格影视",
    version: "1.0.0",
    author: "mgdy5",
    search: {
      url: "https://mgdy5.cc/vodsearch.html?wd={keyword}&submit=",
      description: "x139搜索",
      parse: function (html) {
        const $ = cheerio.load(html);
        const listItems = $("#searchList .clearfix")
          .map((index, element) => {
            // 或者获取元素的特定属性
            const href = $(element).find(".btn-warm").attr("href");
            const title = $(element).find(".searchkey").text().trim();
            const thumbnail = $(element).find(".myui-vodlist__thumb").data("original");
            const score = $(element).find(".pic-tag-top").text().trim();
            // 返回你需要的数据结构
            return {
              title,
              href: "https://mgdy5.cc" + href,
              thumbnail,
              score,
              source: "mgdy5",
            };
          })
          .get();
        return listItems;
      },
    },
   
    play: {
      description: "播放页面，获取真实播放地址",
      mediaType: "m3u8",
      parse: function (html) {
       // 使用正则表达式匹配以.m3u8结尾的URL
        const m3u8Regex = /(https?:\/\/[^\s"']+\.m3u8)/g;
        const matches = html.match(m3u8Regex);
        let url = '';
        if (matches && matches.length > 0) {
          console.log("找到m3u8链接:", matches[0]);
          url =  matches[0];
        }
         url =  url.split('url=')[1];
        console.log("url",url);
        return url.split('url=')[1];
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

  static async _fetchIPC(url: string) {
    return await invoke("fetch_url", {
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

  static async runDetails() {}

  static async runPlay(play_url: string) {
    //@ts-ignore
    window.cheerio = cheerio;
    const value = this.getValue().trim();
    const func = eval(value) as IPlugin;
    const play = func.play;
    const res = (await this._fetchIPC(play_url as string)) as IResult;
    if (!res.success) {
      return res;
    }
    const video_url = play.parse(res.data);
    return video_url;
  }
}
