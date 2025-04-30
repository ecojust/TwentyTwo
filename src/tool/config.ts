import File from "./file";
import {
  CONFIG_FILE_NAME,
  THEMES_FOLDER_NAME,
  SYSTEM_THEMES,
} from "../const/const";

import { IThemeItem } from "../const/interface";

export default class Config {
  static async getConfiguration() {
    const res = await File._readFile(
      CONFIG_FILE_NAME,
      JSON.stringify({
        theme: "Default",
        active_plugin: "",
      })
    );
    if (res?.success) {
      return JSON.parse(res.data);
    }
  }

  static async setTheme(theme: string) {
    const res = await this.getConfiguration();
    if (res) {
      res.theme = theme;
      return this.setConfiguration(res);
    }
  }

  static async applyTheme() {
    const res = await this.getConfiguration();
    if (res) {
      const theme = res.theme;
      let content = "";
      const find = SYSTEM_THEMES.find(
        (item: IThemeItem) => item.name === theme
      );
      if (find) {
        content = find.value;
      } else {
        const res = await File._readFile(
          `${THEMES_FOLDER_NAME}/${theme}.css`,
          ""
        );
        content = res?.data;
      }
      const themeStyle = document.querySelector("#theme");
      if (themeStyle) {
        themeStyle.textContent = content;
      }
    }
  }

  static async setConfiguration(config: any) {
    const res = await File._writeFile(CONFIG_FILE_NAME, JSON.stringify(config));
    return res;
  }
}
