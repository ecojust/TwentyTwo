<template>
  <div class="app-container">
    <FreshNavbar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import FreshNavbar from "./components/FreshNavbar.vue";
// import PuppeteerTool from "./tool/puppeteer";
const urls = ref([]);
onMounted(async () => {
  console.log("mounted");
  // await PuppeteerTool.getContent("https://www.baidu.com");
  const res = await invoke("fetch_request", {
    url: "https://www.baidu.com",
  });
  console.log(res);
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
  }
}
</style>
