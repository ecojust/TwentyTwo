<template>
  <div class="about-view">
    <el-card>
      <div class="about-content">
        <div class="app-logo">
          <el-image
            src="/logo.png"
            alt="VideoSearch Logo"
            fit="contain"
          ></el-image>
        </div>

        <p class="app-version">版本: {{ appVersion }}</p>

        <el-scrollbar wrap-style="height:calc(100vh - 430px);width:100%;">
          <div class="app-description">
            <p>VideoSearch是一个跨平台的视频搜索和播放工具</p>
            <p>
              软件交流 :
              <b @click="goto('https://pd.qq.com/g/pd74066781')">传送门</b>
            </p>

            <p>
              Pull request & Issue :
              <b @click="goto('https://github.com/ecojust/VideoSearch')"
                >传送门</b
              >
            </p>
          </div>

          <div class="app-copyright">
            <p>© 2025 VideoSearch. 保留所有权利。</p>
          </div>
        </el-scrollbar>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getVersion } from "@tauri-apps/api/app";
import { openPath } from "@tauri-apps/plugin-opener";
const appVersion = ref("加载中...");

const goto = (url) => {
  openPath(url).catch((err) => {
    console.error("无法打开链接:", err);
  });
};

onMounted(async () => {
  try {
    // 从 Tauri 应用获取版本信息
    appVersion.value = await getVersion();
  } catch (error) {
    console.error("获取版本信息失败:", error);
    appVersion.value = "v1.0.0"; // 获取失败时使用默认版本
  }
});
</script>

<style lang="less">
.about-view {
  width: 100%;

  .about-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px 0;

    .app-logo {
      width: 120px;
      height: 120px;
      margin-bottom: 20px;
      border-radius: 10px;
      overflow: hidden;
    }

    .app-name {
      font-size: 24px;
      font-weight: 600;
      margin: 10px 0;
    }

    .app-version {
      font-size: 16px;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }

    .app-description {
      max-width: 600px;
      margin-bottom: 30px;
      line-height: 1.6;
      b {
        cursor: pointer;
        color: var(--el-color-primary);
        // text-decoration: underline;
      }
    }

    .app-features {
      width: 100%;
      max-width: 600px;
      text-align: left;
      margin-bottom: 30px;

      h4 {
        margin-bottom: 15px;
      }

      ul {
        padding-left: 20px;

        li {
          margin-bottom: 8px;
        }
      }
    }

    .app-copyright {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 20px;
    }
  }
}
</style>
