<template>
  <div>
      <span>长度：</span>
      <el-input v-model="input1" style="width: 95px;" placeholder="请输入长度"  />
      <span style="margin-left: 15px;">宽度：</span>
      <el-input v-model="input2" style="width: 95px;" placeholder="请输入宽度"  />
      <span style="margin-left: 15px;">高度：</span>
      <el-input v-model="input3" style="width: 95px;" placeholder="请输入高度"  />
  </div>

  <div style="display: flex; align-items: center; gap: 10px;">
    <p style="margin-left: 5%;">表面处理：</p>
    <el-select v-model="value3" placeholder="请选择" style="width: 100px">
      <el-option
        v-for="item in options3"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
  
  <div style="display: flex; align-items: center; gap: 10px;">
    <p style="margin-left: 5%;">规格：</p>
    <el-select v-model="value4" placeholder="请选择" style="width: 100px">
      <el-option
        v-for="item in options4"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
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
    <p style="margin: 0;">选择不生成的名称：</p>
    <el-select
      v-model="value1"
      multiple
      placeholder="请勾选"
      style="width: 210px"
    >
      <el-option
        v-for="item in options1"
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
import { value1,value3, value4,  options1, options3, options4} from './ts/xialakuang'
import { input1, input2, input3} from './ts/shurukuang'
import { Search, Upload } from '@element-plus/icons-vue'//到时候执行命令安装依赖：pnpm add @element-plus/icons-vue

</script>
<style>
@import './css/demo-date-picker.css';
@import './css/shortcuts-bottom.css';

</style>
