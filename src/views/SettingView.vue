<template>
  <div class="setting-view">
    <el-card class="user-profile">
      <!-- 频道信息区域 -->
      <h1 class="channel-title">频道</h1>
      <div
        v-if="!channelDetail"
        class="empty-channel-tip"
        @click="showAddChannelDialog = true"
      >
        <el-empty
          description="您还未加入任何频道，点击此处加入频道吧"
        ></el-empty>
      </div>
      <div v-else class="channel-info-section">
        <div class="channel-info" @click="showAddChannelDialog = true">
          <!-- 使用 Flexbox 布局 -->
          <div class="channel-thumb">
            <img :src="channelDetail.thumb" alt="频道缩略图" />
          </div>
          <div class="channel-details">
            <div class="channel-name">{{ channelDetail.title }}</div>
            <div class="channel-code">频道码: {{ channelDetail.code }}</div>
            <div class="channel-desc">{{ channelDetail.description }}</div>

            <div class="channel-tags">
              <el-tag
                v-for="keyword in channelDetail.keywords.split(',')"
                :key="keyword"
                >{{ keyword }}</el-tag
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 设置入口列表 -->
      <div class="settings-list">
        <el-collapse accordion>
          <el-collapse-item title="主题设置" name="1">
            <div class="theme-list">
              <div
                v-for="theme in SYSTEM_THEMES"
                :key="theme.name"
                class="theme-item"
                :class="{ active: currentTheme === theme.name }"
                @click="changeTheme(theme.name)"
              >
                <div class="theme-preview">
                  <img fill="contain" :src="theme.preview" alt="" />
                </div>
                <div class="theme-name">{{ theme.name }}</div>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item title="关于" name="3">
            <div class="about-content">
              <p>一款互助搜索工具，团结一切可以团结的力量！</p>
              <p>版本：{{ appVersion }}</p>
              <p @click="goto('https://github.com/ecojust/TwentyTwo')">
                开源地址：<a href="#">GitHub</a>
              </p>
              <p @click="goto('https://pd.qq.com/g/pd74066781')">
                问题反馈：<a href="#">Issues</a>
              </p>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>

    <!-- 添加/编辑频道对话框 -->
    <el-dialog
      v-model="showAddChannelDialog"
      :title="channelDetail ? '更换频道' : '加入频道'"
      width="500px"
      destroy-on-close
      class="channel-dialog"
    >
      <div class="channel-code-section">
        <div class="channel-code-input">
          <el-input
            :prefix-icon="Key"
            placeholder="请输入频道码"
            v-model="encodeChannel"
            clearable
          >
          </el-input>
          <div class="channel-code-tip">联系管理员获取频道码</div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddChannelDialog = false">取消</el-button>
          <el-button type="primary" @click="saveChannel">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Key } from "@element-plus/icons-vue";
import { SYSTEM_THEMES } from "../const/const";
import { openPath } from "@tauri-apps/plugin-opener";
import { getVersion } from "@tauri-apps/api/app";
import { ElMessage } from "element-plus";
import Channel from "../api/channel";
import Config from "../tool/config";

const appVersion = ref("加载中...");
const channelDetail = ref(null);

const encodeChannel = ref(""); // 初始化为空字符串
const currentTheme = ref("default");

// 频道相关数据
const showAddChannelDialog = ref(false);

const goto = (url) => {
  openPath(url).catch((err) => {
    console.error("无法打开链接:", err);
  });
};

const changeTheme = async (theme) => {
  currentTheme.value = theme;
  await Config.setTheme(theme);
  await Config.applyTheme();
};

const saveChannel = async () => {
  if (!encodeChannel.value) return;
  await Config.setChannel(encodeChannel.value);
  await getChannelDetail(encodeChannel.value, true);
  showAddChannelDialog.value = false; // Corrected assignment
};

const getWorkList = async (channelId) => {
  const worklist = await Channel.getWorkList(channelId);
  console.log("worklist", worklist);
};

const getChannelDetail = async (channelId, notify) => {
  const channel = await Channel.getChannelDetail(channelId);
  if (channel) {
    channelDetail.value = channel;
    encodeChannel.value = channelId;
    notify &&
      ElMessage({
        type: "success",
        message: "加入频道成功",
      });
    console.log("获取频道信息成功", channel);
  } else {
    channelDetail.value = null;
    encodeChannel.value = "";
    notify &&
      ElMessage({
        type: "error",
        message: "频道码无效",
      });
    console.log("获取频道信息失败");
  }
};

onMounted(async () => {
  // 在这里可以加载用户已保存的主题设置
  const config = await Config.getConfiguration();
  console.log("config", config);
  currentTheme.value = config.theme;
  await getChannelDetail(config.channel);
  // await getWorkList(config.channel);

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
.setting-view {
  width: 100%;

  .user-profile {
    .empty-channel-tip {
      padding: 40px 0;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #f5f7fa;
      }
    }

    .channel-info-section {
      padding: 20px 0;
      .channel-info {
        display: flex;
        flex-direction: column; /* Changed to column for vertical layout */
        align-items: center;
        cursor: pointer; /* Added cursor pointer */
        .channel-thumb {
          width: 80px;
          height: 80px;
          margin-right: 0; /* Removed margin-right */
          margin-bottom: 10px; /* Added margin-bottom */
          border-radius: 50%;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        .channel-name {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
          text-align: center;
        }
        .channel-code {
          font-size: 14px;
          color: #666;
          text-align: center;
        }
        .channel-desc {
          font-size: 14px;
          color: #666;
          text-align: center;
        }
        .channel-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 10px;
          .el-tag {
            margin: 5px;
            font-size: 12px;
          }
        }
      }
    }

    .settings-list {
      margin-top: 20px;

      .el-collapse {
        border: none;

        .el-collapse-item {
          margin-bottom: 10px;

          .el-collapse-item__header {
            font-size: 16px;
            color: #333;
            padding: 0 15px;
          }

          .el-collapse-item__content {
            padding: 15px;
          }
        }
      }

      .about-content {
        p {
          margin: 10px 0;
          color: #666;

          a {
            color: #f59712;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }
  }

  .theme-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
    padding: 10px;

    .theme-item {
      cursor: pointer;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid transparent;

      &.active {
        border-color: #f59712;
      }

      .theme-preview {
        height: 80px;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .theme-name {
        padding: 8px;
        text-align: center;
        font-size: 12px;
        background: #f5f5f5;
      }
    }
  }

  .channel-code-tip {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
  }
}
</style>
