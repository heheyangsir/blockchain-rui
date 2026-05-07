<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/20 to-stone-50">
    <!-- 顶部导航栏 -->
    <header class="fixed top-0 left-0 w-full z-50 border-b border-amber-100/50">
      <div class="backdrop-blur-md bg-white/80">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <!-- Logo 标题 -->
          <div class="flex items-center space-x-3">
            <img src="/logo.png" alt="Logo" class="w-9 h-9 rounded-lg shadow-sm" />
            <NuxtLink to="/" class="text-lg font-semibold text-stone-900 tracking-tight hover:text-amber-600 transition-colors">
              凭证管理系统
            </NuxtLink>
          </div>

          <!-- 导航 -->
          <nav>
            <NuxtLink to="/" class="text-sm font-medium text-stone-600 hover:text-amber-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-50">
              首页
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="flex flex-col items-center justify-center min-h-screen pt-24 md:pt-28 px-4">
      <!-- 欢迎语 -->
      <div class="text-center max-w-xl mb-8">
        <h2 class="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mb-3">欢迎回来</h2>
        <p class="text-sm md:text-base text-stone-600 leading-relaxed">
          使用您的钱包快速登录，继续您的链上旅程。
        </p>
      </div>

      <!-- 登录表单卡片 -->
      <div class="w-full max-w-md bg-white rounded-2xl border border-amber-100/50 shadow-xl shadow-amber-900/5 p-6 md:p-8">
        <WalletConnector />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts"></script>
