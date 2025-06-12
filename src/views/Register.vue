<template>
  <div class="register-page-csh">
    <div class="background-shapes-csh">
      <div class="shape-csh shape1-csh"></div>
      <div class="shape-csh shape2-csh"></div>
      <div class="shape-csh shape3-csh"></div>
      <div class="shape-csh shape4-csh"></div>
    </div>
    
    <el-card class="register-card-csh">
      <div class="card-header-csh">
        <div class="logo-container-csh">
          <div class="logo-csh">CSH</div>
        </div>
        <h2 class="title-csh">创建账户</h2>
        <p class="subtitle-csh">加入我们，开启您的专属体验</p>
      </div>
      
      <el-form
        :model="formCsh"
        :rules="rulesCsh"
        ref="regFormCsh"
        label-position="top"
        @submit.prevent="onSubmitCsh"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="formCsh.username" 
            autocomplete="username" 
            placeholder="请输入用户名" 
            prefix-icon="el-icon-user"
          >
            <template #prefix>
              <i class="input-icon-csh">👤</i>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formCsh.password"
            type="password"
            autocomplete="new-password"
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <i class="input-icon-csh">🔒</i>
            </template>
          </el-input>
          <div class="password-strength-csh" v-if="formCsh.password">
            <div class="strength-label-csh">密码强度:</div>
            <div class="strength-meter-csh">
              <div class="strength-bar-csh" :style="{ width: passwordStrengthCsh + '%', background: passwordStrengthColorCsh }"></div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirm">
          <el-input
            v-model="formCsh.confirm"
            type="password"
            autocomplete="new-password"
            placeholder="请再次输入密码"
            show-password
          >
            <template #prefix>
              <i class="input-icon-csh">🔒</i>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="选择角色" prop="role">
          <el-select v-model="formCsh.role" placeholder="请选择角色" class="role-select-csh">
            <el-option
              v-for="item in rolesCsh"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="role-option-csh">
                <span class="role-icon-csh">{{ getRoleIconCsh(item.value) }}</span>
                <span>{{ item.label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loadingCsh" 
            native-type="submit" 
            class="submit-btn-csh"
            :disabled="!formValidCsh"
          >
            <span class="btn-text-csh">{{ loadingCsh ? '注册中...' : '立即注册' }}</span>
            <span class="btn-icon-csh">✨</span>
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="divider-csh">
        <span>已有账号?</span>
      </div>
      
      <el-button @click="goLoginCsh" class="login-btn-csh">
        登录现有账号
      </el-button>
      
      <div class="terms-csh">
        注册即表示您同意我们的<a href="#" class="terms-link-csh">服务条款</a>和<a href="#" class="terms-link-csh">隐私政策</a>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'

const rolesCsh = [
  { label: '系统管理员', value: 'SYSTEM_ADMIN' },
  { label: '仓库管理员', value: 'WAREHOUSE_ADMIN' },
  { label: '售后客服',   value: 'AFTERSALES_STAFF' }
]

const formCsh = reactive({
  username: '',
  password: '',
  confirm: '',
  role: ''
})

const rulesCsh = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, 
      message: '密码需包含大小写字母和数字', 
      trigger: 'blur' 
    }
  ],
  confirm: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formCsh.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const routerCsh = useRouter()
const authCsh = useAuthStore()
const loadingCsh = ref(false)
const regFormCsh = ref(null)

// 密码强度计算
const passwordStrengthCsh = computed(() => {
  if (!formCsh.password) return 0
  
  let strength = 0
  if (formCsh.password.length >= 6) strength += 20
  if (formCsh.password.length >= 10) strength += 20
  if (/[A-Z]/.test(formCsh.password)) strength += 20
  if (/[a-z]/.test(formCsh.password)) strength += 20
  if (/\d/.test(formCsh.password)) strength += 20
  if (/[^A-Za-z0-9]/.test(formCsh.password)) strength += 20
  
  return Math.min(100, strength)
})

const passwordStrengthColorCsh = computed(() => {
  const strength = passwordStrengthCsh.value
  if (strength < 40) return '#ff4949'
  if (strength < 70) return '#e6a23c'
  return '#67c23a'
})

// 表单是否有效
const formValidCsh = computed(() => {
  return formCsh.username && 
         formCsh.password && 
         formCsh.confirm && 
         formCsh.role && 
         formCsh.password === formCsh.confirm
})

function getRoleIconCsh(role) {
  switch(role) {
    case 'SYSTEM_ADMIN': return '🛡️'
    case 'WAREHOUSE_ADMIN': return '📦'
    case 'AFTERSALES_STAFF': return '🎧'
    default: return '👤'
  }
}

function onSubmitCsh() {
  regFormCsh.value.validate(async (valid) => {
    if (!valid) return
    
    loadingCsh.value = true
    try {
      await authCsh.register(formCsh.username, formCsh.password, formCsh.role)
      ElMessage({
        message: '注册成功！请登录您的新账户',
        type: 'success',
        duration: 3000
      })
      setTimeout(() => {
        routerCsh.push('/login')
      }, 1500)
    } catch (err) {
      // 错误信息已在 store 中显示
    } finally {
      loadingCsh.value = false
    }
  })
}

function goLoginCsh() {
  routerCsh.push('/login')
}
</script>

<style scoped>
.register-page-csh {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.background-shapes-csh {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  top: 0;
  left: 0;
}

.shape-csh {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.shape1-csh {
  width: 300px;
  height: 300px;
  top: -150px;
  left: -100px;
  animation: float-csh 8s infinite ease-in-out;
}

.shape2-csh {
  width: 200px;
  height: 200px;
  bottom: -80px;
  right: -50px;
  animation: float-csh 9s infinite ease-in-out reverse;
}

.shape3-csh {
  width: 150px;
  height: 150px;
  bottom: 150px;
  left: 10%;
  animation: float-csh 7s infinite ease-in-out;
}

.shape4-csh {
  width: 100px;
  height: 100px;
  top: 20%;
  right: 10%;
  animation: float-csh 6s infinite ease-in-out reverse;
}

@keyframes float-csh {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(20px, 20px) rotate(10deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

.register-card-csh {
  width: 480px;
  max-width: 95%;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
  transition: all 0.4s ease;
  position: relative;
  z-index: 10;
  backdrop-filter: blur(5px);
}

.register-card-csh:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.card-header-csh {
  text-align: center;
  margin-bottom: 30px;
}

.logo-container-csh {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.logo-csh {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
  font-size: 22px;
  border-radius: 50%;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.title-csh {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 10px;
}

.subtitle-csh {
  color: #666;
  font-size: 16px;
  margin: 0;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  padding-bottom: 8px;
}

:deep(.el-input__inner) {
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e8e8e8;
  transition: all 0.3s;
  padding-left: 45px;
  font-size: 15px;
}

:deep(.el-input__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.input-icon-csh {
  font-size: 18px;
  margin-right: 10px;
  opacity: 0.7;
}

.password-strength-csh {
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.strength-label-csh {
  font-size: 12px;
  color: #666;
  margin-right: 10px;
}

.strength-meter-csh {
  flex: 1;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.strength-bar-csh {
  height: 100%;
  transition: all 0.3s;
}

.role-select-csh {
  width: 100%;
}

:deep(.el-select .el-input__inner) {
  padding-left: 15px;
}

.role-option-csh {
  display: flex;
  align-items: center;
}

.role-icon-csh {
  margin-right: 8px;
  font-size: 18px;
}

.submit-btn-csh {
  width: 100%;
  height: 48px;
  margin-top: 10px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
}

.submit-btn-csh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.6);
}

.submit-btn-csh:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-text-csh {
  margin-right: 8px;
}

.btn-icon-csh {
  font-size: 18px;
}

.divider-csh {
  display: flex;
  align-items: center;
  margin: 25px 0;
  color: #999;
  font-size: 14px;
}

.divider-csh::before,
.divider-csh::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #eee;
}

.divider-csh span {
  padding: 0 15px;
}

.login-btn-csh {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: 2px solid #eee;
  color: #666;
  font-weight: 500;
  transition: all 0.3s;
}

.login-btn-csh:hover {
  background: #f9f9f9;
  border-color: #ddd;
  color: #333;
}

.terms-csh {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 20px;
}

.terms-link-csh {
  color: #667eea;
  text-decoration: none;
}

.terms-link-csh:hover {
  text-decoration: underline;
}

@media (max-width: 576px) {
  .register-card-csh {
    padding: 30px 20px;
  }
  
  .title-csh {
    font-size: 24px;
  }
  
  .subtitle-csh {
    font-size: 14px;
  }
}
</style>