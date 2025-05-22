import mergeImages from "merge-images";
import html2canvas from "html2canvas";

export default class Generater {
  static generateName(url: string) {
    const cleanUrl = url.replace(/^https?:\/\//, "").replace(/[^\w\d.-]/g, "_");
    let hash = 0;
    for (let i = 0; i < cleanUrl.length; i++) {
      const char = cleanUrl.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const positiveHash = Math.abs(hash).toString(16);
    return positiveHash;
  }

  // 加密频道信息
  static encryptChannel(channelName: string, channelId: string): string {
    try {
      // 创建一个包含频道名称和ID的对象
      const channelInfo = {
        name: channelName,
        id: channelId,
        timestamp: new Date().getTime(),
      };

      // 将对象转换为JSON字符串
      const jsonString = JSON.stringify(channelInfo);

      // 使用Base64编码
      const base64Encoded = btoa(jsonString);

      // 简单的混淆处理，将Base64字符串反转并添加一个特定前缀
      const reversed = base64Encoded.split("").reverse().join("");
      const encrypted = `vsch_${reversed}`;

      return encrypted;
    } catch (error) {
      console.error("频道信息加密失败:", error);
      return "";
    }
  }

  // 解密频道信息
  static decryptChannel(
    encryptedString: string
  ): { name: string; id: string; timestamp: string } | null {
    try {
      // 检查前缀是否正确
      if (!encryptedString.startsWith("vsch_")) {
        throw new Error("无效的加密字符串格式");
      }

      // 移除前缀并反转字符串
      const reversed = encryptedString.substring(5);
      const base64Encoded = reversed.split("").reverse().join("");

      // Base64解码
      const jsonString = atob(base64Encoded);

      // 解析JSON
      const channelInfo = JSON.parse(jsonString);

      // 验证对象结构
      if (!channelInfo.name || !channelInfo.id) {
        throw new Error("解密后的数据格式不正确");
      }

      return {
        name: channelInfo.name,
        id: channelInfo.id,
        timestamp: channelInfo.timestamp,
      };
    } catch (error) {
      console.error("频道信息解密失败:", error);
      return null;
    }
  }

  // 生成缩略图云
  static async generateThumbnailCloud(thumbnails: string[]): Promise<string> {
    try {
      // 将远程图片转换为本地base64
      const base64Images = await Promise.all(
        thumbnails.map(async (url) => {
          return new Promise<string>(async (resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.style.cssText = `
              width:300px;
              height:300px;
              object-fit: cover;
            `;
            document.body.appendChild(img); // 将图片添加到do
            img.onload = async () => {
              // // 创建canvas元素
              // const canvas = document.createElement("canvas");
              // canvas.width = img.naturalWidth || 300;
              // canvas.height = img.naturalHeight || 300;

              // // 获取2D上下文并绘制图片
              // const ctx = canvas.getContext("2d");
              // ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);

              // // 转换为base64
              // const dataURL = canvas.toDataURL("image/png");
              // resolve(dataURL);
              // 创建一个容器来包裹图片，确保图片可见
              const container = document.createElement("div");
              container.style.cssText =
                "position: fixed; top: 0; left: 0; z-index: -1;";
              container.appendChild(img);
              document.body.appendChild(container);
              const canvas = await html2canvas(container, {
                backgroundColor: "#ffffff",
                useCORS: true,
                allowTaint: true,
                logging: true,
              });

              // 转换为base64
              const dataURL = canvas.toDataURL("image/png");
              document.body.removeChild(container);
              resolve(dataURL);
            };
            img.onerror = () => {
              console.error(`无法加载图片 ${url}`);
              // 返回一个透明的1x1像素图片作为替代
              resolve(
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
              );
            };

            img.src = url;
          });
        })
      );
      console.log("已转换为本地base64", base64Images);

      // const img = new Image();
      // img.style.cssText = `
      //   width:300px;
      //   height:300px;
      //   object-fit: cover;
      // `;
      // document.body.appendChild(img); // 将图片添加到do
      // img.onload = async () => {};
      // img.src = base64Images[0];

      // 使用本地base64图片创建合并图像
      const images = base64Images.map((src) => {
        // 随机位置，避免所有图片堆叠在一起
        const x = Math.floor(Math.random() * 300);
        const y = Math.floor(Math.random() * 300);
        return {
          src,
          x,
          y,
        };
      });

      const base64 = await mergeImages(images, {
        width: 800,
        height: 600,
      });

      console.log("已生成图片云canvas", base64);

      return base64;
    } catch (error) {
      console.error("生成图片云失败:", error);
      return "";
    }
  }
}
