<script setup lang="ts">
import { useAccountStore, networkInfo } from "../../stores/account";
import { storeToRefs } from "pinia";
import { ref } from "vue";

import { createPublicClient, formatEther, http } from "viem";
import { useRouter } from "vue-router";

const accountStore = useAccountStore();
const { accountAddress } = storeToRefs(accountStore);
const balance = ref<bigint>();
const isLoading = ref<boolean>(true);
const router = useRouter();

if (!accountAddress.value) {
  console.log("No Address");
  router.push({ path: "/auth/login" });
} else {
  const client = createPublicClient({
    chain: networkInfo.currentChain,
    transport: http(networkInfo.rpcUrl),
  });

  client
    .getBalance({
      address: accountAddress.value as `0x${string}`,
      blockTag: "safe",
    })
    .then((result) => {
      balance.value = result;
      isLoading.value = false;
    })
    .catch((err) => {
      console.error("Error fetching balance:", err);
      isLoading.value = false;
    });
}
</script>

<template>
  <!-- <div v-if="!isLoading">{{ formatEther(balance!) }} ETH</div> -->
  <div class="min-h-screen flex bg-gray-50">
    <!-- 侧边导航 -->
    <aside class="bg-white w-20 md:w-64 shadow-lg flex-shrink-0">
      <div class="p-4 border-b">
        <svg class="w-8 h-8 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        <h2 class="hidden md:block text-xl font-bold text-blue-600 text-center mt-2">Home</h2>
      </div>
      <nav class="p-4">
        <a href="#" class="flex flex-col md:flex-row items-center p-3 space-y-1 md:space-y-0 md:space-x-3 
                         text-sm font-medium bg-blue-100 rounded-lg text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span class="hidden md:inline">仪表盘</span>
        </a>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 overflow-auto">
      <!-- 表头 -->
      <header class="bg-white shadow-sm">
        <div class="px-6 py-4">
          <h1 class="text-2xl font-semibold text-gray-900">欢迎使用</h1>
          <p class="mt-1 text-sm text-gray-500">最后更新：{{ new Date().toLocaleDateString() }}</p>
        </div>
      </header>

      <!-- 数据卡片 -->
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- 存储数 -->
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h3 class="text-gray-500 text-sm font-medium">总存储数</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">12,842</p>
          <div class="mt-4 flex items-center text-sm text-green-600">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            8.2% 周增长
          </div>
        </div>

        <!-- 下载数 -->
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h3 class="text-gray-500 text-sm font-medium">总下载数</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">242</p>
          <div class="mt-4 flex items-center text-sm text-red-600">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
            </svg>
            1.5% 周下降
          </div>
        </div>

        <!-- 活跃用户 -->
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h3 class="text-gray-500 text-sm font-medium">活跃用户</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">2,142</p>
          <div class="mt-4 flex items-center text-sm text-blue-600">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            实时更新
          </div>
        </div>

        <!-- 余额 -->
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h3 class="text-gray-500 text-sm font-medium">余额</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900"><div v-if="!isLoading">{{ formatEther(balance!) }} ETH</div></p>
          <div class="mt-4 flex items-center text-sm text-purple-600">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            本月增长 12%
          </div>
        </div>
      </div>

      <!-- 图表 -->
      <div class="px-6 pb-6">
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">访问趋势</h3>
          <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <!-- 假图表 -->
            <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>

          </div>
        </div>
      </div>
    </main>
  </div>

</template>
