<template>
  <el-container class="layout-container-demo" style="height: 100vh">
    <el-aside width="255px">
      <div class="aside-wrapper">
        <el-menu
          background-color="#001529"
          class="el-menu-vertical-demo"
          :default-active="route.path"
          active-text-color="#ffd04b"
          text-color="#fff"
          router
          @open="handleOpen"
          @close="handleClose"
        >
          <el-menu-item class="title-item" style="padding-left: 8px; padding-top: 10px; margin-bottom: 20px">
            <span style="font-size: 18px">玺华铝业-业务管理系统</span>
          </el-menu-item>
          <div class="menu-items-wrapper">
            <template v-for="(item, index) in menuArr" :key="index">
              <el-sub-menu v-if="item.children" :index="item.path">
                <template #title>
                  <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
                  <span>{{ item.title }}</span>
                </template>
                <el-menu-item v-for="(v, i) in item.children" :key="i" :index="v.path">
                  <span>{{ v.title }}</span>
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item v-else :index="item.path">
                <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
                <span>{{ item.title }}</span>
              </el-menu-item>
            </template>
          </div>
        </el-menu>
        <div class="logout-area">
          <el-button type="danger" plain size="small" @click="handleLogout" class="logout-btn">
            退出登录
          </el-button>
        </div>
      </div>
    </el-aside>
    <el-container>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import menuArr from './router/menu'

const route = useRoute()
const router = useRouter()

// 添加菜单事件处理函数
const handleOpen = (key: string, keyPath: string[]) => {
  console.log('打开菜单:', key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log('关闭菜单:', key, keyPath)
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 检查是否有记住密码
      const saved = localStorage.getItem('xhly_auth')
      let shouldRemember = false
      let savedData = { username: '', password: '', rememberMe: false }
      
      if (saved) {
        try {
          const auth = JSON.parse(saved)
          if (auth.rememberMe) {
            shouldRemember = true
            savedData = {
              username: auth.username,
              password: auth.password,
              rememberMe: true
              // 注意：不保存 loginTime，这样就不会自动登录
            }
          }
        } catch (e) {
          console.error('解析认证信息失败', e)
        }
      }
      
      // 移除当前认证信息
      localStorage.removeItem('xhly_auth')
      
      // 如果勾选了记住密码，重新保存账号密码信息（不含 loginTime）
      if (shouldRemember) {
        localStorage.setItem('xhly_auth', JSON.stringify(savedData))
      }
      
      ElMessage.success('已退出登录')
      router.replace('/login')
    })
    .catch(() => {})
}
</script>

<style scoped lang="css">
.aside-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #001529;
}

.el-menu {
  flex: 1;
  overflow-y: auto;
  .logo {
    width: 35px;
    height: 35px;
    margin-right: 10px;
  }
}

.logout-area {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #001529;
}

.logout-btn {
  width: 100%;
}

.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
  background-color: #cfd5db;
}

.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
  background-color: #545c64;
}

.layout-container-demo .el-menu {
  border-right: none;
}

/* 菜单项区域整体左侧内边距加大 */
.menu-items-wrapper {
  padding-left: 15px;
}

/* 选中菜单项的蓝色背景 */
.el-menu-vertical-demo :deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.4);
}

/* 子菜单项选中时的蓝色背景 */
.el-menu-vertical-demo :deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: #1890ff !important;
  color: #fff !important;
}

/* 当子菜单项被选中时，父级菜单项显示浅蓝色背景（展开状态） */
.el-menu-vertical-demo :deep(.el-sub-menu.is-active.is-opened > .el-sub-menu__title) {
  background-color: rgba(24, 144, 255, 0.3) !important;
  color: #fff !important;
}

/* 当子菜单项被选中且菜单收起时，父级菜单项显示深蓝色背景 */
.el-menu-vertical-demo :deep(.el-sub-menu.is-active:not(.is-opened) > .el-sub-menu__title) {
  background-color: #1890ff !important;
  color: #fff !important;
}

/* 当子菜单项被选中时，父级菜单项的图标也变白色 */
.el-menu-vertical-demo :deep(.el-sub-menu.is-active > .el-sub-menu__title .el-icon) {
  color: #fff !important;
}

/* 菜单项悬浮效果 */
.el-menu-vertical-demo :deep(.el-menu-item:hover) {
  background-color: rgba(24, 144, 255, 0.2) !important;
}

/* 标题行取消 hover 高亮、点击效果和手型光标 */
.el-menu-vertical-demo :deep(.title-item) {
  cursor: default !important;
}
.el-menu-vertical-demo :deep(.title-item:hover) {
  background-color: transparent !important;
}
.el-menu-vertical-demo :deep(.title-item.is-active) {
  background-color: transparent !important;
  color: #fff !important;
}

/* 父级菜单项悬浮效果 */
.el-menu-vertical-demo :deep(.el-sub-menu__title:hover) {
  background-color: rgba(24, 144, 255, 0.2) !important;
}

.layout-container-demo .el-main {
  padding: 0;
}

.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 200px;
  right: 20px;
  font-size: 20px;
}

.common-layout {
  height: 100vh;
}

/* 打印时隐藏左侧菜单 */
@media print {
  .el-aside {
    display: none !important;
  }
  .layout-container-demo .el-aside {
    display: none !important;
  }
  /* .el-container {
    width: 100% !important;
  } */
}
</style>
