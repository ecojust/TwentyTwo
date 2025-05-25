// import { fetch } from "@tauri-apps/plugin-http";
const baseUrl = "http://111.229.154.132:5555/?s=module&c=service22&m=";
export default class Fetch {
  static async get(url: string) {
    try {
      if (url.indexOf("http") === -1) {
        url = baseUrl + url;
      }
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }).then((res) => res.json());
      return response;
    } catch (error) {
      console.error("请求出错：", error);
      throw error;
    }
  }

  static async post(url: string, body: Record<string, any>) {
    try {
      if (url.indexOf("http") === -1) {
        url = baseUrl + url;
      }

      const formData = new FormData();
      for (const key in body) {
        formData.append(key, body[key]);
      }
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      }).then((res) => res.json());
      return response;
    } catch (error) {
      console.error("请求出错：", error);
      throw error;
    }
  }
}
