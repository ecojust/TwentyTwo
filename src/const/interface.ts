export interface IPlugin {
  file_name: string;
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
