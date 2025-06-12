<template>
  <el-dialog
    :title="record ? '编辑出库' : '新增出库'"
    :model-value="visible"
    @close="() => emit('update:visible', false)"
    width="800px"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户" prop="customer">
            <el-input v-model="form.customer" placeholder="请输入客户名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目" prop="project">
            <el-input v-model="form.project" placeholder="请输入项目名称（可选）" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="出库时间" prop="outboundTime">
            <el-date-picker
              v-model="form.outboundTime"
              type="datetime"
              placeholder="选择出库时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作人" prop="operator">
            <el-input v-model="form.operator" placeholder="请输入操作人" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider>商品明细</el-divider>
      <div class="items-header">
        <el-row :gutter="10">
          <el-col :span="6"><strong>商品</strong></el-col>
          <el-col :span="4"><strong>数量</strong></el-col>
          <el-col :span="4"><strong>单价</strong></el-col>
          <el-col :span="4"><strong>金额</strong></el-col>
          <el-col :span="4"><strong>操作</strong></el-col>
        </el-row>
      </div>
      
      <div v-for="(item, index) in form.items" :key="index" class="item-row">
        <el-row :gutter="10">
          <el-col :span="6">
            <el-form-item :prop="`items.${index}.productId`" :rules="itemRules.productId">
              <el-select
                v-model="item.productId"
                placeholder="选择商品"
                @change="onProductChange(index)"
                style="width:100%"
              >
                <el-option
                  v-for="product in availableProducts"
                  :key="product.id"
                  :label="`${product.name} (库存:${product.stock})`"
                  :value="product.id"
                  :disabled="product.stock <= 0"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :prop="`items.${index}.quantity`" :rules="itemRules.quantity">
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="getMaxQuantity(item.productId)"
                @change="calculateAmount(index)"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :prop="`items.${index}.unitPrice`" :rules="itemRules.unitPrice">
              <el-input-number
                v-model="item.unitPrice"
                :min="0"
                :step="0.01"
                @change="calculateAmount(index)"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-input-number
              v-model="item.amount"
              :min="0"
              :step="0.01"
              disabled
              style="width:100%"
            />
          </el-col>
          <el-col :span="4">
            <el-button
              type="danger"
              size="small"
              @click="removeItem(index)"
              v-if="form.items.length > 1"
            >
              删除
            </el-button>
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
      <el-button @click="() => emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="onSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean,
  products: { type: Array, default: () => [] },
  record: Object
})
const emit = defineEmits(['update:visible', 'save'])

const formRef = ref()
const form = reactive({
  customer:     '',
  project:      '',
  outboundTime: '',
  operator:     '',
  items: [
    { productId: null, quantity: 1, unitPrice: 0, amount: 0 }
  ]
})

const rules = {
  customer:     [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  outboundTime: [{ required: true, message: '请选择出库时间', trigger: 'change' }],
  operator:     [{ required: true, message: '请输入操作人', trigger: 'blur' }]
}
const itemRules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity:  [{ required: true, message: '请输入数量', trigger: 'change' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'change' }]
}

const availableProducts = computed(() =>
  props.products.filter(p => p.stock > 0)
)
const totalAmount = computed(() =>
  form.items.reduce((sum, item) => sum + (item.amount || 0), 0)
)

watch(() => props.visible, val => {
  if (val) {
    if (props.record) {
      // 编辑模式：填充现有数据
      form.customer     = props.record.customer || ''
      form.project      = props.record.project || ''
      form.outboundTime = props.record.outboundTime ? new Date(props.record.outboundTime) : ''
      form.operator     = props.record.operator || ''
      form.items        = props.record.items && props.record.items.length > 0 
        ? props.record.items.map(i => ({
            productId: i.productId,
            quantity:  i.quantity,
            unitPrice: i.unitPrice,
            amount:    i.amount || (i.quantity * i.unitPrice)
          }))
        : [{ productId: null, quantity: 1, unitPrice: 0, amount: 0 }]
    } else {
      // 新增模式：重置表单
      resetForm()
    }
  }
})

function getMaxQuantity(productId) {
  const p = props.products.find(p => p.id === productId)
  return p ? p.stock : 999
}

function addItem() {
  form.items.push({ productId: null, quantity: 1, unitPrice: 0, amount: 0 })
}

function removeItem(i) {
  form.items.splice(i, 1)
}

function onProductChange(i) {
  const p = props.products.find(p => p.id === form.items[i].productId)
  if (p) {
    form.items[i].unitPrice = p.price || 0
    if (form.items[i].quantity > p.stock) {
      form.items[i].quantity = p.stock
    }
    calculateAmount(i)
  }
}

function calculateAmount(i) {
  const it = form.items[i]
  it.amount = (it.quantity || 0) * (it.unitPrice || 0)
}

async function onSubmit() {
  try {
    await formRef.value.validate()
    if (form.items.length === 0) {
      ElMessage.warning('请至少添加一个商品')
      return
    }
    
    // 验证商品明细
    for (let i = 0; i < form.items.length; i++) {
      const it = form.items[i]
      const p  = props.products.find(p => p.id === it.productId)
      if (!it.productId || !it.quantity || it.unitPrice === null || it.unitPrice === undefined) {
        ElMessage.warning(`请完善第${i + 1}行信息`)
        return
      }
      if (!p || p.stock < it.quantity) {
        ElMessage.warning(`第${i + 1}行库存不足`)
        return
      }
    }
    
    emit('save', {
      customer:     form.customer,
      project:      form.project,
      outboundTime: form.outboundTime,
      operator:     form.operator,
      items:        form.items.map(it => ({
        productId: it.productId,
        quantity:  it.quantity,
        unitPrice: it.unitPrice
      }))
    })
    emit('update:visible', false)
    resetForm()
  } catch {
    ElMessage.warning('请填写完整信息')
  }
}

function resetForm() {
  form.customer     = ''
  form.project      = ''
  form.outboundTime = ''
  form.operator     = ''
  form.items        = [{ productId: null, quantity: 1, unitPrice: 0, amount: 0 }]
}
</script>

<style scoped>
.items-header {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

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