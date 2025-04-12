import {
  create,
  readFile,
  writeFile,
  mkdir,
  readDir,
  BaseDirectory,
  DirEntry,
  remove,
} from "@tauri-apps/plugin-fs";
import { resolveResource, join } from "@tauri-apps/api/path";
import { IPlugin, IResult } from "../const/interface";

export default class File {
  static getFileExtension(filename: string) {
    return filename.split(".").pop();
  }

  static async getPlugins() {
    const entries = await this._readDir("plugins");
    const plugins: Array<IPlugin> = [];
    for (const entry of entries) {
      if (entry.isFile) {
        const file = await this._readFile(entry.name);
        if (file?.success) {
          const plugin = JSON.parse(file.data) as IPlugin;
          plugins.push(plugin);
        }
      }
    }
    return plugins;
  }

  static async pushPlugin(name: string, data: string) {
    await this._writeFile(`plugins/${name}`, data);
  }

  static async deletePlugin(name: string): Promise<IResult> {
    try {
      const path = await resolveResource(`plugins/${name}`);
      await remove(path, { baseDir: BaseDirectory.Resource });
      return {
        success: true,
        message: "删除成功",
        data: "",
      };
    } catch (error) {
      console.log(error);
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
    console.log("demo");

    await this._writeFile("a/s/f/b.txt", "helloworld");
  }

  static async _writeFile(
    file: string,
    content: string
  ): Promise<IResult | null> {
    const path = await resolveResource(file);
    let res: IResult | null = null;
    try {
      const prePath = file.split("/").slice(0, -1).join("/");
      if (prePath) {
        await mkdir(prePath, {
          recursive: true,
          baseDir: BaseDirectory.Resource,
        });
        await writeFile(path, new TextEncoder().encode(content), {});
      }
      res = {
        success: true,
        message: "写入成功",
        data: "",
      };
    } catch (error) {
      console.log(error);
      res = {
        success: false,
        message: "写入失败",
        data: error?.toString() as string,
      };
    } finally {
      return res;
    }
  }

  static async _readFile(file: string): Promise<IResult | null> {
    const path = await resolveResource(file);
    let res: IResult | null = null;

    let content = "";
    try {
      content = new TextDecoder("utf-8").decode(
        await readFile(path, {
          baseDir: BaseDirectory.Resource,
        })
      );
      res = {
        success: true,
        message: "读取成功",
        data: content,
      };
    } catch (error) {
      res = await this._writeFile(path, content);
    } finally {
      return res;
    }
  }

  static async _readDir(dir: string): Promise<Array<DirEntry>> {
    const path = await resolveResource(dir);
    let entries: Array<DirEntry> = [];
    try {
      const res = await readDir(path, {
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
      await mkdir(path, {
        recursive: true,
        baseDir: BaseDirectory.Resource,
      });
      entries = [];
    } finally {
      return entries;
    }
  }
}
