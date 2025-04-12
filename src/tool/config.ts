import File from "./file";
import { CONFIG_FILE_NAME } from "../const/const";

export default class Config {
  static async getConfiguration() {
    const res = await File._readFile(
      CONFIG_FILE_NAME,
      JSON.stringify({
        theme: "light",
        active_plugin: "",
      })
    );
    if (res?.success) {
      return JSON.parse(res.data);
    }
  }

  static async setConfiguration(config: any) {
    const res = await File._writeFile(CONFIG_FILE_NAME, JSON.stringify(config));
    return res;
  }
}
