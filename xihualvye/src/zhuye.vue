<template>
  <el-container class="layout-container-demo" style="height: 100vh">
    <el-aside width="200px">
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
        <el-menu-item>
          <span>大学管理系统</span>
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
    </el-aside>
    <el-container>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import menuArr from './router/menu'

const route = useRoute()
// 添加菜单事件处理函数
const handleOpen = (key: string, keyPath: string[]) => {
  console.log('打开菜单:', key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log('关闭菜单:', key, keyPath)
}

</script>

<style scoped lang="css">
.el-menu {
  height: 100vh;
  .logo {
    width: 35px;
    height: 35px;
    margin-right: 10px;
  }
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
</style>
