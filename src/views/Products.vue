<!-- src/views/Products.vue -->
<template>
  <div class="products-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon"><Shop /></el-icon>
            商品管理
          </h1>
          <p class="page-subtitle">管理您的商品信息，轻松掌控库存动态</p>
        </div>
        <div class="header-actions">
          <el-button 
            type="primary" 
            size="large"
            @click="openForm()"
            class="add-button"
          >
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><Box /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ products.length }}</div>
          <div class="stat-label">商品总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon low-stock">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ lowStockCount }}</div>
          <div class="stat-label">低库存商品</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon value">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">¥{{ totalValue }}</div>
          <div class="stat-label">总价值</div>
        </div>
      </div>
    </div>

    <!-- 表格卡片 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">商品列表</span>
          <div class="header-tools">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索商品名称或型号"
              :prefix-icon="Search"
              clearable
              class="search-input"
              @input="handleSearch"
            />
            <el-button circle :icon="Refresh" @click="refreshData" :loading="loading" />
          </div>
        </div>
      </template>
      
      <product-table
        :products="filteredProducts"
        :loading="loading"
        @edit="openForm"
        @delete="onDelete"
      />
    </el-card>

    <!-- 表单弹窗 -->
    <product-form
      :visible="formVisible"
      :editingProduct="editingProduct"
      @update:visible="formVisible = $event"
      @save="onSave"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useProductStore } from '@/store/product'
import ProductTable from '@/components/ProductTable.vue'
import ProductForm from '@/components/ProductForm.vue'
import { 
  Shop, 
  Plus, 
  Box, 
  Warning, 
  Money, 
  Search, 
  Refresh 
} from '@element-plus/icons-vue'

const store = useProductStore()
const products = computed(() => store.products)
const loading = computed(() => store.loading)

const formVisible = ref(false)
const editingProduct = ref(null)
const searchKeyword = ref('')

// 计算统计数据
const lowStockCount = computed(() => {
  return products.value.filter(p => p.stock !== undefined && p.stock <= 10).length
})

const totalValue = computed(() => {
  const total = products.value.reduce((sum, p) => {
    const price = Number(p.price) || 0
    const stock = Number(p.stock) || 0
    return sum + (price * stock)
  }, 0)
  return total.toFixed(2)
})

// 搜索过滤
const filteredProducts = computed(() => {
  if (!searchKeyword.value.trim()) {
    return products.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return products.value.filter(product => 
    product.name?.toLowerCase().includes(keyword) ||
    product.model?.toLowerCase().includes(keyword)
  )
})

onMounted(() => {
  store.fetchAll()
})

function openForm(product = null) {
  editingProduct.value = product
  formVisible.value = true
}

async function onSave({ isEdit, data }) {
  if (isEdit) {
    await store.update(data.id, data)
  } else {
    await store.add(data)
  }
}

async function onDelete(id) {
  await store.remove(id)
}

function handleSearch() {
  // 搜索逻辑已通过计算属性实现
}

function refreshData() {
  store.fetchAll()
}
</script>

<style scoped>
.products-container {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.header-content::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 36px;
  color: #ffd700;
}

.page-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

.header-actions {
  position: relative;
  z-index: 1;
}

.add-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 50px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border: none;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.add-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6);
}

/* 统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-icon.low-stock {
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
}

.stat-icon.value {
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

/* 表格卡片样式 */
.table-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-bottom: 1px solid #e2e8f0;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.header-tools {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 280px;
}

:deep(.search-input .el-input__wrapper) {
  border-radius: 50px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

:deep(.search-input .el-input__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
}

:deep(.search-input .el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .products-container {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 24px;
    padding: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-tools {
    justify-content: center;
  }
  
  .search-input {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}

/* 全局动画优化 */
* {
  transition: all 0.2s ease;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
}
</style>