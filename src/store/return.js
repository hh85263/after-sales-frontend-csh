// src/store/return.js
import { defineStore } from 'pinia'
import http from '@/api/http'
import { ElMessage } from 'element-plus'

export const useReturnStore = defineStore('return', {
  // 1️⃣ 统一把所有记录放进 listRaw，并加分页状态
  state: () => ({
    listRaw: [],          // 后端返回的全部退货记录
    loading: false,
    currentPage: 1,       // 当前页
    pageSize: 10          // 每页条数
  }),

  // 2️⃣ getters：根据 currentPage/pageSize 动态切片 → 表格直接 bind 这个
  getters: {
    listPaged: (state) =>
      state.listRaw.slice(
        (state.currentPage - 1) * state.pageSize,
        state.currentPage * state.pageSize
      ),
    total:   (state) => state.listRaw.length     // 给分页器显示总条数
  },

  actions: {
    // 3️⃣ 只拉一次数据，不再带 page/size 给后端
    async fetchAll () {
      this.loading = true
      try {
        const { data } = await http.get('/return-records')
        // 兼容后端可能返回数组或 Page 对象
        this.listRaw = Array.isArray(data) ? data : (data.content || [])
        // 拉完后，若当前页超过总页数，自动回到最后一页
        const maxPage = Math.max(1, Math.ceil(this.total / this.pageSize))
        if (this.currentPage > maxPage) this.currentPage = maxPage
      } finally {
        this.loading = false
      }
    },

    /* 以下增删改操作保持不变，只把 records 换成 listRaw */
    async add (record) {
      const { data } = await http.post('/return-records', record)
      this.listRaw.unshift(data)
      ElMessage.success('新增退货申请成功')
      return data
    },

    async update (id, record) {
      const { data } = await http.put(`/return-records/${id}`, record)
      const idx = this.listRaw.findIndex(item => item.id === id)
      if (idx !== -1) this.listRaw[idx] = data
      ElMessage.success('修改成功')
      return data
    },

    async delete (id) {
      await http.delete(`/return-records/${id}`)
      const idx = this.listRaw.findIndex(item => item.id === id)
      if (idx !== -1) this.listRaw.splice(idx, 1)
      ElMessage.success('删除成功')
    },

    async confirm (id) {
      const { data } = await http.put(`/return-records/${id}/confirm`)
      const idx = this.listRaw.findIndex(item => item.id === id)
      if (idx !== -1) this.listRaw[idx] = data
      ElMessage.success('退货已确认')
      return data
    }
  }
})
