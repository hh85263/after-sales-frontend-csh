<template>
  <div class="outbound-container-csh">
    <!-- 水印背景 -->
    <div class="watermark-csh">CSH</div>
    
    <!-- 移除卡片容器，直接使用内容区域 -->
    <div class="main-content-csh">
      <!-- 头部区域 -->
      <div class="header-section-csh">
        <div class="title-wrapper-csh">
          <el-icon class="title-icon-csh" size="24">
            <Box />
          </el-icon>
          <h2 class="page-title-csh">出库记录管理</h2>
          <div class="title-decoration-csh"></div>
        </div>
        <el-button 
          type="primary" 
          size="large"
          class="create-btn-csh"
          @click="openCreateCsh()"
          :icon="Plus"
        >
          <span class="btn-text-csh">新增出库</span>
        </el-button>
      </div>

      <!-- 统计卡片区域 -->
      <div class="stats-section-csh">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-card-csh stat-total-csh">
              <div class="stat-icon-csh">
                <el-icon size="32"><Document /></el-icon>
              </div>
              <div class="stat-content-csh">
                <div class="stat-value-csh">{{ recordsCsh.length }}</div>
                <div class="stat-label-csh">总记录数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card-csh stat-today-csh">
              <div class="stat-icon-csh">
                <el-icon size="32"><Calendar /></el-icon>
              </div>
              <div class="stat-content-csh">
                <div class="stat-value-csh">{{ getTodayCountCsh() }}</div>
                <div class="stat-label-csh">今日出库</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card-csh stat-pending-csh">
              <div class="stat-icon-csh">
                <el-icon size="32"><Clock /></el-icon>
              </div>
              <div class="stat-content-csh">
                <div class="stat-value-csh">{{ getPendingCountCsh() }}</div>
                <div class="stat-label-csh">待处理</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 表格区域 -->
      <div class="table-section-csh">
        <outbound-table
          :records="recordsCsh"
          :loading="loadingCsh"
          :detail-items="detailItemsCsh"
          @view-detail="handleViewDetailCsh"
          @delete="handleDeleteCsh"
          @update="openEditCsh"
          class="enhanced-table-csh"
        />
      </div>
    </div>

    <!-- 表单弹窗 - 移到容器外部，确保全屏显示 -->
    <outbound-form
      :visible="formVisibleCsh"
      :products="productsCsh"
      :record="editingRecordCsh"
      @update:visible="val => formVisibleCsh = val"
      @save="onSaveCsh"
      class="enhanced-form-csh"
    />

    <!-- 详情弹窗 - 新增独立的详情弹窗 -->
    <el-dialog
      v-model="detailVisibleCsh"
      title="出库明细"
      width="80%"
      class="detail-dialog-csh"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="detail-content-csh">
        <div class="detail-header-csh">
          <h3>出库明细信息</h3>
          <div class="detail-summary-csh">
            <span>共 {{ detailItemsCsh.length }} 项商品</span>
          </div>
        </div>
        
        <el-table 
          :data="detailItemsCsh" 
          class="detail-table-csh"
          stripe
          border
          max-height="500"
        >
          <el-table-column prop="productName" label="商品名称" min-width="200">
            <template #default="{ row }">
              <div class="product-info-csh">
                <div class="product-name-csh">{{ row.productName }}</div>
                <div class="product-code-csh">编码: {{ row.productCode }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="120" align="center">
            <template #default="{ row }">
              <el-tag type="primary" size="large">{{ row.quantity }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="unitPrice" label="单价" width="120" align="right">
            <template #default="{ row }">
              <span class="price-csh">¥{{ row.unitPrice.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalPrice" label="小计" width="120" align="right">
            <template #default="{ row }">
              <span class="total-price-csh">¥{{ row.totalPrice.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150">
            <template #default="{ row }">
              <span class="remark-csh">{{ row.remark || '-' }}</span>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="detail-footer-csh">
          <div class="total-info-csh">
            <div class="total-item-csh">
              <span class="label-csh">总数量:</span>
              <span class="value-csh">{{ getTotalQuantityCsh() }}</span>
            </div>
            <div class="total-item-csh">
              <span class="label-csh">总金额:</span>
              <span class="value-highlight-csh">¥{{ getTotalAmountCsh() }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailVisibleCsh = false" size="large">关闭</el-button>
        <el-button type="primary" @click="exportDetailCsh" size="large">
          <el-icon><Download /></el-icon>
          导出明细
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, Box, Document, Calendar, Clock, Download } from '@element-plus/icons-vue'
import { useOutboundStore } from '@/store/outbound'
import { useProductStore }  from '@/store/product'
import OutboundTable  from '@/components/OutboundTable.vue'
import OutboundForm   from '@/components/OutboundForm.vue'

const outboundStoreCsh = useOutboundStore()
const productStoreCsh  = useProductStore()

const recordsCsh      = outboundStoreCsh.records
const loadingCsh      = outboundStoreCsh.loading
const productsCsh     = productStoreCsh.products

const detailItemsCsh     = ref([])
const formVisibleCsh     = ref(false)
const detailVisibleCsh   = ref(false)
const editingRecordCsh   = ref(null)

// 计算今日出库数量
const getTodayCountCsh = () => {
  const todayCsh = new Date().toDateString()
  return recordsCsh.value?.filter(recordCsh => 
    new Date(recordCsh.createTime).toDateString() === todayCsh
  ).length || 0
}

// 计算待处理数量
const getPendingCountCsh = () => {
  return recordsCsh.value?.filter(recordCsh => 
    recordCsh.status === 'pending'
  ).length || 0
}

// 计算明细总数量
const getTotalQuantityCsh = () => {
  return detailItemsCsh.value.reduce((sum, item) => sum + item.quantity, 0)
}

// 计算明细总金额
const getTotalAmountCsh = () => {
  const total = detailItemsCsh.value.reduce((sum, item) => sum + item.totalPrice, 0)
  return total.toFixed(2)
}

onMounted(async () => {
  try {
    await Promise.all([
      outboundStoreCsh.fetchAll(),
      productStoreCsh.fetchAll()
    ])
  } catch (errorCsh) {
    ElMessage.error('数据加载失败')
    console.error('初始化数据失败:', errorCsh)
  }
})

function openCreateCsh() {
  editingRecordCsh.value = null
  formVisibleCsh.value = true
}

function openEditCsh(recordCsh) {
  editingRecordCsh.value = recordCsh
  formVisibleCsh.value = true
}

async function onSaveCsh(payloadCsh) {
  try {
    if (editingRecordCsh.value) {
      await outboundStoreCsh.update(editingRecordCsh.value.id, payloadCsh)
      ElMessage.success('出库记录更新成功')
    } else {
      await outboundStoreCsh.add(payloadCsh)
      ElMessage.success('出库记录添加成功')
    }
    formVisibleCsh.value = false
    editingRecordCsh.value = null
  } catch (errorCsh) {
    ElMessage.error(editingRecordCsh.value ? '更新失败' : '添加失败')
    console.error('保存出库记录失败:', errorCsh)
  }
}

async function handleViewDetailCsh(idCsh) {
  try {
    const dtoCsh = await outboundStoreCsh.fetchDetail(idCsh)
    detailItemsCsh.value = dtoCsh.items || []
    detailVisibleCsh.value = true
  } catch (errorCsh) {
    ElMessage.error('获取出库明细失败')
    console.error('获取出库明细失败:', errorCsh)
  }
}

async function handleDeleteCsh(idCsh) {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条出库记录吗？此操作不可恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await outboundStoreCsh.remove(idCsh)
    ElMessage.success('删除成功')
  } catch (errorCsh) {
    if (errorCsh !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除出库记录失败:', errorCsh)
    }
  }
}

function exportDetailCsh() {
  // 导出明细功能实现
  ElMessage.success('明细导出功能开发中...')
}
</script>

<style scoped>
/* 主容器样式 */
.outbound-container-csh {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* 水印样式 */
.watermark-csh {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 120px;
  color: rgba(255, 255, 255, 0.05);
  font-weight: bold;
  z-index: 1;
  pointer-events: none;
  user-select: none;
}

/* 主内容区域样式 - 移除卡片容器 */
.main-content-csh {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 头部区域样式 */
.header-section-csh {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
}

.title-wrapper-csh {
  display: flex;
  align-items: center;
  position: relative;
}

.title-icon-csh {
  color: #667eea;
  margin-right: 12px;
}

.page-title-csh {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-decoration-csh {
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 2px;
}

.create-btn-csh {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.create-btn-csh:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-text-csh {
  margin-left: 8px;
}

/* 统计卡片区域 */
.stats-section-csh {
  margin-bottom: 24px;
}

.stat-card-csh {
  display: flex;
  align-items: center;
  padding: 24px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
  height: 100px;
}

.stat-card-csh:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-total-csh {
  border-left-color: #67c23a;
}

.stat-today-csh {
  border-left-color: #e6a23c;
}

.stat-pending-csh {
  border-left-color: #f56c6c;
}

.stat-icon-csh {
  margin-right: 20px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.1);
}

.stat-total-csh .stat-icon-csh {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.stat-today-csh .stat-icon-csh {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.stat-pending-csh .stat-icon-csh {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.stat-content-csh {
  flex: 1;
}

.stat-value-csh {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label-csh {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

/* 表格区域样式 */
.table-section-csh {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.enhanced-table-csh {
  border-radius: 8px;
  overflow: hidden;
}

/* 详情弹窗样式 */
.detail-dialog-csh :deep(.el-dialog) {
  border-radius: 16px;
  max-height: 90vh;
  overflow: hidden;
}

.detail-dialog-csh :deep(.el-dialog__header) {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
}

.detail-dialog-csh :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.detail-dialog-csh :deep(.el-dialog__body) {
  padding: 0;
  max-height: calc(90vh - 160px);
  overflow-y: auto;
}

.detail-content-csh {
  padding: 20px;
}

.detail-header-csh {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;
}

.detail-header-csh h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.detail-summary-csh {
  color: #606266;
  font-size: 14px;
}

.detail-table-csh {
  margin-bottom: 20px;
}

.product-info-csh .product-name-csh {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.product-info-csh .product-code-csh {
  font-size: 12px;
  color: #909399;
}

.price-csh {
  color: #67c23a;
  font-weight: 600;
}

.total-price-csh {
  color: #e6a23c;
  font-weight: 700;
  font-size: 16px;
}

.remark-csh {
  color: #606266;
  font-style: italic;
}

.detail-footer-csh {
  background: #fafafa;
  padding: 16px 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.total-info-csh {
  display: flex;
  justify-content: flex-end;
  gap: 40px;
}

.total-item-csh {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total-item-csh .label-csh {
  color: #606266;
  font-weight: 500;
}

.total-item-csh .value-csh {
  color: #2c3e50;
  font-weight: 600;
  font-size: 16px;
}

.total-item-csh .value-highlight-csh {
  color: #e6a23c;
  font-weight: 700;
  font-size: 18px;
}

/* 表单样式增强 */
.enhanced-form-csh :deep(.el-dialog) {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.enhanced-form-csh :deep(.el-dialog__header) {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 16px 16px 0 0;
}

.enhanced-form-csh :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .outbound-container-csh {
    padding: 10px;
  }
  
  .main-content-csh {
    padding: 16px;
  }
  
  .header-section-csh {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .page-title-csh {
    font-size: 24px;
  }
  
  .watermark-csh {
    font-size: 80px;
  }
  
  .stat-card-csh {
    margin-bottom: 12px;
    height: auto;
    padding: 20px;
  }
  
  .stat-value-csh {
    font-size: 24px;
  }
  
  .detail-dialog-csh {
    width: 95% !important;
  }
  
  .total-info-csh {
    flex-direction: column;
    gap: 12px;
    align-items: flex-end;
  }
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

.main-content-csh {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card-csh:nth-child(1) {
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.stat-card-csh:nth-child(2) {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.stat-card-csh:nth-child(3) {
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

.table-section-csh {
  animation: fadeInUp 0.6s ease-out 0.4s both;
}
</style>