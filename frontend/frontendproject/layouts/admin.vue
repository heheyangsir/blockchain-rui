<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- 侧边栏组件 -->
    <AdminSidebar />

    <!-- 主内容区 -->
    <main class="flex-1 overflow-auto">
      <!-- 头部 -->
      <header class="bg-white shadow-sm">
        <div class="px-6 py-4 flex justify-between items-center">
          <!-- 左侧标题 -->
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">欢迎使用控制台</h1>
            <p class="mt-1 text-sm text-gray-500">当前路径：数据分析看板</p>
          </div>

          <!-- 头像及下拉菜单 -->
          <div
            class="relative"
            @mouseover="showMenu = true"
            @mouseleave="showMenu = false"
          >
            <UserProfile />
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- 上传数 -->
        <UserUpload />

        <!-- 下载数 -->
        <UserSearch />

        <!-- 活跃用户 -->
        <UserActive />

        <!-- 余额 -->
        <UserBalance />
      </div>
      <!-- 图表 -->
      <UserChart />
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AdminSidebar from "../components/sidebar/AdminSidebar.vue";
import { ref } from "vue";

const showMenu = ref(false);
</script>
