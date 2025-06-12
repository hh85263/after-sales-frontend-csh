import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import { ElMessage } from 'element-plus'

const http = axios.create({ 
  baseURL: '/api',
  timeout: 10000 // 添加超时设置
})

// 请求拦截器
http.interceptors.request.use(
  cfg => {
    const token = localStorage.getItem('token')
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`
    }
    return cfg
  },
  err => {
    return Promise.reject(err)
  }
)

// 响应拦截器
http.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    const message = err.response?.data?.message || err.message
    
    if (status === 401) {
      const auth = useAuthStore()
      auth.logout()
      ElMessage.error('登录过期，请重新登录')
      
      // 避免重复跳转
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      ElMessage.error('无权限执行此操作')
    } else if (status >= 500) {
      ElMessage.error('服务器错误，请稍后重试')
    } else if (status >= 400) {
      ElMessage.error(`请求错误：${message}`)
    } else {
      ElMessage.error('网络错误：' + message)
    }
    
    return Promise.reject(err)
  }
)

export default http