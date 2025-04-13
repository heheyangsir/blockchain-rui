<script setup lang="ts">
import { useAccountStore, networkInfo } from "../../stores/account";
import { storeToRefs } from "pinia";
import { ref } from "vue";

import { createPublicClient, formatEther, http } from "viem";
import { useRouter } from "vue-router";
import UserAside from "../../components/UserAside.vue";
import UserBalance from "../../components/Card/UserBalance.vue";
import UserUpload from "../../components/Card/UserUpload.vue";

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
        <!-- 上传数 -->
        <UserUpload />

        <!-- 下载数 -->
        <UserSearch />

        <!-- 活跃用户 -->
        <UserActive />

        <!-- 余额 -->
        <UserBalance />
        </div>
      <!-- 图表 -->
      <UserChart />
    </main>
  </div>
</template>
