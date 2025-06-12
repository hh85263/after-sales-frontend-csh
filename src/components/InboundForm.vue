<!-- src/components/InboundForm.vue -->
<template>
  <el-dialog title="新增入库" :model-value="visible" @close="() => emit('update:visible',false)" width="600px">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="供应商" prop="supplier">
        <el-input v-model="form.supplier" placeholder="请输入供应商名称" />
      </el-form-item>
      <el-form-item label="入库时间" prop="inboundTime">
        <el-date-picker v-model="form.inboundTime" type="datetime" placeholder="选择入库时间" />
      </el-form-item>
      <el-form-item label="操作人" prop="operator">
        <el-input v-model="form.operator" placeholder="请输入操作人" />
      </el-form-item>
      
      <!-- 商品明细 -->
      <el-divider>商品明细</el-divider>
      <div v-for="(item, index) in form.items" :key="index" class="item-row">
        <el-row :gutter="10">
          <el-col :span="6">
            <el-form-item :prop="`items.${index}.productId`" :rules="itemRules.productId" label-width="0">
              <el-select v-model="item.productId" placeholder="选择商品" @change="onProductChange(index)">
                <el-option v-for="product in products" :key="product.id" :label="product.name" :value="product.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :prop="`items.${index}.quantity`" :rules="itemRules.quantity" label-width="0">
              <el-input-number v-model="item.quantity" :min="1" placeholder="数量" @change="calculateAmount(index)" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :prop="`items.${index}.unitPrice`" :rules="itemRules.unitPrice" label-width="0">
              <el-input-number v-model="item.unitPrice" :min="0" :step="0.01" placeholder="单价" @change="calculateAmount(index)" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-input-number v-model="item.amount" :min="0" :step="0.01" placeholder="金额" disabled />
          </el-col>
          <el-col :span="4">
            <el-button type="danger" size="small" @click="removeItem(index)" v-if="form.items.length > 1">删除</el-button>
          </el-col>
        </el-row>
      </div>
      
      <el-row>
        <el-col :span="24">
          <el-button type="primary" plain @click="addItem">添加商品</el-button>
        </el-col>
      </el-row>
      
      <el-divider></el-divider>
      <el-row>
        <el-col :span="12">
          <strong>总金额: ¥{{ totalAmount.toFixed(2) }}</strong>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="() => emit('update:visible',false)">取消</el-button>
      <el-button type="primary" @click="onSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean,
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible','save'])

const formRef = ref()
const form = reactive({
  supplier: '',
  inboundTime: '',
  operator: '',
  items: [
    {
      productId: null,
      quantity: 1,
      unitPrice: 0,
      amount: 0
    }
  ]
})

const rules = {
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  inboundTime: [{ required: true, message: '请选择入库时间', trigger: 'change' }],
  operator: [{ required: true, message: '请输入操作人', trigger: 'blur' }]
}

const itemRules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'change' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'change' }]
}

const totalAmount = computed(() => {
  return form.items.reduce((sum, item) => sum + (item.amount || 0), 0)
})

function addItem() {
  form.items.push({
    productId: null,
    quantity: 1,
    unitPrice: 0,
    amount: 0
  })
}

function removeItem(index) {
  form.items.splice(index, 1)
}

function onProductChange(index) {
  const product = props.products.find(p => p.id === form.items[index].productId)
  if (product) {
    form.items[index].unitPrice = product.price || 0
    calculateAmount(index)
  }
}

function calculateAmount(index) {
  const item = form.items[index]
  item.amount = (item.quantity || 0) * (item.unitPrice || 0)
}

async function onSubmit() {
  try {
    await formRef.value.validate()
    
    // 验证商品明细
    if (form.items.length === 0) {
      ElMessage.warning('请至少添加一个商品')
      return
    }
    
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i]
      if (!item.productId || !item.quantity || !item.unitPrice) {
        ElMessage.warning(`请完善第${i + 1}行商品信息`)
        return
      }
    }
    
    const submitData = {
      ...form,
      totalAmount: totalAmount.value
    }
    
    emit('save', submitData)
    emit('update:visible', false)
    
    // 重置表单
    resetForm()
  } catch {
    ElMessage.warning('请填写完整信息')
  }
}

function resetForm() {
  Object.assign(form, {
    supplier: '',
    inboundTime: '',
    operator: '',
    items: [
      {
        productId: null,
        quantity: 1,
        unitPrice: 0,
        amount: 0
      }
    ]
  })
}
</script>

<style scoped>
.item-row {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.el-divider {
  margin: 20px 0;
}
</style>