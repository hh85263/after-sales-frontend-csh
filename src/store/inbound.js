// src/store/inbound.js
import { defineStore } from 'pinia'
import http from '@/api/http'
import { ElMessage } from 'element-plus'

export const useInboundStore = defineStore('inbound', {
  state: () => ({
    records: [],
    loading: false,
    total: 0
  }),
  
  actions: {
    async fetchAll(params = {}) {
      this.loading = true
      try {
        console.log('正在获取入库记录...', params)
        const response = await http.get('/inbounds', { params })
        console.log('完整响应数据:', response)
        
        const { data } = response
        console.log('获取到的数据:', data)
        
        // 简化数据处理逻辑
        let records = []
        let total = 0
        
        if (!data) {
          // 没有数据
          records = []
          total = 0
        } else if (Array.isArray(data)) {
          // 直接是数组
          records = data
          total = data.length
        } else if (typeof data === 'object') {
          // 是对象，尝试找到数据数组
          if (data.records && Array.isArray(data.records)) {
            records = data.records
            total = data.total || data.records.length
          } else if (data.list && Array.isArray(data.list)) {
            records = data.list
            total = data.total || data.list.length
          } else if (data.data && Array.isArray(data.data)) {
            records = data.data
            total = data.total || data.data.length
          } else if (data.content && Array.isArray(data.content)) {
            // Spring Boot 分页格式
            records = data.content
            total = data.totalElements || data.content.length
          } else {
            // 单个对象转数组
            records = [data]
            total = 1
          }
        }
        
        // 数据格式化 - 处理字段映射问题
        this.records = records.map(record => ({
          id: record.id,
          code: record.code || '',
          supplier: record.supplier || '',
          inboundTime: this.formatDateTime(record.inboundTime || record.inbound_time),
          operator: record.operator || '',
          totalAmount: parseFloat(record.totalAmount || record.total_amount || 0),
          // 修复 createdAt 字段映射
          createdAt: this.formatDateTime(record.createdAt || record.created_at || record.createTime),
          // 保留原有字段
          ...record
        }))
        
        this.total = total
        
        console.log('处理后的记录数:', this.records.length)
        console.log('处理后的数据:', this.records)
        console.log('store.records 当前值:', this.records)
        
      } catch (error) {
        console.error('获取入库列表失败:', error)
        ElMessage.error('获取入库列表失败：' + (error.response?.data?.message || error.message))
        this.records = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    async fetchDetail(id) {
      try {
        console.log('获取入库明细:', id)
        const { data } = await http.get(`/inbounds/${id}`)
        console.log('获取到的明细数据:', data)
        
        // 处理明细数据
        if (data && data.items) {
          data.items = data.items.map(item => ({
            ...item,
            productName: item.productName || item.product?.name || `商品ID: ${item.productId}`,
            unitPrice: parseFloat(item.unitPrice || 0),
            amount: parseFloat(item.amount || 0),
            quantity: parseInt(item.quantity || 0)
          }))
        }
        
        return data
      } catch (error) {
        console.error('获取入库明细失败:', error)
        const errorMsg = error.response?.status === 404 
          ? '入库记录不存在或已被删除' 
          : '获取入库明细失败：' + (error.response?.data?.message || error.message)
        ElMessage.error(errorMsg)
        throw error
      }
    },

    async add(record) {
      try {
        console.log('新增入库记录:', record)
        
        const submitData = {
          ...record,
          inboundTime: record.inboundTime instanceof Date 
            ? record.inboundTime.toISOString() 
            : record.inboundTime,
          totalAmount: parseFloat(record.totalAmount || 0),
          items: record.items?.map(item => ({
            ...item,
            quantity: parseInt(item.quantity || 0),
            unitPrice: parseFloat(item.unitPrice || 0),
            amount: parseFloat(item.amount || 0)
          })) || []
        }
        
        const { data } = await http.post('/inbounds', submitData)
        console.log('新增成功，返回数据:', data)
        
        ElMessage.success('新增入库成功')
        return data
      } catch (error) {
        console.error('新增入库失败:', error)
        ElMessage.error('新增失败：' + (error.response?.data?.message || error.message))
        throw error
      }
    },

    async update(id, record) {
      try {
        console.log('更新入库记录:', id, record)
        
        const submitData = {
          ...record,
          inboundTime: record.inboundTime instanceof Date 
            ? record.inboundTime.toISOString() 
            : record.inboundTime,
          totalAmount: parseFloat(record.totalAmount || 0),
          items: record.items?.map(item => ({
            ...item,
            quantity: parseInt(item.quantity || 0),
            unitPrice: parseFloat(item.unitPrice || 0),
            amount: parseFloat(item.amount || 0)
          })) || []
        }
        
        const { data } = await http.put(`/inbounds/${id}`, submitData)
        console.log('更新成功，返回数据:', data)
        
        ElMessage.success('更新入库成功')
        return data
      } catch (error) {
        console.error('更新入库失败:', error)
        const errorMsg = error.response?.status === 404 
          ? '入库记录不存在或已被删除' 
          : '更新失败：' + (error.response?.data?.message || error.message)
        ElMessage.error(errorMsg)
        throw error
      }
    },

    async delete(id) {
      try {
        console.log('删除入库记录:', id)
        await http.delete(`/inbounds/${id}`)
        
        // 从本地状态中移除
        this.records = this.records.filter(record => record.id !== id)
        this.total = this.records.length
        
        ElMessage.success('删除入库成功')
      } catch (error) {
        console.error('删除入库失败:', error)
        const errorMsg = error.response?.status === 404 
          ? '入库记录不存在或已被删除' 
          : '删除失败：' + (error.response?.data?.message || error.message)
        ElMessage.error(errorMsg)
        throw error
      }
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      
      try {
        // 处理不同的日期格式
        if (typeof dateTime === 'string') {
          // 处理数据库格式: 2025-06-07T13:40:23 或 2025-06-07 13:40:23
          const date = new Date(dateTime.replace(' ', 'T'))
          if (isNaN(date.getTime())) return dateTime
          return date.toISOString()
        } else if (dateTime instanceof Date) {
          return dateTime.toISOString()
        } else if (Array.isArray(dateTime) && dateTime.length >= 6) {
          // 处理 LocalDateTime 的数组格式 [2025,6,7,13,40,23]
          const [year, month, day, hour, minute, second] = dateTime
          const date = new Date(year, month - 1, day, hour, minute, second || 0)
          return date.toISOString()
        }
        return dateTime
      } catch (error) {
        console.warn('日期格式化失败:', dateTime, error)
        return dateTime
      }
    }
  }
})