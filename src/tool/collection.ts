import File from "./file";
import { IVideo, ICollection, IResult } from "../const/interface";
import { COLLECTION_FOLDER_NAME } from "../const/const";

export default class Collection {
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

  static async deleteCollection(name: string): Promise<IResult> {
    return File._deleteFile(`${COLLECTION_FOLDER_NAME}/${name}.json`);
  }

  static async pushVideo2Collection(collectionId: string, data: IVideo) {
    const file_name = `${collectionId}.json`;
    const res = await File._readFile(file_name);
    if (res?.success && res.data) {
      const collection: ICollection = JSON.parse(res.data);
      collection.videos.push(data);
      await File._writeFile(file_name, JSON.stringify(collection));
    }
  }

  static async pushCollection(id: string, data: ICollection) {
    const newdata = Object.assign(data, { time: new Date().toLocaleString() });
    await File._writeFile(
      `${COLLECTION_FOLDER_NAME}/${id}.json`,
      JSON.stringify(newdata)
    );
  }
}
