export interface IPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  usage?: number;
  search: {
    url: string;
    description: string;
    parse: (html: string) => Array<string>;
  };
  detail: {
    description: string;
    parse: (html: string) => string | string[];
  };
  play: {
    mediaType: string;
    description: string;
    parseType: string;
    parse: (html: string) => string;
  };
}

export interface IThemeItem {
  name: string;
  value: string;
}

export interface IResult {
  success: boolean;
  message: string;
  data?: string | null | any;
}

export interface IHistory {
  title: string;
  href: string;
  thumbnail: string;
  score: string;
  source: string;
  time: string;
}

export interface IPlayer {
  origin: string;
  real: string;
}

export interface IVideo {
  title: string;
  type: string;
  video_urls: Array<IPlayer>;
  thumbnail?: string;
  time: string;
  href?: string;
  score?: string;
  source?: string;
}

export interface ICollection {
  id: string;
  title: string;
  author?: string;
  description: string;
  coverUrl: string;
  time: string;
  videos: Array<IVideo>;
}
