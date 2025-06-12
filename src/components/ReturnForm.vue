<!-- src/components/ReturnForm.vue -->
<template>
  <el-dialog 
    title="新增退货申请" 
    :model-value="visible" 
    @close="onClose"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="入库单ID" prop="inboundRecordId">
            <el-input-number 
              v-model="form.inboundRecordId" 
              :min="1" 
              style="width: 100%"
              placeholder="请输入入库单ID"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出库单ID" prop="outboundRecordId">
            <el-input-number 
              v-model="form.outboundRecordId" 
              :min="1" 
              style="width: 100%"
              placeholder="请输入出库单ID"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="退货数量" prop="quantity">
            <el-input-number 
              v-model="form.quantity" 
              :min="1" 
              style="width: 100%"
              placeholder="请输入退货数量"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="退货类型" prop="returnType">
            <el-select v-model="form.returnType" style="width: 100%">
              <el-option label="退货" value="RETURN" />
              <el-option label="换货" value="EXCHANGE" />
              <el-option label="质保期退换" value="WARRANTY_RETURN" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="操作人" prop="operator">
            <el-input 
              v-model="form.operator" 
              placeholder="请输入操作人"
              maxlength="255"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="退货时间" prop="returnTime">
            <el-date-picker 
              v-model="form.returnTime" 
              type="datetime" 
              placeholder="请选择退货时间"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="退货原因" prop="reason">
        <el-input 
          v-model="form.reason" 
          placeholder="请详细说明退货原因"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="退货金额" prop="amount">
        <el-input-number 
          v-model="form.amount" 
          :min="0" 
          :step="0.01" 
          :precision="2"
          style="width: 100%"
          placeholder="请输入退货金额"
        />
        <div style="margin-top: 5px; font-size: 12px; color: #909399;">
          可选填，如不填写将由系统自动计算
        </div>
      </el-form-item>

      <el-form-item label="备注信息" prop="remark">
        <el-input 
          v-model="form.remark" 
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（可选）"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="submitting">
        提交申请
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({ 
  visible: Boolean,
  editData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'save'])

const formRef = ref()
const submitting = ref(false)

// 表单数据
const form = reactive({
  id: null,
  inboundRecordId: null,
  outboundRecordId: null,
  quantity: 1,
  reason: '',
  remark: '',
  operator: '',
  returnTime: null,
  returnType: 'RETURN',
  amount: null
})

// 表单验证规则
const rules = {
  inboundRecordId: [
    { required: true, message: '请输入入库单ID', trigger: 'change' }
  ],
  outboundRecordId: [
    { required: true, message: '请输入出库单ID', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入退货数量', trigger: 'change' },
    { type: 'number', min: 1, message: '退货数量必须大于0', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入退货原因', trigger: 'blur' },
    { min: 5, max: 255, message: '退货原因长度在5-255个字符', trigger: 'blur' }
  ],
  operator: [
    { required: true, message: '请输入操作人', trigger: 'blur' },
    { min: 1, max: 255, message: '操作人长度在1-255个字符', trigger: 'blur' }
  ],
  returnTime: [
    { required: true, message: '请选择退货时间', trigger: 'change' }
  ],
  returnType: [
    { required: true, message: '请选择退货类型', trigger: 'change' }
  ],
  remark: [
    { max: 255, message: '备注信息长度不能超过255个字符', trigger: 'blur' }
  ],
  amount: [
    { type: 'number', min: 0, message: '退货金额不能为负数', trigger: 'change' }
  ]
}

// 重置表单
function resetForm() {
  Object.assign(form, {
    id: null,
    inboundRecordId: null,
    outboundRecordId: null,
    quantity: 1,
    reason: '',
    remark: '',
    operator: '',
    returnTime: null,
    returnType: 'RETURN',
    amount: null
  })
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 监听弹窗显示状态
watch(() => props.visible, (visible) => {
  if (visible) {
    if (props.editData) {
      // 编辑模式，填充数据
      Object.assign(form, {
        id: props.editData.id,
        inboundRecordId: props.editData.inboundRecordId || props.editData.inbound_record_id,
        outboundRecordId: props.editData.outboundRecordId || props.editData.outbound_record_id,
        quantity: props.editData.quantity || 1,
        reason: props.editData.reason || '',
        remark: props.editData.remark || '',
        operator: props.editData.operator || '',
        returnTime: props.editData.returnTime || props.editData.return_time,
        returnType: props.editData.returnType || props.editData.return_type || 'RETURN',
        amount: props.editData.amount
      })
    } else {
      // 新增模式，设置默认值
      form.operator = 'admin' // 可以从登录状态获取
      form.returnTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
  } else {
    // 弹窗关闭时重置表单
    resetForm()
  }
})

// 关闭弹窗
function onClose() {
  emit('update:visible', false)
}

// 提交表单
async function onSubmit() {
  try {
    submitting.value = true
    await formRef.value.validate()
    
    // 准备提交数据
    const submitData = {
      id: form.id,
      inboundRecordId: form.inboundRecordId,
      outboundRecordId: form.outboundRecordId,
      quantity: form.quantity,
      reason: form.reason,
      remark: form.remark || null,
      operator: form.operator,
      returnTime: form.returnTime,
      returnType: form.returnType,
      amount: form.amount,
      status: 'PENDING' // 默认状态为待处理
    }
    
    emit('save', submitData)
    emit('update:visible', false)
    ElMessage.success(form.id ? '修改成功' : '退货申请提交成功')
  } catch (error) {
    ElMessage.warning('请填写完整信息')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-input-number) {
  width: 100%;
}

.el-col {
  margin-bottom: 0;
}
</style>