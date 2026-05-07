<template>
  <div class="space-y-6">
    <!-- 标题 -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-stone-900 tracking-tight">连接钱包</h2>
      <p class="mt-1 text-sm text-stone-500">开始您的链上之旅</p>
    </div>

    <!-- 钱包连接按钮 -->
    <button
      @click="handleWalletConnect"
      :class="[
        isConnected
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30'
          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30',
        'group w-full py-3.5 px-6 rounded-xl font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 active:scale-[0.98]',
        'flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
      ]"
      :disabled="!!error"
    >
      <div v-if="isConnected" class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ `已连接到 ${client?.name}` }}</span>
      </div>
      <div v-else class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>连接钱包</span>
      </div>
    </button>

    <!-- 已连接状态 -->
    <div v-if="isConnected" class="rounded-xl bg-stone-50/50 border border-stone-100 p-4 space-y-3">
      <!-- 地址列表 -->
      <div class="max-h-52 overflow-y-auto space-y-2 pr-1">
        <div
          v-for="(address, index) in addresses"
          :key="address"
          :class="[
            index === selectedIndex
              ? 'bg-amber-50 border-amber-200'
              : 'bg-white border-transparent hover:bg-stone-50 hover:border-stone-200',
            'p-3 rounded-lg border transition-all cursor-pointer'
          ]"
          @click="selectedIndex = index"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="text-xs text-stone-400 mb-0.5">地址 #{{ index + 1 }}</div>
              <div class="font-mono text-sm text-stone-700 flex items-center gap-2 truncate">
                <span>{{ formatAddress(address) }}</span>
                <button
                  @click.stop="copyAddress(address)"
                  class="flex-shrink-0 p-1 text-stone-400 hover:text-amber-600 transition-colors rounded"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 pt-2">
        <button
          @click="refresh"
          class="flex-1 py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg transition duration-200 font-medium text-sm"
        >
          刷新地址
        </button>
        <button
          @click="login"
          class="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition duration-200 font-medium text-sm shadow-md shadow-amber-500/20"
        >
          确认登录
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg flex items-start gap-2">
      <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 21l-1.732-3 2.18-2.18A8.993 8.993 0 0118 9h-1.984c-.988 0-1.954.399-2.803 1.182l-2.18 2.18A8.993 8.993 0 016 9H4.984c-.988 0-1.954.399-2.803 1.182L.98 13.18l2.18 2.18A8.993 8.993 0 016 15h1.984c.988 0 1.954-.399 2.803-1.182l2.18-2.18m-1.414 2.18l-2.18 2.18" />
      </svg>
      <span>{{ error }}</span>
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
