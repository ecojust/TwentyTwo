<template>
  <div class="setting-view">
    <el-card>
      <div class="theme-settings settings-item">
        <h2 v-on="longPress()">主题设置</h2>
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
      </div>

      <div class="channel-settings settings-item">
        <h2>频道设置</h2>
        <div class="channel-header">
          <div class="channel-title">已加入的频道</div>
          <el-button
            type="primary"
            size="small"
            @click="showAddChannelDialog = true"
            >添加频道</el-button
          >
        </div>

        <div v-if="channels.length === 0" class="empty-channels">
          <el-empty description="暂无频道，请添加频道"></el-empty>
        </div>

        <div v-else class="channel-list">
          <div
            v-for="(channel, index) in channels"
            :key="index"
            class="channel-item"
          >
            <div class="channel-info">
              <div class="channel-name">{{ channel.name }}</div>
              <div class="channel-url">{{ channel.id }}</div>
            </div>
            <div class="channel-actions">
              <!-- <el-button
                type="primary"
                size="small"
                text
                @click="editChannel(index)"
                >编辑</el-button
              > -->
              <el-button
                type="danger"
                size="small"
                text
                @click="removeChannel(index)"
                >删除</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 新增皮肤开发对话框 -->
    <el-dialog
      class="dev-dialog"
      v-model="showDevDialog"
      width="80%"
      :close-on-click-modal="false"
      destroy-on-close
      :show-close="false"
      @close="handlecloseDevDialog"
    >
      <div class="dev-container">
        <el-button type="primary" size="small" text>生成</el-button>
      </div>
    </el-dialog>

    <!-- 添加/编辑频道对话框 -->
    <el-dialog
      v-model="showAddChannelDialog"
      :title="isEditingChannel ? '编辑频道' : '添加频道'"
      width="500px"
      destroy-on-close
      class="channel-dialog"
    >
      <div class="channel-code-section">
        <div class="section-title">
          <i class="el-icon-key"></i>
          <span>频道码</span>
        </div>
        <div class="channel-code-input">
          <el-input
            placeholder="请输入频道码"
            v-model="encodeChannel"
            clearable
          >
            <template #append>
              <el-button @click="decodeChannel" type="primary">
                <i class="el-icon-unlock"></i> 解析
              </el-button>
            </template>
          </el-input>
          <div class="channel-code-tip">输入频道码可自动解析频道信息</div>
        </div>
      </div>

      <el-divider content-position="center">
        <i class="el-icon-info"></i> 频道信息
      </el-divider>

      <el-form
        :model="channelForm"
        label-width="80px"
        :rules="channelRules"
        ref="channelFormRef"
        class="channel-form"
      >
        <el-form-item label="频道名称" prop="name">
          <el-input
            disabled
            v-model="channelForm.name"
            placeholder="请输入频道名称"
          >
            <template #prefix>
              <i class="el-icon-collection-tag"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="频道地址" prop="id">
          <el-input
            disabled
            v-model="channelForm.id"
            placeholder="请输入频道id"
          >
            <template #prefix>
              <i class="el-icon-link"></i>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <div class="dialog-tips">
        <i class="el-icon-warning-outline"></i>
        <span>请先输入频道码并解析后再添加频道</span>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddChannelDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveChannel"
            :disabled="!channelForm.name"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, reactive } from "vue";
import Config from "../tool/config";
import { SYSTEM_THEMES, THEME_TEMPLATE } from "../const/const";
import Monaco from "../tool/monaco";
import { Close } from "@element-plus/icons-vue";
import Event from "../tool/event";
import { ElMessage } from "element-plus";
import Generater from "../tool/generater";

const encodeChannel = ref(Generater.encryptChannel("test", "ahsir80"));
const themes = ref([]);
const currentTheme = ref("default");
const showDevDialog = ref(false);
const monacoContainer = ref(null);

// 频道相关数据
const channels = ref([]);
const showAddChannelDialog = ref(false);
const isEditingChannel = ref(false);
const editingChannelIndex = ref(-1);
const channelFormRef = ref(null);

const channelForm = reactive({
  name: "",
  id: "",
});

const channelRules = {
  name: [
    { required: true, message: "请输入频道名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  id: [
    { required: true, message: "请输入频道ID", trigger: "blur" },
    { min: 2, max: 20, message: "请输入正确的ID格式", trigger: "blur" },
  ],
};

const decodeChannel = () => {
  const decodeResult = Generater.decryptChannel(encodeChannel.value);
  if (decodeResult) {
    channelForm.name = decodeResult.name;
    channelForm.id = decodeResult.id;
  } else {
    ElMessage.error("解码失败，请检查输入的频道码");
  }
};

const longPress = () => {
  return Event.longPress(1000, handleOpenEditorDialog).value;
};

const changeTheme = async (theme) => {
  currentTheme.value = theme;
  await Config.setTheme(theme);
  await Config.applyTheme();
};

const handleOpenEditorDialog = () => {
  showDevDialog.value = true;
};

const run = () => {
  const content = Monaco.getValue().trim();
  Config.applyDraftTheme(content);
};

// 频道相关方法
const editChannel = (index) => {
  isEditingChannel.value = true;
  editingChannelIndex.value = index;
  const channel = channels.value[index];
  channelForm.name = channel.name;
  channelForm.url = channel.url;
  showAddChannelDialog.value = true;
};

const removeChannel = async (index) => {
  channels.value.splice(index, 1);
  await saveChannelsToConfig();
  ElMessage.success("删除频道成功");
};

const saveChannel = async () => {
  if (!channelFormRef.value) return;

  await channelFormRef.value.validate(async (valid) => {
    if (valid) {
      if (isEditingChannel.value) {
        // 编辑现有频道
        channels.value[editingChannelIndex.value] = {
          name: channelForm.name,
          id: channelForm.id,
        };
        ElMessage.success("更新频道成功");
      } else {
        // 添加新频道
        channels.value.push({
          name: channelForm.name,
          id: channelForm.id,
        });
        ElMessage.success("添加频道成功");
      }

      await saveChannelsToConfig();
      resetChannelForm();
      showAddChannelDialog.value = false;
    }
  });
};

const resetChannelForm = () => {
  channelForm.name = "";
  channelForm.url = "";
  isEditingChannel.value = false;
  editingChannelIndex.value = -1;
};

const saveChannelsToConfig = async () => {
  // 保存频道到配置
  await Config.setChannels(channels.value);
};

const loadChannelsFromConfig = async () => {
  // 从配置加载频道
  const config = await Config.getConfiguration();
  if (config.channels) {
    channels.value = config.channels;
  }
};

onMounted(async () => {
  // 在这里可以加载用户已保存的主题设置
  const config = await Config.getConfiguration();
  currentTheme.value = config.theme;

  // 加载频道设置
  await loadChannelsFromConfig();
});
</script>

<style lang="less">
.setting-view {
  width: 100%;

  .settings-item {
    h2 {
      margin-bottom: 30px;
      font-size: 28px;
      color: #2c3e50;
      font-weight: 600;
      position: relative;
      padding-left: 15px;

      &:before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 70%;
        background: #f59712;
        border-radius: 2px;
      }
    }
  }

  .theme-settings {
    .theme-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 25px;
      padding: 10px;

      .theme-item {
        cursor: pointer;
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
        border: 3px solid transparent;
        background: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
        }

        &.active {
          border-color: #f59712;
          box-shadow: 0 0 0 2px rgba(245, 151, 18, 0.3);
        }

        .theme-preview {
          height: 150px;
          padding: 0px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(45deg, #f5f7fa, #e4e7eb);

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            transition: transform 0.3s ease;
          }

          &:hover img {
            transform: scale(1.05);
          }
        }

        .theme-name {
          padding: 12px;
          text-align: center;
          background: #2c3e50;
          color: #ffffff;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: background-color 0.3s ease;
        }

        &:hover .theme-name {
          background: #34495e;
        }
      }
    }
  }

  // 频道设置样式
  .channel-settings {
    margin-top: 30px;

    .channel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .channel-title {
        font-size: 18px;
        font-weight: 500;
        color: #333;
      }
    }

    .empty-channels {
      padding: 30px 0;
      background-color: #f9f9f9;
      border-radius: 8px;
    }

    .channel-list {
      .channel-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        margin-bottom: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        transition: all 0.3s ease;
        border-left: 4px solid #f59712;

        &:hover {
          background: #f0f2f5;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .channel-info {
          flex: 1;
          overflow: hidden;

          .channel-name {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 5px;
            color: #2c3e50;
          }

          .channel-url {
            font-size: 14px;
            color: #666;
            word-break: break-all;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
          }
        }

        .channel-actions {
          display: flex;
          gap: 10px;
          margin-left: 15px;
        }
      }
    }
  }
}
</style>

<style lang="less">
.channel-dialog {
  .el-dialog__header {
    padding: 20px 30px;
    border-bottom: 1px solid #ebeef5;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .el-dialog__body {
    padding: 25px 30px;
  }

  .channel-code-section {
    margin-bottom: 20px;

    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 500;
      color: #303133;

      i {
        margin-right: 8px;
        color: #f59712;
      }
    }

    .channel-code-input {
      .el-input {
        .el-input__inner {
          border-radius: 8px 0 0 8px;
          font-size: 16px;
          height: 45px;
          transition: all 0.3s;

          &:focus {
            border-color: #f59712;
            box-shadow: 0 0 0 2px rgba(245, 151, 18, 0.2);
          }
        }

        .el-input-group__append {
          border-radius: 0 8px 8px 0;
          padding: 0 15px;
          background-color: #f59712;
          border-color: #f59712;
          color: white;
          transition: all 0.3s;

          &:hover {
            background-color: #e48a0a;
            border-color: #e48a0a;
          }

          .el-button {
            color: white;
            border: none;
            background: transparent;
            font-weight: 500;
            padding: 8px 15px;

            i {
              margin-right: 5px;
            }
          }
        }
      }

      .channel-code-tip {
        margin-top: 8px;
        color: #909399;
        font-size: 13px;
        padding-left: 5px;
      }
    }
  }

  .el-divider {
    margin: 25px 0;

    .el-divider__text {
      background-color: #f8f9fa;
      color: #606266;
      font-size: 14px;
      font-weight: 500;
      padding: 0 15px;

      i {
        margin-right: 5px;
        color: #f59712;
      }
    }
  }

  .channel-form {
    margin-top: 20px;

    .el-form-item {
      margin-bottom: 20px;

      .el-form-item__label {
        font-weight: 500;
        color: #303133;
      }

      .el-input {
        .el-input__inner {
          border-radius: 8px;
          background-color: #f5f7fa;
          border-color: #e4e7ed;
          height: 40px;

          &:disabled {
            color: #606266;
            cursor: not-allowed;
          }
        }

        .el-input__prefix {
          color: #909399;
          font-size: 16px;
          padding-left: 5px;
        }
      }
    }
  }

  .dialog-tips {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background-color: #fef6e9;
    border-radius: 6px;
    margin-top: 20px;

    i {
      color: #f59712;
      font-size: 16px;
      margin-right: 8px;
    }

    span {
      color: #8c6339;
      font-size: 13px;
    }
  }

  .el-dialog__footer {
    padding: 15px 30px 20px;
    border-top: 1px solid #ebeef5;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    .el-button {
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 8px;
      transition: all 0.3s;

      &--default {
        &:hover {
          background-color: #f5f7fa;
          border-color: #dcdfe6;
        }
      }

      &--primary {
        background-color: #f59712;
        border-color: #f59712;

        &:hover {
          background-color: #e48a0a;
          border-color: #e48a0a;
        }

        &[disabled] {
          background-color: #fab95e;
          border-color: #fab95e;
        }
      }
    }
  }
}
</style>
