export interface IPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  search: {
    url: string;
    description: string;
    parse: (html: string) => Array<string>;
  };
  detail: {
    description: string;
    parse: (html: string) => string;
  };
  play: {
    mediaType: string;
    description: string;
    parseType: string;
    parse: (html: string) => string;
  };
}

export interface IResult {
  success: boolean;
  message: string;
  data: string;
}

export interface IHistory {
  title: string;
  href: string;
  thumbnail: string;
  score: string;
  source: string;
  time: string;
}

export interface IVideo {
  title: string;
  type: string;
  play_url: string;
  thumbnail?: string;
  time: string;
  href?: string;
  score?: string;
  source?: string;
}

export interface ICollection {
  // id: string;
  title: string;
  coverUrl: string;
  time: string;
  videos: Array<IVideo>;
}
