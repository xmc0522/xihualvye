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
          <el-menu-item style="padding-left: 8px; padding-top: 10px; margin-bottom: 20px">
            <span style="font-size: 18px">玺华铝业-业务管理系统</span>
          </el-menu-item>
          <template v-for="(item, index) in menuArr" :key="index">
            <el-sub-menu v-if="item.children" :index="item.path">
              <template #title>
                <span>
                  {{ item.title }}
                </span>
              </template>
              <el-menu-item v-for="(v, i) in item.children" :key="i" :index="v.path">
                <span>{{ v.title }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="item.path">
              <span>{{ item.title }}</span>
            </el-menu-item>
          </template>
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
      localStorage.removeItem('xhly_auth')
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
