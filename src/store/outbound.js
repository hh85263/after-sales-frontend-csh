import { defineStore } from 'pinia'
import http from '@/api/http'
import { ElMessage } from 'element-plus'

export const useOutboundStore = defineStore('outbound', {
  state: () => ({
    records: [],
    loading: false
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { data } = await http.get('/outbounds')
        this.records = Array.isArray(data) ? data : []
      } catch (e) {
        ElMessage.error('获取出库列表失败：' + e.message)
      } finally {
        this.loading = false
      }
    },

    async fetchDetail(id) {
      try {
        const { data } = await http.get(`/outbounds/${id}`)
        return data
      } catch (e) {
        ElMessage.error('获取明细失败：' + e.message)
      }
    },

    async add(record) {
      try {
        const { data } = await http.post('/outbounds', record)
        this.records.unshift(data)
        ElMessage.success('新增出库成功')
      } catch (e) {
        ElMessage.error('新增失败：' + e.message)
      }
    },

    async update(id, record) {
      try {
        const { data } = await http.put(`/outbounds/${id}`, record)
        this.records = this.records.map(r => r.id === id ? data : r)
        ElMessage.success('更新成功')
      } catch (e) {
        ElMessage.error('更新失败：' + e.message)
      }
    },

    async remove(id) {
      try {
        await http.delete(`/outbounds/${id}`)
        this.records = this.records.filter(r => r.id !== id)
        ElMessage.success('删除成功')
      } catch (e) {
        ElMessage.error('删除失败：' + e.message)
      }
    }
  }
})
