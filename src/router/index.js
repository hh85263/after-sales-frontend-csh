/* src/router/index.js */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

/* ------ 视图组件 ------ */
import Login            from '@/views/Login.vue'
import Register         from '@/views/Register.vue'
import Products         from '@/views/Products.vue'
import InboundRecords   from '@/views/InboundRecords.vue'
import OutboundRecords  from '@/views/OutboundRecords.vue'
import ReturnRecords    from '@/views/ReturnRecords.vue'
import DataAnalysis     from '@/views/DataAnalysis.vue'  // ✨ 新增数据分析页面
import NoPermission     from '@/views/NoPermission.vue'

/* ------ 路由表 ------ */
const routes = [
  // 登录
  { path: '/login', name: 'Login', component: Login },

  // 用户注册 —— 仅系统管理员可访问
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { roles: ['SYSTEM_ADMIN'] }
  },

  // 商品管理 —— 系统管理员 & 仓库管理员
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: { roles: ['SYSTEM_ADMIN', 'WAREHOUSE_ADMIN'] }
  },

  // 入库记录 —— 系统管理员 & 仓库管理员
  {
    path: '/inbounds',
    name: 'InboundRecords',
    component: InboundRecords,
    meta: { roles: ['SYSTEM_ADMIN', 'WAREHOUSE_ADMIN'] }
  },

  // 出库记录 —— 系统管理员 & 仓库管理员
  {
    path: '/outbounds',
    name: 'OutboundRecords',
    component: OutboundRecords,
    meta: { roles: ['SYSTEM_ADMIN', 'WAREHOUSE_ADMIN'] }
  },

  // 退货记录 —— 售后人员 & 仓库管理员 & 系统管理员
  {
    path: '/returns',
    name: 'ReturnRecords',
    component: ReturnRecords,
    meta: { roles: ['AFTERSALES_STAFF', 'WAREHOUSE_ADMIN', 'SYSTEM_ADMIN'] }
  },

  // 数据分析 —— 所有已登录角色都可访问
  {
    path: '/analysis',
    name: 'DataAnalysis',
    component: DataAnalysis,
    meta: { roles: ['SYSTEM_ADMIN', 'WAREHOUSE_ADMIN', 'AFTERSALES_STAFF'] }
  },

  // 权限不足页面
  { path: '/no-permission', name: 'NoPermission', component: NoPermission },

  // 默认重定向到登录页
  { path: '/', redirect: '/login' },

  // 404 兜底路由
  { path: '/:pathMatch(.*)*', redirect: '/no-permission' }
]

/* ------ 创建路由实例 ------ */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

/* ------ 全局前置守卫 ------ */
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  /* 1. 登录校验 - 除了登录页，其他页面都需要token */
  const token = auth.token || localStorage.getItem('token')
  if (!token && to.path !== '/login') {
    return next('/login')
  }

  /* 2. 如果已在登录页且有token，重定向到合适的页面 */
  if (to.path === '/login' && token) {
    // 根据用户角色重定向到合适的首页
    if (auth.userRoles.includes('SYSTEM_ADMIN')) {
      return next('/products')
    } else if (auth.userRoles.includes('WAREHOUSE_ADMIN')) {
      return next('/products')
    } else if (auth.userRoles.includes('AFTERSALES_STAFF')) {
      return next('/returns')
    }
    return next('/analysis') // 默认到数据分析页
  }

  /* 3. 首次进入时拉取用户信息 */
  if (token && auth.userRoles.length === 0) {
    try {
      await auth.fetchUserInfo()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      auth.logout()
      return next('/login')
    }
  }

  /* 4. 角色权限校验 */
  if (to.meta?.roles?.length) {
    const hasPermission = auth.userRoles.some(role => to.meta.roles.includes(role))
    if (!hasPermission) {
      return next('/no-permission')
    }
  }

  next()
})

/* ------ 全局后置钩子 - 可用于页面标题设置等 ------ */
router.afterEach((to) => {
  // 根据路由设置页面标题
  const titleMap = {
    'Login': '登录',
    'Register': '用户注册',
    'Products': '商品管理',
    'InboundRecords': '入库记录',
    'OutboundRecords': '出库记录',
    'ReturnRecords': '退货记录',
    'DataAnalysis': '数据分析',
    'NoPermission': '权限不足'
  }
  document.title = titleMap[to.name] ? `${titleMap[to.name]} - 仓储管理系统` : '仓储管理系统'
})

export default router