import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
// 引入Element Plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import "./common.less";

// 创建 Pinia 状态管理
const pinia = createPinia();

// 创建应用实例
const app = createApp(App);

// 使用插件
app.use(pinia);
app.use(router);
app.use(ElementPlus);

// 挂载应用
app.mount("#app");
