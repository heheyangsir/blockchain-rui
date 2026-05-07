<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-50 py-8 md:py-12">
    <div class="w-full max-w-5xl px-4 sm:px-6">
      <!-- 响应式布局：手机端上下(登录在上) / PC端左右(登录在左) -->
      <div class="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
        
        <!-- 登录区块 (占比增大，PC占1/2) -->
        <div class="w-full md:w-1/2 flex-shrink-0">
          <div class="bg-white rounded-2xl border border-amber-100/50 shadow-xl shadow-amber-900/5 p-8 md:p-10">
            <div class="flex justify-center mb-6">
              <img src="/logo.png" alt="Logo" class="h-16 w-auto drop-shadow-sm" />
            </div>
            <h2 class="text-xl font-semibold text-stone-900 text-center mb-2">欢迎体验</h2>
            <p class="text-sm text-stone-500 text-center mb-6">毕业设计演示系统 · 快速预览核心功能</p>

            <button 
              @click="$router.push('/auth/login')"
              class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-base font-medium rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:scale-[0.98]"
            >
              进入演示系统
            </button>

          </div>
        </div>

        <!-- 介绍区块 (PC占1/2，内容精简) -->
        <div class="w-full md:w-1/2 space-y-6">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
              基于区块链的 <span class="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">数字身份认证系统</span>
            </h1>
            <p class="mt-3 text-sm md:text-base text-stone-600 leading-relaxed">
              2026届计算机毕业设计。聚焦去中心化身份（DID）管理，探索可信数据验证与隐私保护的新路径。
            </p>
          </div>

          <!-- 核心亮点 (双列卡片，打破单调) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-stone-100 hover:border-amber-200 transition-colors">
              <h3 class="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span> 自主可控
              </h3>
              <p class="text-sm text-stone-500 leading-relaxed">用户完全掌控私钥与身份数据，杜绝第三方滥用，实现真正的数据主权。</p>
            </div>
            <div class="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-stone-100 hover:border-amber-200 transition-colors">
              <h3 class="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-orange-500"></span> 链上存证
              </h3>
              <p class="text-sm text-stone-500 leading-relaxed">凭证签发与验证全流程上链，不可篡改且全程可追溯，保障业务可信。</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>
