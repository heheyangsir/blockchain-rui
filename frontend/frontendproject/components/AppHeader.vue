<template>
  <nav class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm z-50">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
      <!-- 左侧：Logo + 桌面菜单 -->
      <div class="flex items-center space-x-4 flex-grow">
        <div class="flex items-center gap-2 text-lg font-semibold text-stone-900 tracking-tight">
          <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>凭证管理系统</span>
        </div>
        <div class="hidden md:flex items-center ml-4 space-x-1">
          <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
            class="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
            :class="isActive(item.path) ? 'bg-amber-50 text-amber-700' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'">
            {{ item.title }}
          </router-link>
        </div>
      </div>

      <!-- 汉堡按钮：移动端 -->
      <button @click="toggleMobileMenu" class="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- 用户菜单：桌面端 -->
      <div class="relative hidden md:block ml-4">
        <button @click="toggleUserMenu" class="cursor-pointer w-10 h-10 rounded-full overflow-hidden border border-stone-200 hover:border-stone-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2">
          <img :src="user.avatar" alt="用户头像" class="w-full h-full object-cover"/>
        </button>
        <div v-if="isUserMenuOpen" class="absolute right-0 mt-3 w-56 bg-white border border-stone-200 text-stone-800 rounded-xl shadow-xl py-2 z-50">
          <div class="px-4 py-3 border-b border-stone-100">
            <p class="text-sm font-semibold text-stone-900">{{ user.name }}</p>
            <p class="text-xs text-stone-500 mt-0.5">已登录</p>
          </div>
          <button @click="logout"
                  class="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16l4-4m0 0l-4-4m4 4H7M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
            退出登录
          </button>
        </div>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <div v-if="isMobileMenuOpen" class="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-2">
      <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
        class="block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
        :class="isActive(item.path) ? 'bg-amber-50 text-amber-700' : 'text-stone-600 hover:bg-stone-50'"
        @click="isMobileMenuOpen = false">
        {{ item.title }}
      </router-link>
      <div class="mt-3 pt-3 border-t border-stone-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img :src="user.avatar" class="w-9 h-9 rounded-full object-cover border border-stone-200" />
          <span class="text-sm font-medium text-stone-800">{{ user.name }}</span>
        </div>
        <button @click="logout"
                class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
