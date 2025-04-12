<template>
  <div class="wallet-connector relative max-w-xs mx-auto">
    <button
      @click="handleWalletAction"
      :class="[
        isConnected
          ? 'bg-emerald-600 hover:bg-emerald-700'
          : 'bg-blue-600 hover:bg-blue-700',
        'w-full py-3 px-6 rounded-xl text-white font-medium transition-colors duration-200 flex items-center justify-center space-x-2',
      ]"
      :disabled="!!error"
    >
      <svg
        v-if="isConnected"
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <svg
        v-else
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      <span>{{ buttonText }}</span>
    </button>

    <div
      v-if="isConnected"
      class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100"
    >
      <div class="p-4 space-y-4">
        <div class="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
          <span class="font-medium">当前网络:</span>
          {{ networkStore.chainName }} (ID: {{ networkStore.chainId }})
        </div>

        <div class="space-y-3 max-h-60 overflow-y-auto">
          <div
            v-for="(address, index) in accounts"
            :key="address"
            :class="[
              'p-3 rounded-lg transition-colors',
              index === 0
                ? 'bg-emerald-50 border border-emerald-200'
                : 'hover:bg-gray-50',
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="text-xs text-gray-500 mb-1">
                  地址 #{{ index + 1 }}
                </div>
                <div class="font-mono text-sm flex items-center space-x-2">
                  <span>{{ formatAddress(address) }}</span>
                  <button
                    @click="copyAddress(address)"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="text-sm font-medium text-emerald-600">
                {{ (balances[address] || 0).slice(0, 6) }} ETH
              </div>
              <div v-if="isFetching" class="text-sm text-gray-500 mt-2">
                <svg
                  class="animate-spin h-4 w-4 inline-block mr-2"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"
                  />
                </svg>
                正在更新余额...
              </div>
            </div>
          </div>
        </div>

        <div class="flex space-x-2 pt-4 border-t border-gray-100">
          <button
            @click="refresh"
            class="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            刷新
          </button>
          <button
            @click="disconnect"
            class="flex-1 py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            断开
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="error"
      class="mt-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useWalletStore } from "~/stores/wallet";
import { useNetworkStore } from "~/stores/network";

const walletStore = useWalletStore();
const networkStore = useNetworkStore();
const { accounts, isConnected, balances, error } = storeToRefs(walletStore);

const primaryAddressShort = computed(() =>
  accounts.value[0]
    ? `${accounts.value[0].slice(0, 6)}...${accounts.value[0].slice(-4)}`
    : ""
);

const formatAddress = (addr: string) =>
  `${addr.slice(0, 8)}...${addr.slice(-6)}`;

const handleWalletAction = async () => {
  if (isConnected.value) {
    walletStore.disconnect();
  } else {
    await walletStore.connectWallet();
  }
};

const copyAddress = (address: string) => {
  navigator.clipboard.writeText(address);
};

const refresh = async () => {
  await walletStore.refreshAccounts();
};

const disconnect = () => {
  walletStore.disconnect();
};
</script>
