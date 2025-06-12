<template>
  <nav class="fresh-navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <!-- 根据路由动态显示logo或文字 -->
        <img
          v-if="currentRoute !== '/about'"
          src="/logo.png"
          alt="Logo"
          class="navbar-logo"
        />
        <span v-else class="navbar-title">TwentyTwo</span>
      </div>
      <div class="navbar-menu">
        <!-- <router-link to="/search" class="navbar-item" active-class="active">
          <el-icon class="navbar-icon"><Search /></el-icon>
          <span>搜索</span>
        </router-link> -->
        <router-link to="/local" class="navbar-item" active-class="active">
          <el-icon class="navbar-icon"><Folder /></el-icon>
          <span>频道资源</span>
        </router-link>
        <!-- <router-link to="/plugins" class="navbar-item" active-class="active">
          <el-icon class="navbar-icon"><Connection /></el-icon>
          <span>插件</span>
        </router-link> -->
        <router-link to="/setting" class="navbar-item" active-class="active">
          <el-icon class="navbar-icon"><Setting /></el-icon>
          <span>我的</span>
        </router-link>

        <el-badge
          type="primary"
          :show-zero="false"
          :value="isNew"
          class="notify-message"
          @click="showMessage = true"
        >
          <el-icon>
            <Message />
          </el-icon>
        </el-badge>

        <!-- <router-link to="/about" class="navbar-item" active-class="active">
          <el-icon class="navbar-icon"><InfoFilled /></el-icon>
          <span>关于</span>
        </router-link> -->
      </div>
    </div>

    <el-dialog title="消息通知" v-model="showMessage" width="600">
      <el-scrollbar height="300px">
        <el-timeline style="width: calc(100% - 100px)">
          <el-timeline-item
            v-for="item in messagelist"
            :key="item.id"
            :timestamp="new Date(~~item.updatetime * 1000).toLocaleString()"
            placement="top"
          >
            <el-card>
              <div class="message-title">{{ item.title }}</div>
              <p>{{ item.description }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-scrollbar>
    </el-dialog>
  </nav>
</template>

<script setup>
import {
  Search,
  Folder,
  Message,
  Connection,
  InfoFilled,
  Setting,
} from "@element-plus/icons-vue";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import App from "./../api/app";
// 获取当前路由
const route = useRoute();
const currentRoute = computed(() => route.path);
const messagelist = ref([]);
const isNew = ref(0);
const showMessage = ref(false);

let timer = null;

const getNotifyList = async () => {
  messagelist.value = await App.getNotifyList();
  isNew.value = messagelist.value.filter((item) => item.active == 1).length;
};

onMounted(async () => {
  getNotifyList();
  clearInterval(timer);
  timer = setInterval(async () => {
    await getNotifyList();
  }, 10000);
});
</script>

<style lang="less">
// 小清新导航栏样式
.fresh-navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 10px 0;
  background-color: var(--fresh-bg, rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(10px);
  box-shadow: var(--fresh-shadow, 0 4px 20px rgba(0, 0, 0, 0.08));
  transition: all 0.3s ease;

  .navbar-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
  }

  .navbar-brand {
    font-size: 20px;
    font-weight: 600;
    color: var(--fresh-primary, #5e9eff);
    display: flex;
    align-items: center;

    .navbar-logo {
      height: 32px;
      transition: all 0.3s ease;
      border-radius: 4px;
      overflow: hidden;
    }

    .navbar-title {
      font-size: 20px;
      font-weight: 600;
      background: linear-gradient(
        45deg,
        var(--fresh-primary, #5e9eff),
        #36c1ff
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      transition: all 0.3s ease;
    }
  }

  .navbar-menu {
    display: flex;
    gap: 12px;
    justify-content: center; // 居中显示菜单项;
    align-items: center; // 垂直居中;
    .notify-message {
      cursor: pointer;
    }
  }

  .navbar-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border-radius: 20px;
    color: var(--text-color, #333333);
    text-decoration: none;
    font-size: 14px;
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--fresh-primary, #5e9eff);
      border-radius: 20px;
      z-index: -1;
      transform: scale(0);
      opacity: 0;
      transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
        opacity 0.3s ease;
    }

    .navbar-icon {
      margin-right: 8px;
      font-size: 16px;
      transition: transform 0.3s ease;
    }

    span {
      position: relative;
      z-index: 1;
    }

    &:hover {
      color: var(--fresh-primary, #5e9eff);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(94, 158, 255, 0.2);

      .navbar-icon {
        transform: rotate(10deg) scale(1.2);
      }
    }

    &.active {
      color: white;
      font-weight: 500;

      &::before {
        transform: scale(1);
        opacity: 1;
      }

      .navbar-icon {
        transform: scale(1.1);
      }
    }
  }
  .message-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }
}
</style>
