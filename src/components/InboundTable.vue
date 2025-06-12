<!-- src/components/InboundTable.vue -->
<template>
  <div>
    <el-table 
      :data="safeRecords" 
      v-loading="loading" 
      style="width:100%"
      empty-text="暂无数据"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="code" label="入库单号" width="150" />
      <el-table-column prop="supplier" label="供应商" width="120" />
      <el-table-column prop="inboundTime" label="入库时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.inboundTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" width="100" />
      <el-table-column prop="totalAmount" label="总金额" width="120">
        <template #default="{ row }">
          ¥{{ (row.totalAmount || 0).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="$emit('view-detail', row.id)">查看明细</el-button>
          <el-button size="small" type="danger" @click="$emit('delete', row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 入库明细对话框 -->
    <el-dialog title="入库明细" v-model="detailVisible" width="800px">
      <el-table :data="detailItems" style="width: 100%">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="unitPrice" label="单价" width="120">
          <template #default="{ row }">
            ¥{{ (row.unitPrice || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            ¥{{ (row.amount || 0).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  detailItems: {
    type: Array,
    default: () => []
  }
})

const detailVisible = ref(false)

defineEmits(['view-detail', 'delete'])

// 安全的数据处理
const safeRecords = computed(() => {
  try {
    if (!props.records) return []
    if (!Array.isArray(props.records)) return []
    return props.records
  } catch (error) {
    console.error('处理records数据时出错:', error)
    return []
  }
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN')
  } catch {
    return dateStr
  }
}

// 监听父组件传入的明细数据变化，自动显示对话框
watch(() => props.detailItems, async (newItems) => {
  try {
    if (newItems && newItems.length > 0) {
      await nextTick()
      detailVisible.value = true
    }
  } catch (error) {
    console.error('处理明细数据时出错:', error)
  }
})
</script>