import axios from "axios";
import { ElMessage } from "element-plus";
const baseUrl = "http://111.229.154.132:5555/?s=module&c=service22&m=";

const xhr = axios.create({
  xsrfCookieName: "xsrf-token",
});

//请求拦截器
xhr.interceptors.request.use(
  function (config: any) {
    config = setConfig(config);
    return config;
  },
  function (error: any) {
    return Promise.reject(error);
  }
);

//响应拦截器
xhr.interceptors.response.use(
  function (response: any) {
    switch (response.data.code) {
      case 200:
        return response.data;
        break;
      case 401:
        ElMessage({
          message: "当前令牌已过期，将为您返回首页",
          type: "success",
        });
        break;
      default:
        ElMessage({
          message: response.data.message,
          type: "error",
        });
        break;
    }
    return response.data;
  },
  function (res: any) {
    return Promise.reject({
      messageCode: "sysError",
      res: res,
    });
  }
);

//设置请求头相关配置
function setConfig(config: any) {
  const url = config.url;
  //   const storage = window.localStorage;
  //   const screct = JSON.parse(storage.getItem("userInfo") || "{}");
  config.headers = {
    Authorization: "Bearer ",
  };

  if (url.indexOf("http") === -1) {
    config.url = baseUrl + url;
  } else {
    config.url = url;
  }
  return config;
}

export function get(url: any, params: any) {
  return xhr({
    method: "GET",
    url: url,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    params: params,
  });
}

//query string parameters
export function postQuery(url: string, params: any) {
  return xhr({
    method: "POST",
    url: url,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    params: params,
  });
}

//request payload
export function postPayload(url: string, data: any) {
  return xhr({
    method: "POST",
    url: url,
    headers: { "Content-Type": "application/json;charset=utf-8" },
    data: data,
  });
}

//request payload
export function postBlob(url: string, data: any) {
  return xhr({
    method: "POST",
    url: url,
    headers: { "Content-Type": "application/json;charset=utf-8" },
    data: data,
    responseType: "blob",
  });
}

//form data
export function postFormdata(url: string, data: any) {
  return xhr({
    method: "POST",
    url: url,
    headers: { "Content-Type": "multipart/form-data" },
    data: data,
  });
}

export function put(url: string, data: any) {
  return xhr({
    method: "PUT",
    url: url,
    headers: { "Content-Type": "application/json" },
    data: data,
  });
}

export function del(url: string, data: any) {
  return xhr({
    method: "DELETE",
    url: url,
    headers: { "Content-Type": "Content-Type: application/json" },
    data: data,
  });
}
