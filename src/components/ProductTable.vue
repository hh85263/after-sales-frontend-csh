<!-- src/components/ProductTable.vue -->
<template>
  <el-table :data="products" v-loading="loading" style="width:100%" stripe>
    <template #empty>
      <div style="padding: 20px; color: #909399;">
        <el-icon size="48"><Box /></el-icon>
        <div style="margin-top: 10px;">暂无商品数据</div>
      </div>
    </template>
    
    <el-table-column prop="id" label="ID" width="80" />
    <el-table-column prop="name" label="商品名称" min-width="150" show-overflow-tooltip />
    <el-table-column prop="model" label="型号" width="120" show-overflow-tooltip>
      <template #default="{ row }">
        {{ row.model || '-' }}
      </template>
    </el-table-column>
    <el-table-column prop="price" label="价格" width="120" align="right">
      <template #default="{ row }">
        <span style="color: #f56c6c; font-weight: bold;">
          ¥{{ formatPrice(row.price) }}
        </span>
      </template>
    </el-table-column>
    <el-table-column label="库存" width="100" align="center">
      <template #default="{ row }">
        <el-tag 
          :type="getStockTagType(row.stock)" 
          size="small"
        >
          {{ row.stock !== undefined ? row.stock : '-' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="supplier" label="供应商" width="120" show-overflow-tooltip>
      <template #default="{ row }">
        {{ row.supplier || '-' }}
      </template>
    </el-table-column>
    <el-table-column prop="category" label="分类" width="100" show-overflow-tooltip>
      <template #default="{ row }">
        {{ row.category || '-' }}
      </template>
    </el-table-column>
    <el-table-column prop="warranty" label="保修期" width="100" show-overflow-tooltip>
      <template #default="{ row }">
        {{ row.warranty || '-' }}
      </template>
    </el-table-column>
    <el-table-column label="创建时间" width="180">
      <template #default="{ row }">
        {{ formatDateTime(row.created_at || row.createdAt) }}
      </template>
    </el-table-column>
    <el-table-column label="操作" width="180" fixed="right">
      <template #default="{ row }">
        <el-button 
          size="small" 
          type="primary" 
          @click="handleEdit(row)"
          :icon="Edit"
        >
          编辑
        </el-button>
        <el-button 
          size="small" 
          type="danger" 
          @click="handleDelete(row)"
          :icon="Delete"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { toRefs } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Edit, Delete, Box } from '@element-plus/icons-vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['edit', 'delete'])

const { products, loading } = toRefs(props)

// 格式化价格显示
function formatPrice(price) {
  if (price === null || price === undefined) return '0.00'
  return Number(price).toFixed(2)
}

// 格式化日期时间
function formatDateTime(dateTime) {
  if (!dateTime) return '-'
  try {
    const date = new Date(dateTime)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return '-'
  }
}

// 获取库存标签样式
function getStockTagType(stock) {
  if (stock === undefined || stock === null) return 'info'
  if (stock === 0) return 'danger'
  if (stock <= 10) return 'warning'
  return 'success'
}

// 处理编辑
function handleEdit(row) {
  // 转换数据库字段名为前端字段名
  const editData = {
    ...row,
    serialNumber: row.serial_number || row.serialNumber,
    afterSaleCode: row.after_sale_code || row.afterSaleCode,
    purchasePrice: row.purchase_price || row.purchasePrice,
    salePrice: row.sale_price || row.salePrice,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt
  }
  emits('edit', editData)
}

// 处理删除
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品 "${row.name}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    emits('delete', row.id)
  } catch (e) {
    // 用户取消删除
    if (e === 'cancel') {
      ElMessage.info('已取消删除')
    }
  }
}
</script>

<style scoped>
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  background-color: #f5f7fa;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.el-button + .el-button {
  margin-left: 8px;
}
</style>