<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, watch, ref } from 'vue';

const walletStore = useWalletStore();
const networkStore = useNetworkStore();
const { balances, accounts, isConnected, isFetching } = storeToRefs(walletStore);

// 初始化加载
onMounted(async () => {
  if (isConnected.value) {
    await walletStore.fetchAllBalances();
  }
});

// 监听网络变化
watch(
  () => networkStore.chainId,
  async (newVal, oldVal) => {
    if (newVal !== oldVal) {
      await walletStore.fetchAllBalances();
    }
  },
  { immediate: true }
);

// 监听账户变化
watch(
  () => accounts.value,
  async (newAccounts) => {
    if (newAccounts.length > 0) {
      await walletStore.fetchAllBalances();
    }
  }
);

// 地址格式化
const formatAddress = (addr: string) => 
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;
</script>

<template>
  <div class="p-4 space-y-4">
    <h1 class="text-2xl font-bold">地址管理</h1>
    
    <!-- 加载状态 -->
    <div v-if="isFetching" class="p-4 bg-blue-50 rounded-lg flex items-center">
      <svg class="animate-spin h-5 w-5 text-blue-600 mr-3" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
      </svg>
      <span class="text-blue-600">正在更新余额信息...</span>
    </div>

    <!-- 地址列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="(address, index) in accounts"
        :key="address"
        class="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start mb-2">
          <div>
            <span class="text-sm text-gray-500">地址 #{{ index + 1 }}</span>
            <div class="font-mono text-gray-800 flex items-center">
              {{ formatAddress(address) }}
              <button 
                @click="copyToClipboard(address)"
                class="ml-2 text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </button>
            </div>
          </div>
          <span 
            v-if="index === 0"
            class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
          >
            主地址
          </span>
        </div>
        
        <!-- 余额显示 -->
        <div class="mt-2">
          <div class="text-sm text-gray-500">余额</div>
          <div 
            :class="[
              'text-lg font-semibold',
              balances[address] ? 'text-gray-900' : 'text-gray-400'
            ]"
          >
            {{ balances[address] || '0.0000' }} ETH
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="mt-4 flex space-x-2">
          <button
            @click="walletStore.switchPrimaryAddress(address)"
            :disabled="index === 0"
            class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 disabled:opacity-50"
          >
            设为主地址
          </button>
          <button
            @click="walletStore.revokeAddress(address)"
            class="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            撤销权限
          </button>
        </div>
      </div>
    </div>
  </div>
</template>