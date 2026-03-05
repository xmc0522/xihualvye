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
</template>

<script lang="ts" setup>
import { size, value2, shortcuts } from './ts/date-picker'
</script>

<style>
@import './css/demo-date-picker.css';
@import './css/shortcuts-bottom.css';
</style>
