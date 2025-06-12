// src/store/auth.js
import { defineStore } from 'pinia'
import http from '@/api/http'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const token = localStorage.getItem('token') || ''
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]')
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    
    // 调试输出
    console.log('AuthStore初始化:', { 
      hasToken: !!token, 
      userRoles: userRoles, 
      userInfo: Object.keys(userInfo).length 
    })
    
    return {
      token,
      userRoles,
      userInfo
    }
  },

  getters: {
    isLoggedIn: (state) => {
      const result = !!state.token
      console.log('isLoggedIn getter:', result)
      return result
    },
    
    // 添加角色检查的计算属性
    isAdmin: (state) => {
      const result = state.userRoles.includes('SYSTEM_ADMIN') || state.userRoles.includes('WAREHOUSE_ADMIN')
      console.log('isAdmin getter:', result, 'roles:', state.userRoles)
      return result
    },
    
    isSystemAdmin: (state) => {
      return state.userRoles.includes('SYSTEM_ADMIN')
    },
    
    isWarehouseAdmin: (state) => {
      return state.userRoles.includes('WAREHOUSE_ADMIN')
    },
    
    isAfterSalesStaff: (state) => {
      const result = state.userRoles.includes('AFTERSALES_STAFF')
      console.log('isAfterSalesStaff getter:', result, 'roles:', state.userRoles)
      return result
    },
    
    // 获取用户名
    username: (state) => {
      return state.userInfo.username || ''
    },
    
    // 原有的角色检查方法保持不变
    hasRole: (state) => (role) => state.userRoles.includes(role),
    hasAnyRole: (state) => (roles) => roles.some(role => state.userRoles.includes(role))
  },

  actions: {
    async login(username, password) {
      try {
        const { data } = await http.post('/auth/login', { username, password })
        
        this.token = data.token
        this.userRoles = data.roles || []
        this.userInfo = data.user || { username }
        
        localStorage.setItem('token', data.token)
        localStorage.setItem('userRoles', JSON.stringify(this.userRoles))
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        
        console.log('登录成功:', { 
          token: !!this.token, 
          roles: this.userRoles,
          isAdmin: this.isAdmin,
          isAfterSalesStaff: this.isAfterSalesStaff
        })
        ElMessage.success('登录成功')
        return data
      } catch (err) {
        const message = err.response?.data?.message || '登录失败'
        ElMessage.error(message)
        throw err
      }
    },

    async register(username, password, role) {
      try {
        const response = await http.post('/auth/register', {
          username,
          password,
          roles: [role]
        })
        ElMessage.success('注册成功，请登录')
        return response.data
      } catch (err) {
        const message = err.response?.data?.message || '注册失败'
        ElMessage.error(message)
        throw err
      }
    },

    async fetchUserInfo() {
      if (!this.token) {
        throw new Error('未登录')
      }
      
      try {
        const { data } = await http.get('/auth/me')
        this.userRoles = data.roles || []
        this.userInfo = data.user || this.userInfo
        
        localStorage.setItem('userRoles', JSON.stringify(this.userRoles))
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        
        console.log('获取用户信息成功:', { 
          roles: this.userRoles,
          isAdmin: this.isAdmin,
          isAfterSalesStaff: this.isAfterSalesStaff
        })
        return data
      } catch (err) {
        console.log('获取用户信息失败:', err.message)
        this.logout()
        throw err
      }
    },

    logout() {
      console.log('执行登出操作')
      this.token = ''
      this.userRoles = []
      this.userInfo = {}
      
      localStorage.removeItem('token')
      localStorage.removeItem('userRoles')
      localStorage.removeItem('userInfo')
      
      ElMessage.info('已退出登录')
    },

    clearAuth() {
      this.logout()
    }
  }
})