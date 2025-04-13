<script setup lang="ts">
import { useAccountStore, networkInfo } from "../../stores/account";
import { storeToRefs } from "pinia";
import { ref } from "vue";

import { createPublicClient, formatEther, http } from "viem";
import { useRouter } from "vue-router";
import UserAside from "../../components/UserAside.vue";
import UserBalance from "../../components/UserBalance.vue";

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

const showMenu = ref(false);

</script>

<template>
  <!-- <div v-if="!isLoading">{{ formatEther(balance!) }} ETH</div> -->
  <div class="min-h-screen flex bg-gray-50">
    <!-- 侧边导航 -->
    <UserAside />

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

      <!-- 数据卡片 -->
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- 存储数 -->
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h3 class="text-gray-500 text-sm font-medium">总存储数</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">12,842</p>
          <div class="mt-4 flex items-center text-sm text-green-600">
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            8.2% 周增长
          </div>
        </div>

        <!-- 下载数 -->
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h3 class="text-gray-500 text-sm font-medium">总下载数</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">242</p>
          <div class="mt-4 flex items-center text-sm text-red-600">
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
            1.5% 周下降
          </div>
        </div>

        <!-- 活跃用户 -->
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h3 class="text-gray-500 text-sm font-medium">活跃用户</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">2,142</p>
          <div class="mt-4 flex items-center text-sm text-blue-600">
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            实时更新
          </div>
        </div>

        <!-- 余额 -->
        <UserBalance />
        </div>
      <!-- 图表 -->
      <UserChart />
    </main>
  </div>
</template>
