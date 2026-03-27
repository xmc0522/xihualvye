<template>
  <div class="login-page" @mousemove="handleMouseMove">
    <!-- 左侧：动态几何图形区域 -->
    <div class="left-section">
      <!-- 系统标题 -->
      <div class="system-title-wrapper">
        <div class="system-title">玺华铝业-业务管理系统</div>
        <!-- <p class="system-subtitle">智能管理 · 高效协同</p> -->
      </div>
      
      <!-- 漂浮装饰元素 -->
      <div class="floating-decorations">
        <div class="float-circle float-1"></div>
        <div class="float-circle float-2"></div>
        <div class="float-circle float-3"></div>
        <div class="float-star star-1">⭐</div>
        <div class="float-star star-2">✦</div>
        <div class="float-star star-3">✨</div>
      </div>
      
      <div class="shapes-container">
        <!-- 橙色半圆 -->
        <div class="shape shape-semicircle-orange" ref="orangeShape">
          <div class="eyes eyes-low" ref="orangeEyes">
            <div class="pupil pupil-dark"></div>
            <div class="pupil pupil-dark"></div>
          </div>
        </div>

        <!-- 紫色长方形 -->
        <div class="shape shape-rect-purple" ref="purpleShape">
          <div class="eyes" ref="purpleEyes">
            <div class="eyeball">
              <div class="pupil"></div>
            </div>
            <div class="eyeball">
              <div class="pupil"></div>
            </div>
          </div>
        </div>
        
        <!-- 黑色长方形 -->
        <div class="shape shape-rect-black" ref="blackShape">
          <div class="eyes" ref="blackEyes">
            <div class="eyeball">
              <div class="pupil"></div>
            </div>
            <div class="eyeball">
              <div class="pupil"></div>
            </div>
          </div>
        </div>
        
        <!-- 黄色圆角矩形 -->
        <div class="shape shape-rounded-yellow" ref="yellowShape">
          <div class="eyes" ref="yellowEyes">
            <div class="pupil pupil-dark"></div>
            <div class="pupil pupil-dark"></div>
          </div>
          <div class="mouth"></div>
        </div>
      </div>
    </div>

    <!-- 右侧：登录表单区域 -->
    <div class="right-section">
      <div class="login-container">
        <div class="login-header">
          <div class="welcome-decoration">
            <span class="welcome-icon">✨</span>
            <h1 class="login-title">欢迎回来</h1>
            <span class="welcome-icon">✨</span>
          </div>
          <p class="login-subtitle">很高兴再次见到您</p>
          <!-- <p class="login-subtitle">业务管理系统</p> -->
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入账号"
              size="large"
              clearable
              @input="handleInput"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              size="large"
              clearable
              @input="handleInput"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
              <template #suffix>
                <el-icon class="password-toggle" @click="togglePassword">
                  <View v-if="!showPassword" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="form.rememberMe" label="记住密码" />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '正在登录...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <p class="login-footer">© 2026 玺华铝业 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { useLogin } from './login'

const {
  formRef,
  loading,
  showPassword,
  form,
  rules,
  purpleShape,
  blackShape,
  orangeShape,
  yellowShape,
  purpleEyes,
  blackEyes,
  orangeEyes,
  yellowEyes,
  handleMouseMove,
  handleInput,
  handleInputFocus,
  handleInputBlur,
  togglePassword,
  handleLogin,
} = useLogin()
</script>

<style scoped src="./login.css"></style>

