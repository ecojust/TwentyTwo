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

  static async getVideoList() {
    const res = await this.getConfiguration();
    if (res?.videoList) {
      return res.videoList;
    } else {
      return [];
    }
  }

  static async pushVideo(video: any) {
    const res = await this.getConfiguration();
    res.videoList.push(video);
    await File._writeFile(PLAYER_LIST_FILE_NAME, JSON.stringify(res));
  }

  static async pushAudio(audio: any) {
    const res = await this.getConfiguration();
    res.audioList.push(audio);
    await File._writeFile(PLAYER_LIST_FILE_NAME, JSON.stringify(res));
  }

  static async getAudioList() {
    const res = await this.getConfiguration();
    if (res?.audioList) {
      return res.audioList;
    } else {
      return [];
    }
  }
}
