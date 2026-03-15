<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">
            <svg
              viewBox="0 0 24 24"
              width="40"
              height="40"
              fill="none"
              stroke="#409eff"
              stroke-width="2"
            >
              <path
                d="M3 21h18M3 7v1a3 3 0 006 0V7m0 0V3h6v4m0 0v1a3 3 0 006 0V7M6 21V10m12 11V10"
              />
            </svg>
          </div>
          <h1 class="login-title">玺华铝业</h1>
          <p class="login-subtitle">业务管理系统</p>
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
              :prefix-icon="User"
              clearable
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <p class="login-footer">© 2026 玺华铝业 版权所有</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

// 页面加载时检查是否已登录
onMounted(() => {
  const saved = localStorage.getItem('xhly_auth')
  if (saved) {
    try {
      const auth = JSON.parse(saved)
      if (auth.username && auth.password) {
        // 已有保存的登录信息，直接跳转
        router.replace('/')
      }
    } catch {
      localStorage.removeItem('xhly_auth')
    }
  }
})

async function handleLogin() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username, password: form.password }),
    })
    const data = await res.json()

    if (data.code === 0) {
      // 登录成功，保存到 localStorage
      localStorage.setItem(
        'xhly_auth',
        JSON.stringify({
          username: form.username,
          password: form.password,
          loginTime: Date.now(),
        }),
      )
      ElMessage.success('登录成功')
      router.replace('/')
    } else {
      ElMessage.error(data.message || '账号或密码错误')
    }
  } catch {
    ElMessage.error('网络错误，请检查服务是否启动')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.login-bg {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a3a5c 0%, #2d6aa0 50%, #1a3a5c 100%);
  position: relative;
}

.login-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(64, 158, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(64, 158, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.login-card {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.login-logo {
  margin-bottom: 12px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 6px 0;
  letter-spacing: 4px;
}

.login-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
  letter-spacing: 2px;
}

.login-form {
  margin-top: 10px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 4px 12px;
  border-radius: 8px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  letter-spacing: 6px;
  border-radius: 8px;
  margin-top: 8px;
}

.login-footer {
  position: absolute;
  bottom: 24px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  z-index: 1;
}
</style>
