<script setup lang="ts">
import { ref } from "vue";
import UserProfile from "../../../components/UserProfile.vue";
import AdminSidebar from "../../../components/sidebar/AdminSidebar.vue";
import Dashboard from "../dashboard.vue";

const showMenu = ref(false);

</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- 侧边导航 -->
    <!-- <UserAside /> -->
    <AdminSidebar />
    <!-- 主内容区 -->
    <main class="flex-1 overflow-auto">
      <!-- 表头 -->
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
      <dashboard />
    </main>
  </div>
</template>
