<template>
  <div 
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 via-pink-200 to-rose-300"
  >
    <!-- 内容卡片 -->
    <div 
      class="bg-white rounded-3xl shadow-xl p-12 w-full max-w-xl text-center"
    >
      <!-- logo -->
      <img 
        src="/logo.png" 
        alt="Logo" 
        class="mx-auto w-40 h-auto mb-6 drop-shadow"
      />

      <!-- 标题 -->
      <h1 
        class="text-4xl font-extrabold text-gray-800 mb-4 tracking-tight"
        style="font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;"
      >
        欢迎来到 <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">未来平台</span>
      </h1>

      <p class="text-gray-600 text-lg mb-8">
        用您的账号解锁无限可能，开启您的专属旅程
      </p>

      <!-- 登录按钮 -->
      <button 
        @click="$router.push('/auth/login')"
        class="w-full py-4 text-lg font-semibold text-white rounded-full shadow-md bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 transition duration-300"
      >
        🚀 立即开始
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>
