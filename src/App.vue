<template>
  <el-container style="min-height: 100vh;">
    <!-- 顶部导航栏 -->
    <el-header height="60px" style="padding: 0; background-color: #ffffff; box-shadow: 0 2px 8px #f0f1f2;">
      <Navbar />
    </el-header>

    <el-container>
      <!-- 侧边栏（可选） -->
      <!--
      <el-aside width="200px" style="background-color: #f9f9f9;">
        Sidebar
      </el-aside>
      -->

      <!-- 主内容区 -->
      <el-main style="padding: 20px; background-color: #f5f7fa;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
</script>

<style scoped>
/* 全局样式 */
.el-header {
  display: flex;
  align-items: center;
  padding: 0 24px;
}
.el-main {
  padding: 24px;
  background-color: #f5f7fa;
}
</style>
npm run dev
