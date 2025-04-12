import {
  readFile,
  writeFile,
  mkdir,
  readDir,
  BaseDirectory,
  DirEntry,
  remove,
} from "@tauri-apps/plugin-fs";
import { IPlugin, IResult, IHistory } from "../const/interface";

export default class File {
  static async getHistory() {
    const res = await this._readFile(`history.json`, JSON.stringify([]));
    console.log("getHistory", res);
    if (res?.success) {
      return JSON.parse(res.data).sort(
        (a: IHistory, b: IHistory) =>
          new Date(b.time).getTime() - new Date(a.time).getTime()
      );
    }
  }

  static async pushHistory(data: any) {
    const res = await this._readFile(`history.json`, JSON.stringify([]));
    const history = JSON.parse(res?.data || "[]");
    history.push(Object.assign(data, { time: new Date().toLocaleString() }));
    history.splice(30, history.length - 30);
    await this._writeFile(`history.json`, JSON.stringify(history));
    console.log("pushHistory", res);
  }

  static async getConfiguration() {
    const res = await this._readFile(
      `settings.json`,
      JSON.stringify({
        theme: "light",
        active_plugin: "",
      })
    );

    console.log("getConfiguration", res);
    if (res?.success) {
      return JSON.parse(res.data);
    }
  }

  static async setConfiguration(config: any) {
    const res = await this._writeFile(`settings.json`, JSON.stringify(config));
    return res;
  }

  static async getPlugins() {
    const entries = await this._readDir("plugins");
    const plugins: Array<IPlugin> = [];
    for (const entry of entries) {
      if (entry.isFile) {
        const file = await this._readFile(`plugins/${entry.name}`);

        if (file?.success) {
          const plugin = eval(file.data) as IPlugin;
          plugins.push(Object.assign(plugin, { file_name: entry.name }));
        }
      }
    }

    console.log("getPlugins", plugins);
    return plugins;
  }

  static async pushPlugin(name: string, data: string) {
    await this._writeFile(`plugins/${name}`, data);
  }

  static async deletePlugin(name: string): Promise<IResult> {
    try {
      await remove(`plugins/${name}`, {
        baseDir: BaseDirectory.Resource,
      });
      return {
        success: true,
        message: "删除成功",
        data: "",
      };
    } catch (error) {
      return {
        success: false,
        message: "删除失败",
        data: error?.toString() as string,
      };
    }
  }

  static async demo() {
    // await create("ab", { dir: BaseDirectory.AppConfig });
    // await this._writeFile("ab/c.txt", "Hello World!");

    await this._writeFile("a/s/f/b.txt", "helloworld");
  }

  static async _writeFile(
    file: string,
    content: string
  ): Promise<IResult | null> {
    let res: IResult | null = null;
    try {
      const prePath = file.split("/").slice(0, -1).join("/");

      if (prePath) {
        await mkdir(prePath, {
          recursive: true,
        });
      }
      await writeFile(file, new TextEncoder().encode(content), {
        baseDir: BaseDirectory.Resource,
      });
      res = {
        success: true,
        message: "写入成功",
        data: content,
      };
    } catch (error) {
      res = {
        success: false,
        message: "写入失败",
        data: error?.toString() as string,
      };
    } finally {
      return res;
    }
  }

  static async _readFile(
    file: string,
    default_value?: string
  ): Promise<IResult | null> {
    let res: IResult | null = null;

    let content = default_value || "";
    try {
      content = new TextDecoder("utf-8").decode(
        await readFile(file, { baseDir: BaseDirectory.Resource })
      );
      res = {
        success: true,
        message: "读取成功",
        data: content,
      };
    } catch (error) {
      res = await this._writeFile(file, content);
    } finally {
      return res;
    }
  }

  static async _readDir(dir: string): Promise<Array<DirEntry>> {
    let entries: Array<DirEntry> = [];
    try {
      const res = await readDir(dir, {
        baseDir: BaseDirectory.Resource,
      });

      // if (res) {
      //   await processEntriesRecursively(dir, entries);
      //   async function processEntriesRecursively(
      //     parent: string,
      //     entries: DirEntry[]
      //   ) {
      //     for (const entry of entries) {
      //       console.log(`Entry: ${entry.name}`);
      //       if (entry.isDirectory) {
      //         const dir = await join(parent, entry.name);
      //         await processEntriesRecursively(
      //           dir,
      //           await readDir(dir, { baseDir: BaseDirectory.Resource })
      //         );
      //       }
      //     }
      //   }
      // }
      entries = res;
    } catch (error) {
      await mkdir(dir, {
        recursive: true,
      });
      entries = [];
    } finally {
      return entries;
    }
  }
}
