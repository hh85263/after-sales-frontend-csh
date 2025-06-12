<!-- src/components/Navbar.vue -->
<template>
  <el-menu
    mode="horizontal"
    router
    :ellipsis="false"            
    class="navbar-menu"          
  >
    <!-- 商品管理 - 系统管理员 & 仓库管理员 -->
    <el-menu-item index="/products" v-if="canAccessProducts">
      商品管理
    </el-menu-item>

    <!-- 入库记录 - 系统管理员 & 仓库管理员 -->
    <el-menu-item index="/inbounds" v-if="canAccessInbounds">
      入库记录
    </el-menu-item>

    <!-- 出库记录 - 系统管理员 & 仓库管理员 -->
    <el-menu-item index="/outbounds" v-if="canAccessOutbounds">
      出库记录
    </el-menu-item>

    <!-- 退货记录 - 所有已登录用户 -->
    <el-menu-item index="/returns" v-if="isLoggedIn">
      退货记录
    </el-menu-item>

    <!-- 数据分析 - 所有已登录用户 -->
    <el-menu-item index="/analysis" v-if="isLoggedIn">
      数据分析
    </el-menu-item>


    <!-- 注册用户 - 仅系统管理员 -->
    <el-menu-item index="/register" v-if="canAccessRegister">
      注册用户
    </el-menu-item>

    <!-- 登录 / 退出 -->
    <el-menu-item index="/login" v-if="!isLoggedIn">
      登录
    </el-menu-item>
    <el-menu-item v-else @click="logout">
      退出
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()

// 是否已登录
const isLoggedIn = computed(() => auth.isLoggedIn)
// 用户角色
const userRoles = computed(() => auth.userRoles || [])

// 判断是否具有所需角色
function hasAnyRole(requiredRoles) {
  return requiredRoles.some(r => userRoles.value?.includes(r))
}

// 权限计算
const canAccessProducts = computed(() =>
  isLoggedIn.value && hasAnyRole(['SYSTEM_ADMIN', 'WAREHOUSE_ADMIN'])
)
const canAccessInbounds = computed(() =>
  isLoggedIn.value && hasAnyRole(['SYSTEM_ADMIN', 'WAREHOUSE_ADMIN'])
)
const canAccessOutbounds = computed(() =>
  isLoggedIn.value && hasAnyRole(['SYSTEM_ADMIN', 'WAREHOUSE_ADMIN'])
)

// ✅ 只有系统管理员
const canAccessRegister = computed(() =>
  isLoggedIn.value && hasAnyRole(['SYSTEM_ADMIN'])
)

// 退出登录
function logout() {
  auth.logout()
  ElMessage.success('已退出，跳转登录页')
  router.push('/login')
}
</script>

<style scoped>
/* 让菜单占满 header，避免被折叠成 … */
.navbar-menu {
  flex: 1;
  background: #ffffff;
}

/* hover 效果 */
.el-menu-item {
  transition: background-color 0.3s ease;
}

.el-menu-item:hover {
  background-color: #f5f7fa;
}
</style>