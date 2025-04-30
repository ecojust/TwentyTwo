<template>
  <div class="app-container">
    <FreshNavbar />
    <div class="main-content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
      <!-- <router-view /> -->
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import FreshNavbar from "./components/FreshNavbar.vue";
import { invoke } from "@tauri-apps/api/core";
import Config from "./tool/config";

const iframeRef = ref(null);

onMounted(async () => {
  await Config.applyTheme();
  // await invoke("fetch_request", {
  //   url: "https://tv.yinghuadongman.info/play_4945-1-1.html",
  // });
  // setTimeout(() => {
  //   console.log(
  //     "iframeRef.value.contentWindow.document.body",
  //     iframeRef.value.contentWindow.document.body
  //   );
  // }, 5000);
  // 创建无头浏览器并执行脚本
  // const result = await invoke("create_headless_browser", {
  //   url: "https://tv.yinghuadongman.info/play_4945-1-3.html",
  //   visible: true, // 设为true可以看到浏览器窗口
  //   script:
  //     "(function() { return document.querySelector('#player').innerHTML; })()", // 使用IIFE包装return语句
  // });
  // // 解析返回的数据
  // const data = JSON.parse(result.data);
  // console.log("脚本执行结果:", data);
});
</script>

<style lang="less">
.app-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .main-content {
    flex: 1;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    // backdrop-filter: blur(10px);
  }
}
</style>
