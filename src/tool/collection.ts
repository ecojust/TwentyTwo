import File from "./file";
import { IVideo, ICollection, IResult } from "../const/interface";
import { COLLECTION_FOLDER_NAME } from "../const/const";
import { invoke } from "@tauri-apps/api/core";
import Generater from "../tool/generater";
export default class Collection {
  static async clearCollections() {
    const entries = await File._readDir(COLLECTION_FOLDER_NAME);
    for (const entry of entries) {
      if (entry.isFile) {
        await File._deleteFile(`${COLLECTION_FOLDER_NAME}/${entry.name}`);
      }
    }
  }

  static async getCollection(id: string): Promise<IResult> {
    const file_name = `${COLLECTION_FOLDER_NAME}/${id}.json`;
    const res = await File._readFile(file_name);
    if (res?.success && res.data) {
      const collection: ICollection = JSON.parse(res.data);
      return {
        success: true,
        message: "获取合集成功",
        data: collection!,
      };
    } else {
      return {
        success: false,
        message: "合集不存在",
      };
    }
  }

  static async getCollections() {
    const entries = await File._readDir(COLLECTION_FOLDER_NAME);
    const collections: Array<ICollection> = [];
    for (const entry of entries) {
      if (entry.isFile) {
        const file = await File._readFile(
          `${COLLECTION_FOLDER_NAME}/${entry.name}`
        );
        if (file?.success) {
          const collection = JSON.parse(file.data);
          collections.push(collection);
        }
      }
    }
    return collections;
  }

  static async updateCollection(data: ICollection): Promise<IResult> {
    const res = await File._writeFile(
      `${COLLECTION_FOLDER_NAME}/${data.id}.json`,
      JSON.stringify(data)
    );
    return res!;
  }

  static checkCollectionIsReady(data: ICollection) {
    const needToParse: Array<string> = [];
    data.videos.forEach((video) => {
      video.video_urls.forEach((source, index) => {
        if (!source.real) {
          needToParse.push(`${video.title}-${index + 1}`);
        }
      });
    });
    return needToParse;
  }

  static async deleteCollection(name: string): Promise<IResult> {
    return File._deleteFile(`${COLLECTION_FOLDER_NAME}/${name}.json`);
  }

  static async updateCollectionItem(collectionId: string, data: IVideo) {
    const file_name = `${COLLECTION_FOLDER_NAME}/${collectionId}.json`;
    const res = await File._readFile(file_name);
    if (res?.success && res.data) {
      const collection: ICollection = JSON.parse(res.data);
      const index = collection.videos.findIndex(
        (item) => item.href === data.href
      );
      if (index !== -1) {
        collection.videos[index] = data;
      } else {
        collection.videos.push(data);
      }
      const res2 = await File._writeFile(file_name, JSON.stringify(collection));
      return res2;
    }
  }

  static async pushVideo2Collection(collectionId: string, data: IVideo) {
    const file_name = `${COLLECTION_FOLDER_NAME}/${collectionId}.json`;
    const res = await File._readFile(file_name);

    if (res?.success && res.data) {
      const collection: ICollection = JSON.parse(res.data);
      if (collection.videos.find((item) => item.href === data.href)) {
        console.log("pushVideo2Collection", "already exists");
        return {
          success: false,
          message: "合集内已存在该资源",
        };
      }
      collection.videos.push(data);
      const res2 = await File._writeFile(file_name, JSON.stringify(collection));
      return res2;
    }

    return res;
  }

  static async removeVideoFromCollection(collectionId: string, data: IVideo) {
    const file_name = `${COLLECTION_FOLDER_NAME}/${collectionId}.json`;
    const res = await File._readFile(file_name);

    if (res?.success && res.data) {
      const collection: ICollection = JSON.parse(res.data);
      collection.videos = collection.videos.filter(
        (item) => item.href !== data.href
      );
      console.log("removeVideoFromCollection", collection.videos);
      // collection.videos.push(data);
      const res2 = await File._writeFile(file_name, JSON.stringify(collection));
      return res2;
    }

    return res;
  }

  static async pushCollection(id: string, data: ICollection) {
    const newdata = Object.assign(data, {
      time: new Date().toLocaleString(),
      author: "TwentyTwo",
    });
    await File._writeFile(
      `${COLLECTION_FOLDER_NAME}/${id}.json`,
      JSON.stringify(newdata)
    );
  }

  static async importFromData(data: string) {
    const newdata = Object.assign(JSON.parse(data), {
      time: new Date().toLocaleString(),
    });

    await File._writeFile(
      `${COLLECTION_FOLDER_NAME}/${newdata.id}.json`,
      JSON.stringify(newdata)
    );
  }

  static async importFromUrl(url: string) {
    try {
      const response = (await invoke("http_get", {
        url: url,
      })) as IResult;
      if (!response.success) {
        throw new Error(`请求失败: ${response.message}`);
      }

      const collectionName = Generater.generateName(url);
      const newdata = Object.assign(JSON.parse(response.data), {
        id: collectionName,
        time: new Date().toLocaleString(),
      });

      await File._writeFile(
        `${COLLECTION_FOLDER_NAME}/${collectionName}.json`,
        JSON.stringify(newdata)
      );
    } catch (error) {
      //
    }
  }
}
