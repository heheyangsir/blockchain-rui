<template>
  <div class="h-screen bg-gradient-to-r from-blue-500 to-purple-600">
    <!-- 头部 -->
    <header class="fixed top-0 left-0 w-full bg-white shadow-lg z-50">
      <div class="container mx-auto p-4 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-blue-600">
          <NuxtLink to="/">MyApp</NuxtLink>
        </h1>
        <nav class="space-x-4 text-gray-600">
          <NuxtLink to="/" class="hover:text-blue-600">首页</NuxtLink>
          <NuxtLink to="/about" class="hover:text-blue-500">关于我们</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- 主内容 -->
    <div class="container mx-auto h-full py-20">
      <div class="flex flex-col md:flex-row items-center h-full">
        <!-- 左侧文字描述 -->
        <div class="md:w-1/2 p-8 text-white text-left md:text-center">
          <h1 class="text-5xl font-extrabold mb-6 drop-shadow-lg">
            欢迎回来！
          </h1>
          <p class="text-2xl text-gray-200 mb-8 drop-shadow-md">
            使用您的钱包快速登录，继续您的链上旅程。
          </p>
        </div>

        <!-- 右侧登录表单 -->
        <div class="md:w-1/2 bg-white p-8 rounded-lg shadow-lg md:rounded-l-none">
          <WalletConnector />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
