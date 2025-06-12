<template>
  <el-table 
    :data="records" 
    v-loading="loading" 
    style="width:100%"
    stripe
    border
    class="outbound-table"
  >
    <el-table-column prop="id" label="ID" width="80" align="center" />
    <el-table-column prop="code" label="出库单号" width="150" show-overflow-tooltip />
    <el-table-column prop="customer" label="客户" width="120" show-overflow-tooltip />
    <el-table-column prop="project" label="项目" width="120" show-overflow-tooltip />
    <el-table-column prop="outboundTime" label="出库时间" width="180" align="center">
      <template #default="{ row }">
        {{ formatDateTime(row.outboundTime) }}
      </template>
    </el-table-column>
    <el-table-column prop="operator" label="操作人" width="100" align="center" />
    <el-table-column prop="totalAmount" label="总金额" width="120" align="right">
      <template #default="{ row }">
        <span class="amount-text">¥{{ formatAmount(row.totalAmount) }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="status" label="状态" width="100" align="center">
      <template #default="{ row }">
        <el-tag 
          :type="getStatusType(row.status)" 
          size="small"
        >
          {{ getStatusText(row.status) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
      <template #default="{ row }">
        {{ formatDateTime(row.createdAt) }}
      </template>
    </el-table-column>
    <el-table-column label="操作" width="220" fixed="right" align="center">
      <template #default="{ row }">
        <div class="action-buttons">
          <el-button 
            size="small" 
            type="info"
            plain
            @click="handleViewDetail(row.id)"
            :icon="View"
          >
            查看明细
          </el-button>
          <el-button 
            size="small" 
            type="primary" 
            plain
            @click="handleEdit(row)"
            :icon="Edit"
          >
            编辑
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            plain
            @click="handleDelete(row.id)"
            :icon="Delete"
          >
            删除
          </el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { View, Edit, Delete } from '@element-plus/icons-vue'

// 定义 Props
const props = defineProps({
  records: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义 Emits - 移除了详情相关的emit，只保留操作事件
const emit = defineEmits(['view-detail', 'edit', 'delete'])

// 事件处理函数 - 只触发事件，不处理具体逻辑
function handleViewDetail(id) {
  emit('view-detail', id)
}

function handleEdit(record) {
  emit('edit', record)
}

function handleDelete(id) {
  emit('delete', id)
}

// 工具函数
function formatDateTime(dateTime) {
  if (!dateTime) return '-'
  try {
    return new Date(dateTime).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateTime
  }
}

function formatAmount(amount) {
  if (amount === null || amount === undefined) return '0.00'
  return (parseFloat(amount) || 0).toFixed(2)
}

function getStatusType(status) {
  const statusMap = {
    'pending': 'warning',
    'completed': 'success',
    'cancelled': 'danger',
    'processing': 'primary'
  }
  return statusMap[status] || 'info'
}

function getStatusText(status) {
  const statusMap = {
    'pending': '待处理',
    'completed': '已完成',
    'cancelled': '已取消',
    'processing': '处理中'
  }
  return statusMap[status] || '未知'
}
</script>

<style scoped>
.outbound-table {
  border-radius: 8px;
  overflow: hidden;
}

.outbound-table :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.outbound-table :deep(.el-table__header th) {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
}

.outbound-table :deep(.el-table__row:hover) {
  background-color: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  margin: 0;
  padding: 4px 8px;
  font-size: 12px;
}

.amount-text {
  color: #67c23a;
  font-weight: 600;
}

/* 响应式处理 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-buttons .el-button {
    width: 100%;
    font-size: 11px;
  }
}
</style>