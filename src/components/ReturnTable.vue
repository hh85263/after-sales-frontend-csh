<!-- src/components/ReturnTable.vue -->
<template>
  <el-table 
    :data="records" 
    v-loading="loading" 
    style="width:100%" 
    stripe
    :header-cell-style="{ backgroundColor: '#f5f7fa', fontWeight: '600' }"
    :cell-style="{ padding: '12px 8px' }"
    table-layout="fixed"
  >
    <template #empty>
      <div style="padding: 40px; color: #909399; text-align: center;">
        <el-icon size="48"><DocumentRemove /></el-icon>
        <div style="margin-top: 10px; font-size: 14px;">暂无退货记录</div>
      </div>
    </template>

    <el-table-column prop="id" label="ID" width="60" align="center" />
    
    <el-table-column label="退货单号" min-width="140">
      <template #default="{ row }">
        <div class="code-display">
          {{ row.code || `RT${String(row.id).padStart(6, '0')}` }}
        </div>
      </template>
    </el-table-column>
    
    <el-table-column label="数量/金额" min-width="100" align="center">
      <template #default="{ row }">
        <div class="quantity-amount">
          <el-tag size="small" type="primary" class="quantity-tag">
            {{ row.quantity || 0 }}
          </el-tag>
          <div class="amount-text">
            {{ row.amount ? `¥${formatPrice(row.amount)}` : '-' }}
          </div>
        </div>
      </template>
    </el-table-column>
    
    <el-table-column label="退货原因" min-width="140">
      <template #default="{ row }">
        <div class="return-reason" :title="row.reason">
          {{ row.reason || '-' }}
        </div>
      </template>
    </el-table-column>
    
    <el-table-column label="操作员" min-width="80">
      <template #default="{ row }">
        <div class="operator">{{ row.operator || '-' }}</div>
      </template>
    </el-table-column>
    
    <el-table-column label="退货时间" min-width="110">
      <template #default="{ row }">
        <div class="time">{{ formatDate(row.returnTime) }}</div>
      </template>
    </el-table-column>
    
    <el-table-column label="类型" min-width="80" align="center">
      <template #default="{ row }">
        <el-tag 
          :type="getReturnTypeTagType(row.returnType)" 
          size="small"
        >
          {{ getReturnTypeText(row.returnType) }}
        </el-tag>
      </template>
    </el-table-column>
    
    <el-table-column label="状态" min-width="80" align="center">
      <template #default="{ row }">
        <el-tag 
          :type="getStatusTagType(row.status)" 
          size="small"
        >
          {{ getStatusText(row.status) }}
        </el-tag>
      </template>
    </el-table-column>
    
    <!-- 修复操作列的显示问题 - 根据角色和状态显示不同按钮 -->
    <el-table-column label="操作" width="260" fixed="right" align="center">
      <template #default="{ row }">
        <div class="action-buttons">
          <!-- 查看按钮 - 所有角色都可以查看 -->
          <el-button 
            type="primary" 
            size="small" 
            @click="handleView(row)"
            :icon="View"
          >
            查看
          </el-button>
          
          <!-- 编辑按钮 - 仅在待处理状态且有编辑权限时显示 -->
          <el-button 
            v-if="canEdit(row)"
            type="warning" 
            size="small" 
            @click="handleEdit(row)"
            :icon="Edit"
          >
            编辑
          </el-button>
          
          <!-- 确认按钮 - 仅管理员在待处理状态时可确认 -->
          <el-button 
            v-if="canConfirm(row)"
            type="success" 
            size="small" 
            @click="handleConfirm(row)"
            :icon="Check"
            title="确认退货"
          >
            确认
          </el-button>
          
          <!-- 删除按钮 - 仅管理员在待处理状态时可删除 -->
          <el-button 
            v-if="canDelete(row)"
            type="danger" 
            size="small" 
            @click="handleDelete(row)"
            :icon="Delete"
            title="删除记录"
          >
            删除
          </el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { computed } from 'vue'
import { DocumentRemove, View, Edit, Delete, Check } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth' // 假设您有auth store

// 定义组件属性
const props = defineProps({
  records: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['view', 'edit', 'delete', 'confirm', 'refresh'])

// 获取用户信息和权限
const authStore = useAuthStore()
const userRoles = computed(() => authStore.userRoles || [])

// 检查是否有指定角色权限
function hasRole(role) {
  return userRoles.value.includes(role)
}

// 检查是否是管理员角色
function isAdmin() {
  return hasRole('SYSTEM_ADMIN') || hasRole('WAREHOUSE_ADMIN')
}

// 检查是否是售后人员
function isAfterSalesStaff() {
  return hasRole('AFTERSALES_STAFF')
}

// 格式化价格
function formatPrice(price) {
  if (!price) return '0.00'
  return Number(price).toFixed(2)
}

// 格式化日期（简化版本）
function formatDate(dateTime) {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  if (isNaN(date.getTime())) return '-'
  
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${month}-${day} ${hours}:${minutes}`
}

// 获取退货类型文本
function getReturnTypeText(type) {
  const typeMap = {
    'RETURN': '退货',
    'EXCHANGE': '换货', 
    'WARRANTY_RETURN': '质保退换'
  }
  return typeMap[type] || type || '未知'
}

// 获取退货类型标签类型
function getReturnTypeTagType(type) {
  const tagTypeMap = {
    'RETURN': 'danger',
    'EXCHANGE': 'warning',
    'WARRANTY_RETURN': 'success'
  }
  return tagTypeMap[type] || 'info'
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'PENDING': '待处理',
    'CONFIRMED': '已确认',
    'APPROVED': '已批准', 
    'REJECTED': '已拒绝',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status || '未知'
}

// 获取状态标签类型
function getStatusTagType(status) {
  const tagTypeMap = {
    'PENDING': 'warning',
    'CONFIRMED': 'primary',
    'APPROVED': 'success',
    'REJECTED': 'danger', 
    'COMPLETED': 'success',
    'CANCELLED': 'info'
  }
  return tagTypeMap[status] || 'info'
}

// 判断是否可以编辑 - 根据角色和状态判断
function canEdit(row) {
  // 只有待处理状态可以编辑
  if (row.status !== 'PENDING') return false
  
  // 管理员可以编辑所有记录
  if (isAdmin()) return true
  
  // 售后人员只能编辑自己创建的记录
  if (isAfterSalesStaff()) {
    // 这里需要根据实际情况判断，比如通过 operator 字段
    return row.operator === authStore.username
  }
  
  return false
}

// 判断是否可以确认 - 只有管理员可以确认待处理的记录
function canConfirm(row) {
  return row.status === 'PENDING' && isAdmin()
}

// 判断是否可以删除 - 只有管理员可以删除待处理的记录
function canDelete(row) {
  return row.status === 'PENDING' && isAdmin()
}

// 查看详情
function handleView(row) {
  emit('view', row)
}

// 编辑记录
function handleEdit(row) {
  emit('edit', row)
}

// 确认记录
function handleConfirm(row) {
  ElMessageBox.confirm(
    `确定要确认退货单号为 "${row.code || `RT${String(row.id).padStart(6, '0')}`}" 的记录吗？确认后状态将变为"已确认"。`,
    '确认操作',
    {
      confirmButtonText: '确定确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    emit('confirm', row)
  }).catch(() => {
    ElMessage.info('已取消确认操作')
  })
}

// 删除记录
function handleDelete(row) {
  ElMessageBox.confirm(
    `确定要删除退货单号为 "${row.code || `RT${String(row.id).padStart(6, '0')}`}" 的记录吗？此操作不可恢复！`,
    '确认删除',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: false
    }
  ).then(() => {
    emit('delete', row)
  }).catch(() => {
    ElMessage.info('已取消删除操作')
  })
}
</script>

<style scoped>
.el-table {
  border-radius: 8px;
  overflow: hidden;
  font-size: 13px;
}

:deep(.el-table__row) {
  height: auto;
  min-height: 60px;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

:deep(.el-table__cell) {
  padding: 12px 8px;
  vertical-align: middle;
}

/* 退货单号样式 */
.code-display {
  font-family: 'Consolas', 'Monaco', monospace;
  font-weight: 600;
  color: #409eff;
  font-size: 13px;
}

/* 数量金额样式 */
.quantity-amount {
  text-align: center;
}

.quantity-tag {
  margin-bottom: 4px;
  font-weight: 600;
}

.amount-text {
  color: #f56c6c;
  font-weight: bold;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 退货原因样式 */
.return-reason {
  color: #606266;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

/* 操作员样式 */
.operator {
  color: #303133;
  font-weight: 500;
  font-size: 13px;
}

/* 时间样式 */
.time {
  color: #909399;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 操作按钮样式 - 调整宽度以适应更多按钮 */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.action-buttons .el-button {
  margin: 0;
  font-size: 12px;
  padding: 4px 8px;
  height: auto;
  min-width: auto;
  flex-shrink: 0;
  white-space: nowrap;
}

.action-buttons .el-button + .el-button {
  margin-left: 0;
}

/* 按钮颜色样式 */
.action-buttons .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}

.action-buttons .el-button--warning {
  background-color: #e6a23c;
  border-color: #e6a23c;
}

.action-buttons .el-button--success {
  background-color: #67c23a;
  border-color: #67c23a;
}

.action-buttons .el-button--danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

/* 按钮图标样式 */
.action-buttons .el-button .el-icon {
  margin-right: 2px;
}

/* 标签样式优化 */
.el-tag {
  border-radius: 4px;
  font-size: 12px;
  padding: 2px 6px;
  font-weight: 500;
}

/* 确保表格不出现滚动条 */
:deep(.el-table) {
  overflow: visible;
}

:deep(.el-table__body-wrapper) {
  overflow: visible;
}

:deep(.el-table__header-wrapper) {
  overflow: visible;
}

/* 固定列样式 */
:deep(.el-table__fixed-right) {
  right: 0;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

/* 确保表格自适应 */
:deep(.el-table__body) {
  width: 100% !important;
  table-layout: fixed;
}

:deep(.el-table__header) {
  width: 100% !important;
  table-layout: fixed;
}

/* 空状态样式 */
:deep(.el-table__empty-text) {
  display: none;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-buttons .el-button {
    width: 100%;
    justify-content: center;
    font-size: 11px;
    padding: 3px 6px;
  }
}

@media (max-width: 768px) {
  .action-buttons .el-button {
    font-size: 10px;
    padding: 2px 4px;
  }
}
</style>