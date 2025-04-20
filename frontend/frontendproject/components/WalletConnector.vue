<template>
  <div class="space-y-6">
    <!-- 标题 -->
    <div class="text-center">
      <h2 class="text-2xl font-semibold text-gray-800">连接钱包</h2>
      <p class="text-gray-500 text-sm">开始您的链上之旅</p>
    </div>

    <!-- 钱包连接按钮 -->
    <button
      @click="handleWalletConnect"
      :class="[
        isConnected
          ? 'bg-emerald-600 hover:bg-emerald-700'
          : 'bg-blue-600 hover:bg-blue-700',
        'w-full py-4 px-6 rounded-lg text-white font-medium transition duration-200',
        'flex items-center justify-center gap-2',
        'shadow-md hover:shadow-lg focus:outline-none focus:ring focus:ring-opacity-50'
      ]"
      :disabled="!!error"
    >
      <div v-if="isConnected" class="flex items-center gap-2">
        <svg
          class="w-6 h-6 transition-transform group-hover:rotate-45"
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
        <span class="relative">
          <span class="block">{{ `已连接到 ${client?.name}` }}</span>
          <span class="hidden group-hover:block">断开链接</span>
        </span>
      </div>
      <div v-else class="flex items-center gap-2">
        <svg
          class="w-6 h-6"
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
        <span>连接钱包</span>
      </div>
    </button>

    <!-- 已连接状态 -->
    <div v-if="isConnected" class="rounded-lg bg-white shadow-md">
      <div class="p-4">
        <!-- 地址列表 -->
        <div class="space-y-3 max-h-60 overflow-y-auto">
          <div
            v-for="(address, index) in addresses"
            :key="address"
            :class="[
              'p-3 rounded-lg transition-colors',
              index === selectedIndex
                ? 'bg-emerald-50 border border-emerald-200'
                : 'hover:bg-gray-50'
            ]"
            @click="selectedIndex = index"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="text-xs text-gray-500 mb-1">地址 #{{ index + 1 }}</div>
                <div class="font-mono text-sm flex items-center gap-2">
                  <span>{{ formatAddress(address) }}</span>
                  <button
                    @click="copyAddress(address)"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  >
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex mt-4 gap-2">
          <button
            @click="refresh"
            class="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200 font-medium"
          >
            刷新
          </button>
          <button
            @click="login"
            class="flex-1 py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition duration-200 font-medium"
          >
            立即登录
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
      <svg
        class="w-5 h-5 inline-block mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 21l-1.732-3 2.18-2.18A8.993 8.993 0 0118 9h-1.984c-.988 0-1.954.399-2.803 1.182l-2.18 2.18A8.993 8.993 0 016 9H4.984c-.988 0-1.954.399-2.803 1.182L.98 13.18l2.18 2.18A8.993 8.993 0 016 15h1.984c.988 0 1.954-.399 2.803-1.182l2.18-2.18m-1.414 2.18l-2.18 2.18"
        />
      </svg>
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
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
