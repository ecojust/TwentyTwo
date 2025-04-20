<template>
  <div class="app-container">
    <FreshNavbar />
    <div class="main-content">
      <!-- <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view> -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import FreshNavbar from "./components/FreshNavbar.vue";
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
