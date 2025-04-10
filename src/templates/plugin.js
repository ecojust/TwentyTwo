
const plugin = {
    name: "x139",
    description: "x139影视",
    version: "1.0.0",
    author: "x139",
    search: {
        url: "https://www.x139.cn/search.php?searchword={keyword}",
        description: "x139搜索",
        parse: function (html) {
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
        parse: function (html) {
            // 使用 Cheerio 加载 HTML 内容
            const $ = cheerio.load(html);
            // 获取所有类名为hl-list-item的元素
            const listItems = $("script").get();
            return listItems;
        }
    }
}