import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { useAuthStore } from '@/store/auth'
import axios from 'axios'

// 全局配置 axios
axios.defaults.baseURL = 'http://localhost:8080/api'
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器（可选，用于处理统一的错误）
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // token 过期或无效，清除认证信息
      const auth = useAuthStore()
      auth.clearAuth()
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 应用启动时初始化认证状态
const initAuth = async () => {
  const auth = useAuthStore()
  
  // 如果有token，尝试获取用户信息
  if (auth.token && auth.userRoles.length === 0) {
    try {
      await auth.fetchUserInfo()
    } catch (error) {
      // 如果获取失败，清除无效的token
      console.warn('初始化用户信息失败:', error.message)
      auth.clearAuth()
    }
  }
}

// 初始化认证状态后再挂载应用
initAuth().finally(() => {
  app.use(router)
  app.use(ElementPlus)
  app.mount('#app')
})