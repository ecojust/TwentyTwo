import File from "./file";
import { IHistory } from "../const/interface";
import { HISTORY_FILE_NAME } from "../const/const";

export default class History {
  static async getHistory() {
    const res = await File._readFile(HISTORY_FILE_NAME, JSON.stringify([]));
    if (res?.success) {
      return JSON.parse(res.data).sort(
        (a: IHistory, b: IHistory) =>
          new Date(b.time).getTime() - new Date(a.time).getTime()
      );
    }
  }

  static async pushHistory(data: any) {
    const res = await File._readFile(HISTORY_FILE_NAME, JSON.stringify([]));
    const history = JSON.parse(res?.data || "[]");
    history.push(Object.assign(data, { time: new Date().toLocaleString() }));
    history.splice(30, history.length - 30);
    await File._writeFile(HISTORY_FILE_NAME, JSON.stringify(history));
  }
}
