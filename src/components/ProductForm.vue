<!-- src/components/ProductForm.vue -->
<template>
  <el-dialog
    :title="isEdit ? '编辑商品' : '新增商品'"
    :model-value="visible"
    @close="onClose"
    width="500px"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入商品名称" maxlength="200" />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number
          v-model="form.price"
          :min="0"
          :step="0.01"
          :precision="2"
          style="width: 100%"
          placeholder="请输入价格"
        />
      </el-form-item>
      <el-form-item label="型号" prop="model">
        <el-input v-model="form.model" placeholder="请输入型号（可选）" maxlength="100" />
      </el-form-item>
      <el-form-item label="序列号" prop="serialNumber">
        <el-input v-model="form.serialNumber" placeholder="请输入序列号（可选）" maxlength="100" />
      </el-form-item>
      <el-form-item label="售后编码" prop="afterSaleCode">
        <el-input v-model="form.afterSaleCode" placeholder="请输入售后编码（可选）" maxlength="50" />
      </el-form-item>
      <el-form-item label="供应商" prop="supplier">
        <el-input v-model="form.supplier" placeholder="请输入供应商（可选）" maxlength="100" />
      </el-form-item>
      <el-form-item label="采购价格" prop="purchasePrice">
        <el-input-number
          v-model="form.purchasePrice"
          :min="0"
          :step="0.01"
          :precision="2"
          style="width: 100%"
          placeholder="请输入采购价格（可选）"
        />
      </el-form-item>
      <el-form-item label="销售价格" prop="salePrice">
        <el-input-number
          v-model="form.salePrice"
          :min="0"
          :step="0.01"
          :precision="2"
          style="width: 100%"
          placeholder="请输入销售价格（可选）"
        />
      </el-form-item>
      <el-form-item label="保修期" prop="warranty">
        <el-input v-model="form.warranty" placeholder="请输入保修期（可选）" maxlength="100" />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类（可选）" style="width: 100%">
          <el-option label="电子产品" value="电子产品" />
          <el-option label="机械设备" value="机械设备" />
          <el-option label="办公用品" value="办公用品" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入商品描述（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="submitting">
        {{ isEdit ? '更新' : '新增' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean,
  editingProduct: Object
})
const emits = defineEmits(['update:visible', 'save'])

const isEdit = ref(false)
const formRef = ref()
const submitting = ref(false)

// 表单数据结构对应后端 POJO（camelCase）
const form = reactive({
  name: '',
  model: '',
  serialNumber: '',
  afterSaleCode: '',
  supplier: '',
  purchasePrice: null,
  salePrice: null,
  warranty: '',
  category: '',
  description: '',
  price: null
})

// 验证规则略（同之前，不影响字段映射）
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 1, max: 200, message: '商品名称长度在1-200个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'change' },
    { type: 'number', min: 0.01, message: '价格必须大于0', trigger: 'change' }
  ],
  model: [{ max: 100, message: '型号长度不能超过100个字符', trigger: 'blur' }],
  serialNumber: [{ max: 100, message: '序列号长度不能超过100个字符', trigger: 'blur' }],
  afterSaleCode: [{ max: 50, message: '售后编码长度不能超过50个字符', trigger: 'blur' }],
  supplier: [{ max: 100, message: '供应商长度不能超过100个字符', trigger: 'blur' }],
  purchasePrice: [{ type: 'number', min: 0, message: '采购价格不能为负数', trigger: 'change' }],
  salePrice: [{ type: 'number', min: 0, message: '销售价格不能为负数', trigger: 'change' }],
  warranty: [{ max: 100, message: '保修期长度不能超过100个字符', trigger: 'blur' }],
  category: [{ max: 50, message: '分类长度不能超过50个字符', trigger: 'blur' }],
  description: [{ max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }]
}

// 重置表单
function resetForm() {
  Object.assign(form, {
    name: '',
    model: '',
    serialNumber: '',
    afterSaleCode: '',
    supplier: '',
    purchasePrice: null,
    salePrice: null,
    warranty: '',
    category: '',
    description: '',
    price: null
  })
  nextTick(() => formRef.value?.clearValidate())
}

// 当 props.editingProduct 改变时，填充到 form
watch(
  () => props.editingProduct,
  (val) => {
    if (val && val.id != null) {
      isEdit.value = true
      Object.assign(form, {
        name: val.name || '',
        model: val.model || '',
        serialNumber: val.serialNumber || '',
        afterSaleCode: val.afterSaleCode || '',
        supplier: val.supplier || '',
        purchasePrice: val.purchasePrice || null,
        salePrice: val.salePrice || null,
        warranty: val.warranty || '',
        category: val.category || '',
        description: val.description || '',
        price: Number(val.price) || null
      })
    } else {
      isEdit.value = false
      resetForm()
    }
  },
  { immediate: true }
)

// 关闭弹窗时重置
watch(
  () => props.visible,
  (val) => {
    if (!val) resetForm()
  }
)

function onClose() {
  emits('update:visible', false)
}

async function onSubmit() {
  try {
    submitting.value = true
    await formRef.value.validate()

    // 构造提交对象：camelCase + id
    const submitData = {
      id: props.editingProduct?.id,
      name: form.name,
      model: form.model || null,
      serialNumber: form.serialNumber || null,
      afterSaleCode: form.afterSaleCode || null,
      supplier: form.supplier || null,
      purchasePrice: form.purchasePrice,
      salePrice: form.salePrice,
      warranty: form.warranty || null,
      category: form.category || null,
      description: form.description || null,
      price: form.price
    }

    // 触发父组件的 save 事件
    emits('save', { isEdit: isEdit.value, data: submitData })
    emits('update:visible', false)
  } catch (e) {
    ElMessage.warning('请检查表单项')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 18px;
}
</style>
