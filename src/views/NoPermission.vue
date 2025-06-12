<!-- src/views/NoPermission.vue -->
<template>
    <div class="no-permission-page">
      <el-result
        icon="warning"
        title="403"
        sub-title="抱歉，您没有权限访问此页面"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">返回上一页</el-button>
          <el-button @click="goHome">回到首页</el-button>
        </template>
      </el-result>
      
      <div class="permission-info">
        <el-card>
          <template #header>
            <span>权限信息</span>
          </template>
          <p><strong>当前用户角色：</strong>{{ getCurrentUserRoles() }}</p>
          <p><strong>可访问功能：</strong></p>
          <ul>
            <li v-for="permission in getUserPermissions()" :key="permission">
              {{ permission }}
            </li>
          </ul>
        </el-card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/store/auth'
  
  const router = useRouter()
  const auth = useAuthStore()
  
  // 根据用户角色获取默认可访问页面
  function getDefaultPageByRole(userRoles) {
    if (userRoles.includes('SYSTEM_ADMIN')) {
      return '/products'
    } else if (userRoles.includes('WAREHOUSE_ADMIN')) {
      return '/products'
    } else if (userRoles.includes('AFTERSALES_STAFF')) {
      return '/returns'
    }
    return '/returns'
  }
  
  function goBack() {
    router.go(-1)
  }
  
  function goHome() {
    const defaultPage = getDefaultPageByRole(auth.userRoles || [])
    router.push(defaultPage)
  }
  
  function getCurrentUserRoles() {
    if (!auth.userRoles || auth.userRoles.length === 0) {
      return '未知角色'
    }
    
    const roleMap = {
      'SYSTEM_ADMIN': '系统管理员',
      'WAREHOUSE_ADMIN': '仓库管理员',
      'AFTERSALES_STAFF': '售后人员'
    }
    
    return auth.userRoles.map(role => roleMap[role] || role).join('、')
  }
  
  function getUserPermissions() {
    if (!auth.userRoles || auth.userRoles.length === 0) {
      return ['无可用功能']
    }
    
    const permissions = []
    
    if (auth.userRoles.includes('SYSTEM_ADMIN')) {
      permissions.push('商品管理', '入库记录', '出库记录', '退货记录', '系统管理')
    } else if (auth.userRoles.includes('WAREHOUSE_ADMIN')) {
      permissions.push('商品管理', '入库记录', '出库记录', '退货记录')
    } else if (auth.userRoles.includes('AFTERSALES_STAFF')) {
      permissions.push('退货记录')
    }
    
    return permissions.length > 0 ? permissions : ['无可用功能']
  }
  </script>
  
  <style scoped>
  .no-permission-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 20px;
  }
  
  .permission-info {
    margin-top: 30px;
    max-width: 500px;
    width: 100%;
  }
  
  .permission-info ul {
    margin: 10px 0;
    padding-left: 20px;
  }
  
  .permission-info li {
    margin: 5px 0;
  }
  </style>