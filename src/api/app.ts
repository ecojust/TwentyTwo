import Fetch from "./fetch";

export default class App {
  static async getNotifyList() {
    const res = await Fetch.get(`getNotify`);
    if (res.code === 200) {
      return res.data.data;
    } else {
      return [];
    }
  }
}
