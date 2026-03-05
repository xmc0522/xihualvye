<template>
  <div class="demo-date-picker">
    <div class="block">
      <span class="demonstration">时间：</span>
      <el-date-picker
        v-model="value2"
        type="daterange"
        unlink-panels
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        :shortcuts="shortcuts"
        :size="size"
        popper-class="shortcuts-bottom"
      />
    </div>
  </div>
  <div class="m-4" style="display: flex; align-items: center; gap: 10px; margin-left: 5%;">
    <p style="margin: 0;">选择不生成名称：</p>
    <el-select
      v-model="value1"
      multiple
      placeholder="Select"
      style="width: 240px"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
  <div>
    <el-button type="primary" :icon="Search">查询</el-button>
    <el-button type="primary">
      生成表格<el-icon class="el-icon--right"><Upload /></el-icon>
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { size, value2, shortcuts } from './ts/date-picker'
import { value1, options } from './ts/xialakuang'
import { Search, Upload } from '@element-plus/icons-vue'//到时候执行命令安装依赖：pnpm add @element-plus/icons-vue

</script>
<style>
@import './css/demo-date-picker.css';
@import './css/shortcuts-bottom.css';

</style>
