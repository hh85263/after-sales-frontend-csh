<!-- src/views/InboundRecords.vue -->
<template>
  <div class="inbound-records-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="title-icon"><Box /></el-icon>
          <h1 class="page-title">入库记录管理</h1>
          <span class="page-subtitle">管理所有的商品入库记录</span>
        </div>
        <el-button 
          type="primary" 
          size="large"
          class="add-button"
          @click="openForm"
        >
          <el-icon><Plus /></el-icon>
          新增入库
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Search /></el-icon>
          <span>搜索筛选</span>
        </div>
      </template>
      
      <el-form :model="searchForm" class="search-form">
        <el-row :gutter="24">
          <el-col :xl="6" :lg="8" :md="12" :sm="24">
            <el-form-item label="供应商名称">
              <el-input 
                v-model="searchForm.supplier" 
                placeholder="请输入供应商名称" 
                clearable
                prefix-icon="Shop"
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          
          <el-col :xl="8" :lg="10" :md="12" :sm="24">
            <el-form-item label="入库日期">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleSearch"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :xl="6" :lg="6" :md="12" :sm="24">
            <el-form-item class="search-buttons">
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearch">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 数据统计卡片 -->
    <div class="stats-row">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card class="stat-card stat-total">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><DocumentCopy /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ total }}</div>
                <div class="stat-label">总记录数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card stat-today">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ todayCount }}</div>
                <div class="stat-label">今日入库</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card stat-month">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ monthCount }}</div>
                <div class="stat-label">本月入库</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card stat-value">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">¥{{ totalValue }}</div>
                <div class="stat-label">总入库金额</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-card class="main-card" shadow="never">
      <!-- 表格工具栏 -->
      <template #header>
        <div class="table-header">
          <div class="table-title">
            <el-icon><List /></el-icon>
            <span>入库记录列表</span>
          </div>
          <div class="table-actions">
            <el-tooltip content="刷新数据">
              <el-button 
                circle 
                @click="loadData"
                :loading="loading"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>

      <!-- 表格组件 -->
      <div class="table-container">
        <inbound-table 
          v-if="!componentError && storeInitialized"
          :records="tableRecords" 
          :loading="loading"
          :detail-items="detailItems"
          @view-detail="handleViewDetail"
          @delete="handleDelete"
          class="enhanced-table"
        />
        
        <!-- 加载状态 -->
        <div v-if="!storeInitialized" class="loading-container">
          <el-skeleton :rows="8" animated />
        </div>
        
        <!-- 错误提示 -->
        <el-empty
          v-if="componentError"
          description="组件加载出错"
          :image-size="120"
        >
          <template #image>
            <el-icon size="120" color="#909399"><Warning /></el-icon>
          </template>
          <el-alert
            :title="componentError"
            type="error"
            show-icon
            :closable="false"
          />
        </el-empty>
        
        <!-- 空数据状态 -->
        <el-empty
          v-if="!loading && !componentError && storeInitialized && tableRecords.length === 0"
          description="暂无入库记录"
          :image-size="160"
        >
          <el-button type="primary" @click="openForm">
            <el-icon><Plus /></el-icon>
            添加第一条入库记录
          </el-button>
        </el-empty>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 新增表单 -->
    <inbound-form
      v-if="formVisible"
      v-model:visible="formVisible"
      :products="products"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed, nextTick, onErrorCaptured, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  Box, Plus, Search, Refresh, DocumentCopy, Calendar, 
  TrendCharts, Money, List, Warning, Shop 
} from '@element-plus/icons-vue'
import { useInboundStore } from '@/store/inbound'
import { useProductStore } from '@/store/product'
import InboundTable from '@/components/InboundTable.vue'
import InboundForm from '@/components/InboundForm.vue'

// 初始化状态
const storeInitialized = ref(false)
const componentError = ref('')
const formVisible = ref(false)
const detailItems = ref([])
const products = ref([])

// 尝试初始化 store
let store = null
let productStore = null

try {
  if (typeof useInboundStore === 'function') {
    store = useInboundStore()
    storeInitialized.value = true
  } else {
    componentError.value = 'useInboundStore 不是一个函数'
  }
} catch (error) {
  console.error('初始化 inbound store 失败:', error)
  componentError.value = `Store 初始化失败: ${error.message}`
}

try {
  if (typeof useProductStore === 'function') {
    productStore = useProductStore()
  } else {
    console.warn('useProductStore 不是一个函数')
  }
} catch (error) {
  console.error('初始化 product store 失败:', error)
}

// 搜索表单
const searchForm = reactive({
  supplier: '',
  dateRange: null
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 安全获取 store 数据的计算属性
const records = computed(() => {
  try {
    return store?.records || []
  } catch (error) {
    console.error('获取 records 时出错:', error)
    return []
  }
})

const loading = computed(() => {
  try {
    return store?.loading || false
  } catch (error) {
    console.error('获取 loading 时出错:', error)
    return false
  }
})

const total = computed(() => {
  try {
    return store?.total || 0
  } catch (error) {
    console.error('获取 total 时出错:', error)
    return 0
  }
})

// 安全的表格数据
const tableRecords = computed(() => {
  try {
    if (!records.value) return []
    if (!Array.isArray(records.value)) return []
    return records.value
  } catch (error) {
    console.error('处理表格数据时出错:', error)
    return []
  }
})

// 统计数据计算 - 修复日期处理逻辑
const todayCount = computed(() => {
  try {
    const today = new Date().toISOString().split('T')[0]
    return tableRecords.value.filter(record => {
      // 同时检查 createdAt 和 inboundTime 字段
      const createdDate = record.createdAt ? record.createdAt.split('T')[0] : ''
      const inboundDate = record.inboundTime ? record.inboundTime.split('T')[0] : ''
      return createdDate === today || inboundDate === today
    }).length
  } catch (error) {
    console.error('计算今日入库数量时出错:', error)
    return 0
  }
})

const monthCount = computed(() => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return tableRecords.value.filter(record => {
      // 同时检查 createdAt 和 inboundTime 字段
      const createdMonth = record.createdAt ? record.createdAt.slice(0, 7) : ''
      const inboundMonth = record.inboundTime ? record.inboundTime.slice(0, 7) : ''
      return createdMonth === currentMonth || inboundMonth === currentMonth
    }).length
  } catch (error) {
    console.error('计算本月入库数量时出错:', error)
    return 0
  }
})

const totalValue = computed(() => {
  try {
    const sum = tableRecords.value.reduce((sum, record) => {
      const amount = parseFloat(record.totalAmount) || 0
      return sum + amount
    }, 0)
    return sum.toLocaleString()
  } catch (error) {
    console.error('计算总金额时出错:', error)
    return '0'
  }
})

// 错误捕获
onErrorCaptured((error, instance, info) => {
  console.error('组件错误:', error, info)
  componentError.value = `${error.message} (${info})`
  return false
})

// 监听 store 状态变化，确保数据同步
watch(() => total.value, (newTotal) => {
  pagination.total = newTotal
})

onMounted(async () => {
  try {
    if (!storeInitialized.value) {
      throw new Error('Store 未正确初始化')
    }
    
    await loadData()
    await loadProducts()
  } catch (error) {
    console.error('页面初始化失败:', error)
    ElMessage.error('页面初始化失败: ' + error.message)
    componentError.value = '页面初始化失败: ' + error.message
  }
})

// 加载数据 - 修复搜索参数处理
async function loadData() {
  if (!store || !storeInitialized.value) {
    console.error('Store 未初始化，无法加载数据')
    return
  }

  try {
    // 构建查询参数，确保参数格式正确
    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize
    }
    
    // 只有当搜索条件不为空时才添加到参数中
    if (searchForm.supplier && searchForm.supplier.trim()) {
      params.supplier = searchForm.supplier.trim()
    }
    
    if (searchForm.dateRange && Array.isArray(searchForm.dateRange) && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    
    console.log('InboundRecords - 开始加载数据，参数:', params)
    await store.fetchAll(params)
    
    // 等待下一个tick确保数据更新
    await nextTick()
    
    pagination.total = total.value
    console.log('InboundRecords - 数据加载完成，records:', records.value)
    
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败: ' + error.message)
  }
}

// 加载产品列表
async function loadProducts() {
  if (!productStore) {
    console.warn('Product store 未初始化，跳过产品加载')
    return
  }

  try {
    await productStore.fetchAll()
    products.value = productStore.products || []
  } catch (error) {
    console.error('加载产品列表失败:', error)
    ElMessage.error('加载产品列表失败: ' + error.message)
  }
}

// 打开新增表单
function openForm() {
  formVisible.value = true
}

// 保存
async function handleSave(data) {
  if (!store || !storeInitialized.value) {
    ElMessage.error('Store 未初始化')
    return
  }

  try {
    await store.add(data)
    await loadData()
    ElMessage.success('新增入库成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败: ' + error.message)
  }
}

// 查看明细
async function handleViewDetail(id) {
  if (!store || !storeInitialized.value) {
    ElMessage.error('Store 未初始化')
    return
  }

  try {
    const detail = await store.fetchDetail(id)
    detailItems.value = detail.items || []
  } catch (error) {
    console.error('获取明细失败:', error)
    ElMessage.error('获取明细失败: ' + error.message)
  }
}

// 删除
async function handleDelete(id) {
  if (!store || !storeInitialized.value) {
    ElMessage.error('Store 未初始化')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除这条入库记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await store.delete(id)
    await loadData()
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// 搜索 - 优化搜索逻辑
function handleSearch() {
  try {
    pagination.currentPage = 1
    loadData()
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败: ' + error.message)
  }
}

// 重置搜索 - 确保完全重置
function resetSearch() {
  try {
    // 重置搜索表单
    searchForm.supplier = ''
    searchForm.dateRange = null
    
    // 重置分页
    pagination.currentPage = 1
    
    // 重新加载数据
    loadData()
  } catch (error) {
    console.error('重置搜索失败:', error)
    ElMessage.error('重置搜索失败: ' + error.message)
  }
}

// 分页大小改变
function handleSizeChange(size) {
  try {
    pagination.pageSize = size
    pagination.currentPage = 1
    loadData()
  } catch (error) {
    console.error('改变页面大小失败:', error)
    ElMessage.error('改变页面大小失败: ' + error.message)
  }
}

// 当前页改变
function handleCurrentChange(page) {
  try {
    pagination.currentPage = page
    loadData()
  } catch (error) {
    console.error('改变页码失败:', error)
    ElMessage.error('改变页码失败: ' + error.message)
  }
}
</script>

<style scoped>
.inbound-records-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  font-size: 32px;
  color: rgba(255, 255, 255, 0.9);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 16px;
  opacity: 0.8;
  margin-left: 8px;
}

.add-button {
  height: 48px;
  padding: 0 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.add-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 搜索卡片样式 */
.search-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.search-card :deep(.el-card__header) {
  background: #fafbfc;
  border-bottom: 1px solid #f0f2f5;
  border-radius: 12px 12px 0 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.search-form {
  padding: 8px 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.search-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.search-buttons :deep(.el-form-item__content) {
  gap: 12px;
}

/* 统计卡片样式 */
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  border: none;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-card :deep(.el-card__body) {
  padding: 0;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 24px;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* 不同统计卡片的颜色主题 */
.stat-total .stat-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-total .stat-number {
  color: #667eea;
}

.stat-today .stat-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-today .stat-number {
  color: #f5576c;
}

.stat-month .stat-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-month .stat-number {
  color: #4facfe;
}

.stat-value .stat-icon {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.stat-value .stat-number {
  color: #43e97b;
}

/* 主要内容卡片 */
.main-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.main-card :deep(.el-card__header) {
  background: #fafbfc;
  border-bottom: 1px solid #f0f2f5;
  padding: 20px 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.table-actions {
  display: flex;
  gap: 8px;
}

/* 表格容器 */
.table-container {
  min-height: 400px;
}

.enhanced-table {
  border-radius: 8px;
  overflow: hidden;
}

/* 加载状态 */
.loading-container {
  padding: 40px 24px;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 24px 0 16px;
  border-top: 1px solid #f0f2f5;
  margin-top: 24px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .title-section {
    flex-direction: column;
    gap: 8px;
  }
  
  .page-subtitle {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .inbound-records-container {
    padding: 12px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .search-buttons {
    justify-content: center;
  }
  
  .search-buttons :deep(.el-form-item__content) {
    flex-direction: column;
    width: 100%;
  }
  
  .stat-content {
    padding: 16px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}

/* 动画效果 */
.stat-card,
.search-card,
.main-card {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Element Plus 组件覆盖样式 */
:deep(.el-form-item__label) {
  font-weight: 600;
  color: #333;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #667eea;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
  transform: translateY(-1px);
}

:deep(.el-pagination) {
  font-weight: 500;
}

:deep(.el-pagination .btn-next),
:deep(.el-pagination .btn-prev) {
  border-radius: 8px;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 8px;
  margin: 0 2px;
}

:deep(.el-empty) {
  padding: 60px 20px;
}
</style>