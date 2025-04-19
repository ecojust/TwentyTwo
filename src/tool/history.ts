import File from "./file";
import { IVideo } from "../const/interface";
import { HISTORY_FILE_NAME } from "../const/const";

export default class History {
  static async clearHistory() {
    await File._writeFile(HISTORY_FILE_NAME, JSON.stringify([]));
  }

  static async getHistory() {
    const res = await File._readFile(HISTORY_FILE_NAME, JSON.stringify([]));
    if (res?.success) {
      return JSON.parse(res.data).sort(
        (a: IVideo, b: IVideo) =>
          new Date(b.time).getTime() - new Date(a.time).getTime()
      );
    }
  }

  static async pushHistory(data: IVideo) {
    const res = await File._readFile(HISTORY_FILE_NAME, JSON.stringify([]));
    const history = JSON.parse(res?.data || "[]");
    history.push(Object.assign(data, { time: new Date().toLocaleString() }));
    history.splice(30, history.length - 30);
    await File._writeFile(HISTORY_FILE_NAME, JSON.stringify(history));
  }
}
