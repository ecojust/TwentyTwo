import File from "./file";
import { PLAYER_LIST_FILE_NAME } from "../const/const";

export default class PlayerList {
  static async getConfiguration() {
    const res = await File._readFile(
      PLAYER_LIST_FILE_NAME,
      JSON.stringify({
        videoList: [],
        audioList: [],
      })
    );
    if (res?.success) {
      return JSON.parse(res.data);
    } else {
      return {
        videoList: [],
        audioList: [],
      };
    }
  }

  static async pushVideo(video: any) {
    const res = await this.getConfiguration();
    console.log("添加到列表", video, res.videoList);

    if (
      res.videoList.find(
        (item: any) => item.real === video.real && item.origin === video.origin
      )
    )
      return;
    res.videoList.push(video);
    await File._writeFile(PLAYER_LIST_FILE_NAME, JSON.stringify(res));
  }

  static async pushAudio(audio: any) {
    const res = await this.getConfiguration();
    if (res.audioList.find((item: any) => item.real === audio.real)) return;
    res.audioList.push(audio);
    await File._writeFile(PLAYER_LIST_FILE_NAME, JSON.stringify(res));
  }

  static async _getVideoList() {
    const res = await this.getConfiguration();
    if (res?.videoList) {
      return res.videoList;
    } else {
      return [];
    }
  }

  static async _getAudioList() {
    const res = await this.getConfiguration();
    if (res?.audioList) {
      return res.audioList;
    } else {
      return [];
    }
  }

  /**
   * 根据real属性对数组进行去重
   * @param array 需要去重的数组
   * @returns 去重后的数组
   */
  static deduplicateByReal(array: any[]) {
    if (!array || !Array.isArray(array)) {
      return [];
    }

    const seen = new Map();
    return array.filter((item) => {
      if (!item || (!item.real && !item.origin)) return false;
      const key = `${item.origin}.${item.real}`;
      if (seen.has(key)) {
        return false;
      } else {
        seen.set(key, true);
        return true;
      }
    });
  }

  /**
   * 获取去重后的视频列表
   * @returns 根据real属性去重后的视频列表
   */
  static async getDeduplicatedVideoList() {
    const videoList = await this._getVideoList();
    return this.deduplicateByReal(videoList);
  }

  /**
   * 获取去重后的音频列表
   * @returns 根据real属性去重后的音频列表
   */
  static async getDeduplicatedAudioList() {
    const audioList = await this._getAudioList();
    return this.deduplicateByReal(audioList);
  }

  /**
   * 保存去重后的视频列表
   * @returns 保存结果
   */
  static async saveDeduplicatedVideoList() {
    const config = await this.getConfiguration();
    config.videoList = this.deduplicateByReal(config.videoList);
    return await File._writeFile(PLAYER_LIST_FILE_NAME, JSON.stringify(config));
  }

  static async updateVideoList(videoList: Array<any>) {
    const config = await this.getConfiguration();
    config.videoList = videoList;
    return await File._writeFile(PLAYER_LIST_FILE_NAME, JSON.stringify(config));
  }
  static async updateAudioList(audioList: Array<any>) {
    const config = await this.getConfiguration();
    config.audioList = audioList;
    return await File._writeFile(PLAYER_LIST_FILE_NAME, JSON.stringify(config));
  }

  /**
   * 保存去重后的音频列表
   * @returns 保存结果
   */
  static async saveDeduplicatedAudioList() {
    const config = await this.getConfiguration();
    config.audioList = this.deduplicateByReal(config.audioList);
    return await File._writeFile(PLAYER_LIST_FILE_NAME, JSON.stringify(config));
  }
}
