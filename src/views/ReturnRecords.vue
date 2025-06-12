<!-- src/views/ReturnRecordsCsh.vue -->
<template>
  <div class="return-records-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon><Document /></el-icon>
          退货记录管理
        </h1>
        <p class="page-subtitle">管理和查看所有退货记录信息</p>
      </div>
      
      <div class="header-right">
        <!-- 只有管理员和售后人员可以新增退货 -->
        <el-button 
          v-if="canCreateReturnCsh"
          type="primary" 
          @click="handleAddCsh"
          :icon="Plus"
          size="large"
          class="add-btn"
        >
          新增退货
        </el-button>
      </div>
    </div>
    
    <!-- 权限提示 -->
    <el-alert
      v-if="!hasViewPermissionCsh"
      title="权限不足"
      type="warning"
      description="您没有查看退货记录的权限，请联系管理员获取相应权限。"
      show-icon
      :closable="false"
      class="permission-alert"
    />
    
    <!-- 表格区域 -->
    <div v-if="hasViewPermissionCsh" class="table-section">
      <return-table 
        :records="recordsCsh" 
        :loading="loadingCsh" 
        @view="handleViewCsh"
        @edit="handleEditCsh"
        @delete="handleDeleteCsh"
        @confirm="handleConfirmCsh"
        @refresh="handleRefreshCsh"
      />
    </div>
    
    <!-- 新增/编辑表单 -->
    <return-form
      :visible="formVisibleCsh"
      :edit-data="editDataCsh"
      @update:visible="formVisibleCsh = $event"
      @save="handleSaveCsh"
    />
    
    <!-- 优化后的查看详情对话框 -->
    <el-dialog
      v-model="viewVisibleCsh"
      title="退货详情信息"
      width="1200px"
      :close-on-click-modal="false"
      class="detail-dialog"
      top="3vh"
      :before-close="handleCloseDialogCsh"
    >
      <div v-if="viewDataCsh" class="detail-content">
        <!-- 状态标题区域 -->
        <div class="status-section">
          <div class="status-left">
            <div class="return-code">
              {{ viewDataCsh.code || `RT${String(viewDataCsh.id).padStart(6, '0')}` }}
            </div>
            <div class="status-tags">
              <el-tag 
                size="large" 
                :type="getStatusTagTypeCsh(viewDataCsh.status)" 
                class="status-tag"
              >
                {{ getStatusTextCsh(viewDataCsh.status) }}
              </el-tag>
              <el-tag 
                :type="getReturnTypeTagTypeCsh(viewDataCsh.returnType || viewDataCsh.return_type)" 
                size="large"
                class="type-tag"
              >
                {{ getReturnTypeTextCsh(viewDataCsh.returnType || viewDataCsh.return_type) }}
              </el-tag>
            </div>
          </div>
          
          <div class="status-right">
            <div class="amount-display">
              <span class="amount-label">退货金额</span>
              <span class="amount-value">
                {{ viewDataCsh.amount ? `¥${formatPriceCsh(viewDataCsh.amount)}` : '未填写' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 详细信息网格 -->
        <div class="info-grid">
          <div class="info-card">
            <div class="info-header">
              <el-icon class="info-icon"><Goods /></el-icon>
              <span class="info-title">基本信息</span>
            </div>
            <div class="info-body">
              <div class="info-row">
                <div class="info-item">
                  <label>入库单ID</label>
                  <div class="info-value record-id">
                    {{ viewDataCsh.inboundRecordId || viewDataCsh.inbound_record_id || '-' }}
                  </div>
                </div>
                <div class="info-item">
                  <label>出库单ID</label>
                  <div class="info-value record-id">
                    {{ viewDataCsh.outboundRecordId || viewDataCsh.outbound_record_id || '-' }}
                  </div>
                </div>
              </div>
              <div class="info-row">
                <div class="info-item">
                  <label>退货数量</label>
                  <div class="info-value quantity">
                    {{ viewDataCsh.quantity || 0 }} 件
                  </div>
                </div>
                <div class="info-item">
                  <label>操作人员</label>
                  <div class="info-value operator">
                    {{ viewDataCsh.operator || '-' }}
                  </div>
                </div>
              </div>
              <div class="info-row">
                <div class="info-item full-width">
                  <label>退货时间</label>
                  <div class="info-value datetime">
                    {{ formatDateTimeCsh(viewDataCsh.returnTime || viewDataCsh.return_time) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-header">
              <el-icon class="info-icon"><ChatDotSquare /></el-icon>
              <span class="info-title">退货原因</span>
            </div>
            <div class="info-body">
              <div class="reason-content">
                {{ viewDataCsh.reason || '暂无退货原因说明' }}
              </div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-header">
              <el-icon class="info-icon"><Edit /></el-icon>
              <span class="info-title">备注信息</span>
            </div>
            <div class="info-body">
              <div class="remark-content">
                {{ viewDataCsh.remark || '暂无备注信息' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewVisibleCsh = false" size="large" type="primary">
            <el-icon><Close /></el-icon>
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { Plus, Document, Close, Goods, ChatDotSquare, Edit } from '@element-plus/icons-vue'
import { useReturnStore } from '@/store/return'
import { useAuthStore } from '@/store/auth'
import ReturnTable from '@/components/ReturnTable.vue'
import ReturnForm from '@/components/ReturnForm.vue'

const storeCsh = useReturnStore()
const authStoreCsh = useAuthStore()

// 使用 storeToRefs 保持响应式
const { listPaged: recordsCsh, loading: loadingCsh } = storeToRefs(storeCsh)

const formVisibleCsh = ref(false)
const viewVisibleCsh = ref(false)
const editDataCsh = ref(null)
const viewDataCsh = ref(null)

// 权限计算属性
const hasViewPermissionCsh = computed(() => {
  // 管理员可以查看所有记录
  return authStoreCsh.isAdmin || authStoreCsh.isAfterSalesStaff
})

const canCreateReturnCsh = computed(() => {
  // 管理员和售后人员可以创建退货记录
  return authStoreCsh.isAdmin || authStoreCsh.isAfterSalesStaff
})

onMounted(() => {
  if (hasViewPermissionCsh.value) {
    handleRefreshCsh()
  }
})

// 新增退货
function handleAddCsh() {
  if (!canCreateReturnCsh.value) {
    ElMessage.warning('您没有权限新增退货记录')
    return
  }
  editDataCsh.value = null
  formVisibleCsh.value = true
}

// 查看详情
function handleViewCsh(rowCsh) {
  viewDataCsh.value = rowCsh
  viewVisibleCsh.value = true
}

// 编辑退货
function handleEditCsh(rowCsh) {
  // 权限检查在 ReturnTable 组件中已经处理
  editDataCsh.value = rowCsh
  formVisibleCsh.value = true
}

// 删除退货
async function handleDeleteCsh(rowCsh) {
  try {
    // 权限检查在 ReturnTable 组件中已经处理
    await storeCsh.delete(rowCsh.id)
  } catch (errorCsh) {
    console.error('删除失败:', errorCsh)
  }
}

// 确认退货
async function handleConfirmCsh(rowCsh) {
  try {
    // 权限检查在 ReturnTable 组件中已经处理
    await storeCsh.confirm(rowCsh.id)
  } catch (errorCsh) {
    console.error('确认失败:', errorCsh)
  }
}

// 刷新列表
async function handleRefreshCsh() {
  if (!hasViewPermissionCsh.value) {
    ElMessage.warning('您没有权限查看退货记录')
    return
  }
  
  try {
    await storeCsh.fetchAll()
  } catch (errorCsh) {
    console.error('刷新失败:', errorCsh)
  }
}

// 保存表单
async function handleSaveCsh(dataCsh) {
  try {
    if (dataCsh.id) {
      // 编辑模式 - 检查权限
      if (!authStoreCsh.isAdmin && dataCsh.operator !== authStoreCsh.username) {
        ElMessage.warning('您只能编辑自己创建的退货记录')
        return
      }
      await storeCsh.update(dataCsh.id, dataCsh)
    } else {
      // 新增模式 - 检查权限
      if (!canCreateReturnCsh.value) {
        ElMessage.warning('您没有权限新增退货记录')
        return
      }
      await storeCsh.add(dataCsh)
    }
    formVisibleCsh.value = false
  } catch (errorCsh) {
    console.error('保存失败:', errorCsh)
  }
}

// 关闭对话框
function handleCloseDialogCsh() {
  viewVisibleCsh.value = false
}

// 格式化价格
function formatPriceCsh(priceCsh) {
  if (!priceCsh) return '0.00'
  return Number(priceCsh).toFixed(2)
}

// 格式化日期时间
function formatDateTimeCsh(dateTimeCsh) {
  if (!dateTimeCsh) return '暂无时间记录'
  const dateCsh = new Date(dateTimeCsh)
  if (isNaN(dateCsh.getTime())) return '时间格式错误'
  
  return dateCsh.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取退货类型文本
function getReturnTypeTextCsh(typeCsh) {
  const typeMapCsh = {
    'RETURN': '退货',
    'EXCHANGE': '换货',
    'WARRANTY_RETURN': '质保期退换'
  }
  return typeMapCsh[typeCsh] || typeCsh || '未知类型'
}

// 获取退货类型标签类型
function getReturnTypeTagTypeCsh(typeCsh) {
  const tagTypeMapCsh = {
    'RETURN': 'danger',
    'EXCHANGE': 'warning',
    'WARRANTY_RETURN': 'success'
  }
  return tagTypeMapCsh[typeCsh] || 'info'
}

// 获取状态文本
function getStatusTextCsh(statusCsh) {
  const statusMapCsh = {
    'PENDING': '待处理',
    'CONFIRMED': '已确认',
    'APPROVED': '已批准',
    'REJECTED': '已拒绝',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMapCsh[statusCsh] || statusCsh || '未知状态'
}

// 获取状态标签类型
function getStatusTagTypeCsh(statusCsh) {
  const tagTypeMapCsh = {
    'PENDING': 'warning',
    'CONFIRMED': 'primary',
    'APPROVED': 'success',
    'REJECTED': 'danger',
    'COMPLETED': 'success',
    'CANCELLED': 'info'
  }
  return tagTypeMapCsh[statusCsh] || 'info'
}
</script>

<style scoped>
.return-records-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-weight: 700;
  font-size: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title .el-icon {
  color: #409eff;
  font-size: 32px;
}

.page-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.add-btn {
  background: linear-gradient(135deg, #409eff 0%, #5478f4 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

/* 权限提示 */
.permission-alert {
  border-radius: 8px;
  margin-bottom: 20px;
}

/* 表格区域 */
.table-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 详情对话框 */
.detail-dialog :deep(.el-dialog) {
  border-radius: 12px;
  background: white;
  max-height: 90vh;
  overflow: hidden;
}

.detail-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #409eff 0%, #5478f4 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 20px 24px;
  margin: 0;
}

.detail-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 0;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

.detail-content {
  padding: 24px;
}

/* 状态区域 */
.status-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #dee2e6;
}

.status-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.return-code {
  font-size: 28px;
  font-weight: 800;
  color: #2c3e50;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.status-tags {
  display: flex;
  gap: 12px;
  align-items: center;
}

.status-tag,
.type-tag {
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
}

.status-right {
  text-align: right;
}

.amount-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.amount-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.amount-value {
  font-size: 24px;
  font-weight: 700;
  color: #dc3545;
  font-family: 'Courier New', monospace;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.info-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 16px 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  color: #409eff;
  font-size: 18px;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.info-body {
  padding: 20px;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 14px;
  font-weight: 600;
  color: #6c757d;
}

.info-value {
  font-size: 15px;
  color: #2c3e50;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  font-weight: 500;
}

.info-value.record-id {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #409eff;
}

.info-value.quantity {
  color: #fd7e14;
  font-weight: 600;
}

.info-value.operator {
  color: #198754;
  font-weight: 600;
}

.info-value.datetime {
  font-family: 'Courier New', monospace;
  color: #6c757d;
  font-weight: 500;
}

.reason-content,
.remark-content {
  min-height: 80px;
  line-height: 1.6;
  color: #495057;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.dialog-footer {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .detail-dialog :deep(.el-dialog) {
    width: 95% !important;
  }
}

@media (max-width: 768px) {
  .return-records-container {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .status-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .status-right {
    align-self: flex-start;
    text-align: left;
  }
  
  .info-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .return-code {
    font-size: 24px;
  }
  
  .amount-value {
    font-size: 20px;
  }
}

/* 滚动条美化 */
.detail-dialog :deep(.el-dialog__body)::-webkit-scrollbar {
  width: 8px;
}

.detail-dialog :deep(.el-dialog__body)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.detail-dialog :deep(.el-dialog__body)::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.detail-dialog :deep(.el-dialog__body)::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header,
.table-section {
  animation: fadeInUp 0.6s ease-out;
}

.table-section {
  animation-delay: 0.1s;
}
</style>