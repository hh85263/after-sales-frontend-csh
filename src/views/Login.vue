<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    
    <!-- 登录卡片 -->
    <div class="login-container">
      <div class="login-card">
        <!-- 头部Logo区域 -->
        <div class="login-header">
          <div class="logo-container">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <h2 class="title">欢迎回来</h2>
          <p class="subtitle">请登录您的账户</p>
        </div>

        <!-- 登录表单 -->
        <el-form
          :model="form"
          :rules="rules"
          ref="loginForm"
          class="login-form"
          @submit.prevent="onSubmit"
        >
          <el-form-item prop="username" class="form-item">
            <div class="input-wrapper">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <el-input 
                v-model="form.username" 
                placeholder="请输入用户名"
                autocomplete="username"
                class="custom-input"
                size="large"
              />
            </div>
          </el-form-item>

          <el-form-item prop="password" class="form-item">
            <div class="input-wrapper">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                autocomplete="current-password"
                class="custom-input"
                size="large"
                show-password
              />
            </div>
          </el-form-item>

          <el-form-item class="form-item">
            <el-button 
              type="primary" 
              @click="onSubmit" 
              :loading="loading"
              class="login-button"
              size="large"
            >
              <span v-if="!loading">登录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 底部信息 -->
        <div class="login-footer">
          <p>© 2025（CSH） 系统管理平台</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'

// 表单状态
const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const loginForm = ref(null)
const loading = ref(false)

const auth = useAuthStore()
const router = useRouter()

// 根据用户角色获取默认跳转页面
function getDefaultPageByRole(userRoles) {
  if (!userRoles || userRoles.length === 0) {
    return '/products' // 默认页面
  }
  
  // 系统管理员和仓库管理员都可以访问商品管理
  if (userRoles.includes('SYSTEM_ADMIN') || userRoles.includes('WAREHOUSE_ADMIN')) {
    return '/products'
  }
  
  // 售后人员只能访问退货记录
  if (userRoles.includes('AFTERSALES_STAFF')) {
    return '/returns'
  }
  
  // 其他情况默认跳转到退货页面（相对安全的选择）
  return '/returns'
}

async function onSubmit() {
  // 表单校验
  await loginForm.value.validate(async valid => {
    if (!valid) return

    loading.value = true
    try {
      const loginResult = await auth.login(form.username, form.password)
      ElMessage.success('登录成功')
      
      // 根据用户角色决定跳转页面
      const userRoles = loginResult?.roles || auth.userRoles || []
      const defaultPage = getDefaultPageByRole(userRoles)
      
      console.log('登录成功，用户角色:', userRoles, '跳转页面:', defaultPage)
      router.push(defaultPage)
    } catch (err) {
      // 假设后端返回 401 时抛错
      ElMessage.error(err.response?.data?.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
/* 主容器 */
.login-page {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: -100px;
  animation-delay: 2s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  bottom: -75px;
  left: 50%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 登录容器 */
.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

/* 登录卡片 */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 头部区域 */
.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-container {
  margin-bottom: 20px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
  margin-bottom: 10px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  animation: pulse 2s infinite;
}

.logo-icon svg {
  width: 30px;
  height: 30px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }
  50% {
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
  }
  100% {
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #718096;
  font-size: 16px;
  margin: 0;
  font-weight: 400;
}

/* 表单样式 */
.login-form {
  width: 100%;
}

.form-item {
  margin-bottom: 24px;
}

.form-item:last-child {
  margin-bottom: 0;
}

/* 输入框包装器 */
.input-wrapper {
  position: relative;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  z-index: 10;
  transition: color 0.3s ease;
}

.input-icon svg {
  width: 18px;
  height: 18px;
}

/* 自定义输入框 - 关键修复 */
.custom-input {
  width: 100% !important;
}

.custom-input :deep(.el-input__wrapper) {
  width: 100% !important;
  box-sizing: border-box !important;
  padding-left: 45px;
  padding-right: 45px; /* 为密码显示按钮预留空间 */
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: #fafafa;
  transition: all 0.3s ease;
  box-shadow: none;
  min-height: 50px; /* 固定高度 */
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
  background: #ffffff;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.custom-input :deep(.el-input__inner) {
  color: #374151;
  font-size: 16px;
  font-weight: 500;
  width: 100% !important;
}

.custom-input :deep(.el-input__inner::placeholder) {
  color: #9ca3af;
  font-weight: 400;
}

/* 密码显示/隐藏按钮样式调整 */
.custom-input :deep(.el-input__suffix) {
  right: 15px !important;
}

.custom-input :deep(.el-input__password) {
  color: #9ca3af;
  transition: color 0.3s ease;
}

.custom-input :deep(.el-input__password:hover) {
  color: #667eea;
}

/* 当输入框聚焦时改变图标颜色 */
.input-wrapper:focus-within .input-icon {
  color: #667eea;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-button.is-loading {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

/* 底部信息 */
.login-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.login-footer p {
  color: #9ca3af;
  font-size: 14px;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 10px;
  }
  
  .login-card {
    padding: 30px 20px;
    border-radius: 15px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .circle-1 {
    width: 200px;
    height: 200px;
    top: -100px;
    left: -100px;
  }
  
  .circle-2 {
    width: 150px;
    height: 150px;
    right: -75px;
  }
  
  .circle-3 {
    width: 100px;
    height: 100px;
    bottom: -50px;
  }
}

/* 表单验证错误样式 */
:deep(.el-form-item.is-error .el-input__wrapper) {
  border-color: #f56565 !important;
  box-shadow: 0 0 0 4px rgba(245, 101, 101, 0.1) !important;
}

:deep(.el-form-item__error) {
  font-size: 13px;
  color: #f56565;
  padding-top: 4px;
}
</style>