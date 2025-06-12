// src/store/product.js
import { defineStore } from 'pinia'
import http from '@/api/http'
import { ElMessage } from 'element-plus'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],    // 商品列表
    loading: false,  // 加载状态
    total: 0        // 总数量（为了与更新的 InboundRecords 兼容）
  }),
  
  actions: {
    // 保持原有的方法，同时添加参数支持
    async fetchAll(params = {}) {
      this.loading = true
      try {
        console.log('正在获取产品列表...', params) // 调试日志
        const { data } = await http.get('/products', { params })
        console.log('获取到的产品数据:', data) // 调试日志
        
        // 处理不同的返回数据格式
        if (Array.isArray(data)) {
          this.products = data
          this.total = data.length
        } else if (data && typeof data === 'object') {
          // 如果后端返回分页数据格式
          this.products = data.records || data.list || data.data || []
          this.total = data.total || data.count || this.products.length
        } else {
          this.products = []
          this.total = 0
        }
        
        console.log('处理后的产品数:', this.products.length) // 调试日志
      } catch (error) {
        console.error('获取商品列表失败:', error)
        ElMessage.error('获取商品列表失败：' + (error.response?.data?.message || error.message))
        this.products = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    async add(product) {
      try {
        const { data } = await http.post('/products', product)
        this.products.unshift(data)
        this.total = this.products.length
        ElMessage.success('新增商品成功')
        return data
      } catch (error) {
        console.error('新增商品失败:', error)
        ElMessage.error('新增失败：' + (error.response?.data?.message || error.message))
        throw error
      }
    },

    async update(id, payload) {
      try {
        const { data } = await http.put(`/products/${id}`, payload)
        const idx = this.products.findIndex(p => p.id === id)
        if (idx !== -1) this.products.splice(idx, 1, data)
        ElMessage.success('更新商品成功')
        return data
      } catch (error) {
        console.error('更新商品失败:', error)
        ElMessage.error('更新失败：' + (error.response?.data?.message || error.message))
        throw error
      }
    },

    // 保持原有的 remove 方法名，同时添加 delete 别名
    async remove(id) {
      return this.delete(id)
    },

    async delete(id) {
      try {
        await http.delete(`/products/${id}`)
        this.products = this.products.filter(p => p.id !== id)
        this.total = this.products.length
        ElMessage.success('删除商品成功')
      } catch (error) {
        console.error('删除商品失败:', error)
        ElMessage.error('删除失败：' + (error.response?.data?.message || error.message))
        throw error
      }
    }
  }
})