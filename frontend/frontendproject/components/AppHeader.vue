<template>
  <nav class="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-md z-50">
    <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
      <!-- 左侧内容：Logo + 菜单 -->
      <div class="flex items-center space-x-6 flex-grow">
        <h1 class="text-xl sm:text-2xl font-extrabold tracking-wide whitespace-nowrap">📘 凭证管理系统</h1>
        <div class="hidden md:flex space-x-3 ml-6">
          <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
            class="text-sm px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition duration-200"
            :class="{ 'bg-purple-600': isActive(item.path) }">
            {{ item.title }}
          </router-link>
        </div>
      </div>

      <!-- 汉堡按钮：小屏显示 -->
      <button @click="toggleMobileMenu" class="md:hidden focus:outline-none ml-4">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- 用户头像 -->
      <div class="relative hidden md:block ml-6">
        <div @click="toggleUserMenu"
             class="cursor-pointer w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center p-1">
          <img :src="user.avatar" alt="用户头像" class="w-full h-full object-cover rounded-full"/>
        </div>
        <div v-if="isUserMenuOpen"
             class="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2 z-50">
          <div class="px-4 py-2 text-sm border-b border-gray-200">
            👋 {{ user.name }}
          </div>
          <button @click="logout"
                  class="w-full px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-red-400 to-red-500 shadow-lg mt-2">
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16l4-4m0 0l-4-4m4 4H7M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
              退出登录
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 移动端菜单（保持不变） -->
    <div v-if="isMobileMenuOpen" class="md:hidden px-4 pb-3 space-y-2">
      <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
        class="block text-sm px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition duration-200"
        :class="{ 'bg-purple-600': isActive(item.path) }"
        @click="isMobileMenuOpen = false"
      >
        {{ item.title }}
      </router-link>

      <div class="mt-2 border-t border-gray-700 pt-2">
        <div class="flex items-center space-x-2">
          <img :src="user.avatar" class="w-8 h-8 rounded-full" />
          <span class="text-sm">👋 {{ user.name }}</span>
        </div>
        <button @click="logout"
                class="mt-2 w-full px-4 py-2 text-white font-semibold bg-gradient-to-r from-red-400 to-red-500 rounded-lg shadow-md">
          退出登录
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAccountStore } from '@/stores/account';

const router = useRouter();
const route = useRoute();
const isUserMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);

const user = ref({
  name: 'John Doe',
  avatar: '/logo.png',
});

const menuItems = [
  { title: '首页', path: '/dashboard' },
  { title: '凭证上传', path: '/dashboard/UploadCredential' },
  { title: '凭证认证', path: '/dashboard/VerifyCredential' },
  { title: '凭证查询', path: '/dashboard/QueryCredential' },
  { title: '凭证管理', path: '/dashboard/ExpireCredential' },
];

const isActive = (path) => route.path === path;
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const logout = async () => {
  const accountStore = useAccountStore();
  await accountStore.disconnect();
  router.push('/auth/login');
};
</script>

<style scoped>
/* 头像容器样式 */
.cursor-pointer:hover {
  transform: scale(1.1); /* 鼠标悬停放大效果 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15); /* 增加阴影效果 */
}
</style>
