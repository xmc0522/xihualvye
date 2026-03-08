<template>

  <div>
      <span>客户：</span>
      <el-input v-model="input4" style="width: 140px;" placeholder="请填写客户名称"  />
      <span style="margin-left: 15px;">客户单号：</span>
      <el-input v-model="input5" style="width: 120px;" placeholder="请填写客户单号"  />
      <span style="margin-left: 15px;">数量：</span>
      <el-input v-model="input6" style="width: 95px;" placeholder="请输入数量"  />
  </div>

  <!-- 时间选择器 -->
  <div class="demo-date-picker">
    <div class="block">
      <span class="demonstration">时间：</span>
      <el-date-picker
        v-model="value2"
        type="date"
        placeholder="请选择时间"
        :size="size"
      />
    </div>
    
  </div>

<!-- 长宽高 -->
  <div>
      <span>长度：</span>
      <el-input v-model="input1" style="width: 95px;" placeholder="请输入长度"  />
      <span style="margin-left: 15px;">宽度：</span>
      <el-input v-model="input2" style="width: 95px;" placeholder="请输入宽度"  />
      <span style="margin-left: 15px;">高度：</span>
      <el-input v-model="input3" style="width: 95px;" placeholder="请输入高度"  />
  </div>

<!-- 表面处理和规格 -->
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

<!-- 选择不生成的名称 -->
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

<!-- 选择生成的配件 -->
  <div class="m-4" style="display: flex; align-items: center; gap: 10px; margin-left: 5%;">
    <p style="margin: 0;">选择生成的配件：</p>
    <el-select
      v-model="value5"
      multiple
      placeholder="请勾选"
      style="width: 210px"
    >
      <el-option
        v-for="item in options5"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>

  <!-- 按钮 -->
  <div>
    <el-button type="primary" :icon="Search">查询</el-button>
    <el-button type="primary" @click="goToBiaoge">
      生成表格<el-icon class="el-icon--right"><Upload /></el-icon>
    </el-button>
  </div>


</template>

<script lang="ts" setup>
import { size, value2, shortcuts } from './ts/date-picker'
import { value1,value3, value4,value5,options1, options3, options4,options5} from './ts/xialakuang'
import { input1, input2, input3, input4, input5, input6} from './ts/shurukuang'
import { Search, Upload } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

// 格式化日期为 "YYYY年MM月DD日"
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

const router = useRouter()
const goToBiaoge = () => {
  // 获取时间（value2是单个日期值）
  const startDate = value2.value ? formatDate(value2.value) : ''
  router.push({
    path: '/biaoge1',
    query: {
      customer: input4.value,
      orderNo: input5.value,
      quantity: input6.value,
      length: input1.value,
      width: input2.value,
      height: input3.value,
      surface: value3.value,
      excludeNames: JSON.stringify(value1.value),
      includeAccessories: JSON.stringify(value5.value),
      date: startDate,
    }
  })
}

</script>
<style>
@import './css/demo-date-picker.css';
@import './css/shortcuts-bottom.css';

</style>
