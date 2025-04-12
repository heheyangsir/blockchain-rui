<template>
  <div class="shadow-xl p-4 w-full max-w-md rounded-xl">
    <div class="my-4">
      <p class="font-bold text-xl">登入网络</p>
      <p class="text-gray-500 text-sm">立刻开始链上生活</p>
    </div>
    <button
      @click="handleWalletConnect"
      :class="[
        isConnected
          ? 'bg-emerald-600 hover:bg-red-700'
          : 'bg-blue-600 hover:bg-blue-700',
        'w-full py-3 px-6 group rounded-xl text-white font-medium transition-colors duration-200 flex items-center justify-center space-x-2',
      ]"
      :disabled="!!error"
    >
      <div v-if="isConnected">
        <svg
          class="w-5 h-5 block group-hover:hidden"
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
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 hidden group-hover:block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 1024 1024"
        >
          <path
            fill="currentColor"
            d="M832.6 191.4c-84.6-84.6-221.5-84.6-306 0l-96.9 96.9l51 51l96.9-96.9c53.8-53.8 144.6-59.5 204 0c59.5 59.5 53.8 150.2 0 204l-96.9 96.9l51.1 51.1l96.9-96.9c84.4-84.6 84.4-221.5-.1-306.1M446.5 781.6c-53.8 53.8-144.6 59.5-204 0c-59.5-59.5-53.8-150.2 0-204l96.9-96.9l-51.1-51.1l-96.9 96.9c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l96.9-96.9l-51-51zM260.3 209.4a8.03 8.03 0 0 0-11.3 0L209.4 249a8.03 8.03 0 0 0 0 11.3l554.4 554.4c3.1 3.1 8.2 3.1 11.3 0l39.6-39.6c3.1-3.1 3.1-8.2 0-11.3z"
          />
        </svg>
      </div>
      <div v-else>
        <svg
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
      </div>
      <span class="relative">
        <span class="block group-hover:hidden">
          {{ isConnected ? `已连接到 ${client?.name}` : "链接钱包" }}
        </span>
        <span class="hidden group-hover:block">
          {{ isConnected ? "断开链接" : "链接钱包" }}
        </span>
      </span>
    </button>

    <div
      v-if="isConnected"
      class="w-full mt-2 bg-white rounded-xl border border-gray-200"
    >
      <div class="p-4 space-y-4">
        <div class="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
          <span class="font-medium">当前网络:</span>
          {{}} (ID: {{}})
        </div>

        <div class="space-y-3 max-h-60 overflow-y-auto">
          <div
            v-for="(address, index) in addresses"
            :key="address"
            :class="[
              'p-3 rounded-lg transition-colors',
              index === selectedIndex
                ? 'bg-emerald-50 border border-emerald-200'
                : 'hover:bg-gray-50',
            ]"
          >
            <div
              class="flex items-center justify-between"
              @click="selectedIndex = index"
            >
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
            @click="login"
            class="flex-1 py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            登入
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
import { ref } from "vue";
import { useAccountStore, networkInfo } from "../stores/account";
import { createWalletClient, custom } from "viem";
import type { WalletClient } from "viem";
import { useRouter } from "vue-router";

const accountStore = useAccountStore();
const isConnected = ref(false);
const error = ref<any>();
const addresses = ref<string[]>([]);
const client = ref<WalletClient | null>();
const selectedIndex = ref<number>(0);
const router = useRouter();

const formatAddress = (addr: string) =>
  `${addr.slice(0, 8)}...${addr.slice(-6)}`;
const copyAddress = (address: string) => {
  navigator.clipboard.writeText(address);
};

const handleWalletConnect = async () => {
  if (isConnected.value) {
    disconnect();
  } else {
    await connect();
  }
};

const refresh = async () => {
  if (!client.value) {
    console.error("Client not initialized");
    return;
  }
  addresses.value = await client.value.requestAddresses();

  if (addresses.value.length > 0) {
    isConnected.value = true;
  } else {
    throw new Error("No accounts found");
  }
};

const disconnect = () => {
  client.value = null;
  isConnected.value = false;
};

const connect = async () => {
  try {
    if (typeof window !== "undefined" && window.ethereum) {
      console.log("Ethereum detected!");
    }
    client.value = createWalletClient({
      chain: networkInfo.currentChain,
      transport: custom(window.ethereum),
    });

    addresses.value = await client.value.requestAddresses();

    if (addresses.value.length > 0) {
      isConnected.value = true;
    } else {
      throw new Error("No accounts found");
    }
  } catch (err: any) {
    console.error(err);
    error.value = err;
  }
};

const login = async () => {
  if (
    selectedIndex.value < 0 ||
    selectedIndex.value >= addresses.value.length
  ) {
    error.value = "Please select an address";
    return;
  }
  console.log(addresses.value[selectedIndex.value]);
  accountStore.setAccountAddress(addresses.value[selectedIndex.value]);

  router.push({ path: "/dashboard" });
};
</script>
