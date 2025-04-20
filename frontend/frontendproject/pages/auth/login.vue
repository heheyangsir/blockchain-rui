<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-200 via-pink-100 to-rose-200">

    <!-- 顶部导航栏 -->
    <header class="fixed top-0 left-0 w-full z-50">
      <div class="backdrop-blur-sm bg-white/80 shadow-md">
        <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          <!-- Logo 标题 -->
          <div class="flex items-center space-x-3">
            <img src="/logo.png" alt="Logo" class="w-8 h-8 rounded-md shadow-sm" />
            <NuxtLink to="/" class="text-xl font-bold text-rose-500 tracking-wide hover:underline transition">
              凭证管理系统
            </NuxtLink>
          </div>


          <nav class="space-x-6 text-sm text-gray-600">
            <NuxtLink to="/" class="relative font-semibold text-sm text-gray-600 hover:text-rose-500 transition duration-300 
         before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] 
         before:bg-rose-400 hover:before:w-full before:transition-all before:duration-300">
              首页
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <div class="flex flex-col items-center justify-center pt-32 px-4 space-y-12">

      <!-- 欢迎语 -->
      <div class="text-center text-gray-800 max-w-2xl">
        <h2 class="text-4xl font-extrabold mb-4">欢迎回来！</h2>
        <p class="text-lg text-gray-600">
          使用您的钱包快速登录，继续您的链上旅程。
        </p>
      </div>

      <!-- 登录表单卡片 -->
      <div class="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <WalletConnector />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts"></script>
