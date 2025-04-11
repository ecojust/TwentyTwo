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
  detail: {
    direct: false,
    description: "需要进一步解析网页获取真实地址",
    parse: function (html: string) {
      const $ = cheerio.load(html);
      const firstPlayBtn = $(".hl-play-btn").eq(0);
      const playurl = firstPlayBtn.attr("href");
      return "https://www.x139.cn" + playurl;
    },
  },
  play: {
    description: "播放页面，获取真实播放地址",
    mediaType: "m3u8",
    parse: function (html: string) {
      // 使用正则表达式匹配以.m3u8结尾的URL
      const m3u8Regex = /(https?:\/\/[^\s"']+\.m3u8)/g;
      const matches = html.match(m3u8Regex);

      // 如果找到匹配项，返回第一个匹配的m3u8链接
      if (matches && matches.length > 0) {
        console.log("找到m3u8链接:", matches[0]);
        return matches[0];
      }

      // 如果没有找到匹配项，尝试使用cheerio解析
      const $ = cheerio.load(html);
      // 可以在这里添加其他解析逻辑，如果需要的话

      console.log("未找到m3u8链接");
      return null;
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

  static async getPlayUrl(detail_url: string) {
    console.log("开始解析", detail_url);
    let play_url = "",
      res = {} as IResult;
    if (pluginTemplate.detail.direct) {
      play_url = detail_url;
    } else {
      res = (await this._fetchIPC(detail_url)) as IResult;
      if (!res.success) {
        return res;
      }
      const html = res.data;
      play_url = pluginTemplate.detail.parse(html);
    }

    res = (await this._fetchIPC(play_url as string)) as IResult;
    if (!res.success) {
      return res;
    }
    const video_url = pluginTemplate.play.parse(res.data);

    return {
      success: true,
      message: "解析成功",
      data: video_url,
      type: pluginTemplate.play.mediaType,
    };
  }
}
