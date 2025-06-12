import Fetch from "./fetch";
import Config from "../tool/config.ts";
import { ElMessage } from "element-plus";

// import { get } from "./axios";

export default class Channel {
  static async pushwork(channel: string, data: any) {
    if (!channel) {
      return null;
    }
    const res = await Fetch.post(`pushwork&code=${channel}`, data);
    if (res.code === 200) {
      ElMessage.success(res.msg);
      return true;
    } else {
      return false;
    }
  }

  static async getWorkList(channel: string | undefined) {
    if (!channel) {
      return null;
    }
    const res = await Fetch.get(`getWorkList&code=${channel}`);
    if (res.code === 200) {
      return res.data.data;
    } else {
      return [];
    }
  }
  static async getChannelDetail(channel: string | undefined) {
    if (!channel) {
      return null;
    }
    const res = await Fetch.get(`getChannelDetail&code=${channel}`);
    if (res.code === 200) {
      return res.data.data;
    } else {
      return null;
    }
  }

  static async getChannelCollections(channelcode: string | undefined) {
    if (!channelcode) {
      return null;
    }
    const res = await Fetch.get(`getChannelResources&code=${channelcode}`);
    if (res.code === 200) {
      return res.data.data;
    } else {
      return null;
    }
  }

  static async getCollectionDetails(collectionId: string | undefined) {
    const res = await Fetch.get(`getResourceDetail&id=${collectionId}`);
    if (res.code === 200) {
      // console.log("res.data.data", res.data.data);
      return res.data.data;
    } else {
      ElMessage.warning(res.msg);
      return [];
    }
  }

  static async pushItemToCollection(
    item: any,
    collectionId: string | undefined
  ) {
    const res = await Fetch.post(`pushItemToResource&id=${collectionId}`, item);
    if (res.code === 200) {
      ElMessage.success(res.msg);
      return res.data.data;
    } else {
      ElMessage.warning(res.msg);
      return [];
    }
  }

  static async pushItemsToCollection(
    rawItems: string,
    collectionId: string | undefined,
    force: boolean
  ) {
    const res = await Fetch.post(`pushItemsToResource&id=${collectionId}`, {
      rawItems: rawItems,
      force: force,
    });
    if (res.code === 200) {
      ElMessage.success(res.msg);
      return res.data.data;
    } else {
      ElMessage.warning(res.msg);
      return [];
    }
  }

  static async addCollection(collectionForm: {
    title: string;
    description: string;
    coverUrl: string;
  }) {
    const config = await Config.getConfiguration();
    if (!config.channel) {
      return null;
    }
    const res = await Fetch.post(
      `pushChannelResource&code=${config.channel}`,
      collectionForm
    );
    if (res.code !== 200) {
      ElMessage.warning(res.msg);
      return false;
    } else {
      ElMessage.success(res.msg);
      return true;
    }
  }
}
