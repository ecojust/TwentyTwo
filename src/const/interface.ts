export interface IPlugin {
  name: string;
  description: string;
  version: string;
  author: string;
  search: {
    url: string;
    description: string;
  };
}

export interface IResult {
  success: boolean;
  message: string;
  data: string;
}
