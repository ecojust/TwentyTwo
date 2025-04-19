export default class Generater {
  static generateName(url: string) {
    const cleanUrl = url.replace(/^https?:\/\//, "").replace(/[^\w\d.-]/g, "_");
    let hash = 0;
    for (let i = 0; i < cleanUrl.length; i++) {
      const char = cleanUrl.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const positiveHash = Math.abs(hash).toString(16);
    return positiveHash;
  }
}
