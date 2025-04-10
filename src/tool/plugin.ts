import { invoke } from "@tauri-apps/api/core";
import * as cheerio from "cheerio";

const pluginTemplate = {
  name: "x139",
  description: "x139影视",
  version: "1.0.0",
  author: "x139",
  search: {
    url: "https://www.x139.cn/search.php?searchword={keyword}",
    description: "x139搜索",
    parse: function (html: string) {
      // 使用 Cheerio 加载 HTML 内容
      const $ = cheerio.load(html);
      // 获取所有类名为hl-list-item的元素
      const listItems = $(".hl-list-item")
        .map((index, element) => {
          // 或者获取元素的特定属性
          const href = $(element).find("a").attr("href");
          const title = $(element).find(".hl-item-title").text().trim();
          const thumbnail = $(element).find(".hl-item-thumb").data("original");
          const score = $(element).find(".score").text().trim();
          // 返回你需要的数据结构
          return {
            title,
            href: "https://www.x139.cn" + href,
            thumbnail,
            score,
            source: "x139",
          };
        })
        .get();
      return listItems;
    },
  },
  play: {
    direct: false,
    type: "m3u8",
    description: "需要进一步解析网页获取真实地址",
    parse: function (html: string) {
      // 使用正则表达式匹配以.m3u8结尾的URL
      //   const m3u8Regex = /(https?:\/\/[^\s"']+\.m3u8)/g;
      //   const matches = html.match(m3u8Regex);

      //   // 如果找到匹配项，返回第一个匹配的m3u8链接
      //   const m3u8Url = matches ? matches[0] : null;

      //   console.log("找到的m3u8链接:", m3u8Url);

      //   return html;
      // 使用 Cheerio 加载 HTML 内容
      const $ = cheerio.load(html);
      const listItems = $("script")
        .map((index, element) => {
          return $(element).text();
        })
        .get();
      return listItems;
    },
  },
};

interface IPlugin {
  search: {
    url: string;
    description: string;
  };
}

interface IResult {
  success: boolean;
  message: string;
  data: string;
}

export default class Plugin {
  static _currentPlugin: IPlugin;

  static setPlugin(plugin: IPlugin) {
    this._currentPlugin = plugin;
  }

  static async _fetchIPC(url: string) {
    return await invoke("fetch_url", {
      url: url,
    });
  }

  static async search(keyword: string) {
    const targetURL = this._currentPlugin.search.url.replace(
      "{keyword}",
      keyword
    );
    const res = (await this._fetchIPC(targetURL)) as IResult;
    if (!res.success) {
      return res;
    }
    const html = res.data;
    const list = pluginTemplate.search.parse(html);
    return {
      success: true,
      message: "解析成功",
      data: list,
    };
  }

  static async play(url: string) {
    if (pluginTemplate.play.direct) {
      return {
        success: true,
        message: "直接播放",
        data: url,
        type: pluginTemplate.play.type,
      };
    }

    const res = (await this._fetchIPC(url)) as IResult;
    if (!res.success) {
      return res;
    }
    const html = res.data;
    const videoURL = pluginTemplate.play.parse(html);
    return {
      success: true,
      message: "解析成功",
      data: videoURL,
      type: pluginTemplate.play.type,
    };
  }
}
