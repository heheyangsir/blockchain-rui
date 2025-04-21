<template>
  <div class="h-screen bg-gradient-to-b from-orange-50 to-gray-200 flex flex-col">
    <AppHeader />
    <div class="flex-1 overflow-y-auto p-4 mt-16">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="text-center">
          <h1 class="text-4xl font-extrabold text-gray-800 mb-2">📄 凭证管理首页</h1>
          <p class="text-lg text-gray-500">查看您的钱包信息和已上传的凭证</p>
        </div>

        <div v-if="!currentAddress" class="bg-yellow-50 border border-yellow-400 rounded-2xl p-6 shadow-xl">
          <div class="flex items-center gap-3 mb-4">
            <p class="text-yellow-700 text-2xl font-semibold">⚠️ 钱包未连接</p>
          </div>
          <p class="text-yellow-600 mb-4">请通过 MetaMask 或其他钱包连接您的账户</p>
          <button @click="connectWallet"
            class="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow transition duration-300 text-lg">
            🔗 连接钱包
          </button>
        </div>

        <div v-else class="space-y-6">
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <div class="flex items-center justify-between flex-wrap">
              <!-- 左侧信息 -->
              <div>
                <h2 class="text-xl font-semibold mb-1">你好 {{ accountName }}</h2>
                <p class="text-gray-500">{{ formattedAddress }}</p>
              </div>

              <!-- 右侧按钮区域 -->
              <div
                class="flex flex-col space-y-4 sm:space-y-0 sm:space-x-4 sm:flex-row w-full sm:w-auto justify-end mt-4 sm:mt-0">
                <!-- 刷新凭证日志按钮 -->
                <button @click="refreshCredentials"
                  class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md transition duration-300 w-full sm:w-auto flex items-center justify-center">
                  🔄 刷新凭证日志
                </button>

                <!-- 断开钱包按钮 -->
                <button @click="disconnectWallet"
                  class="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition duration-200 text-sm flex items-center justify-center w-full sm:w-auto space-x-2 mt-4 sm:mt-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" class="text-white">
                    <path fill="currentColor"
                      d="M43.634 4.366a1.25 1.25 0 0 1 0 1.768l-4.913 4.913a9.253 9.253 0 0 1-.744 12.244l-3.343 3.343a1.25 1.25 0 0 1-1.768 0l-11.5-11.5a1.25 1.25 0 0 1 0-1.768l3.343-3.343a9.25 9.25 0 0 1 12.244-.743l4.913-4.914a1.25 1.25 0 0 1 1.768 0M9.28 36.953l-4.914 4.913a1.25 1.25 0 0 0 1.768 1.768l4.913-4.913a9.253 9.253 0 0 0 12.244-.744l3.343-3.343a1.25 1.25 0 0 0 0-1.768L25.268 31.5l3.366-3.366a1.25 1.25 0 0 0-1.768-1.768L23.5 29.732L18.268 24.5l3.366-3.366a1.25 1.25 0 0 0-1.768-1.768L16.5 22.732l-1.366-1.366a1.25 1.25 0 0 0-1.768 0l-3.343 3.343a9.25 9.25 0 0 0-.743 12.244" />
                  </svg>
                  <span>断开钱包</span>
                </button>
              </div>
            </div>
          </div>


          <div class="bg-yellow-100 rounded-2xl shadow-xl p-6" v-if="!accountName">
            <div class="flex items-center justify-between flex-wrap">
              <!-- 左侧信息 -->
              <div>
                <h2 class="text-xl font-semibold mb-1 ">为数字账户设置友好名称</h2>
              </div>

              <!-- 右侧按钮区域 -->
              <div
                class="flex flex-col space-y-4 sm:space-y-0 sm:space-x-4 sm:flex-row w-full sm:w-auto justify-end mt-4 sm:mt-0">
                <!-- 刷新凭证日志按钮 -->
                <button @click="router.push({ path: '/dashboard/VerifyCredential' })"
                  class="px-4 py-2 bg-gradient-to-r bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition duration-300 w-full sm:w-auto flex items-center justify-center">
                  去设置
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h2 class="text-xl font-semibold mb-4">📜 上链上传记录</h2>
            <div v-if="credentials.length === 0" class="text-gray-500">暂无凭证上传记录</div>
            <div v-else class="space-y-4">
              <div v-for="cred in credentials" :key="cred.txHash" class="p-4 bg-gray-50 rounded-xl shadow-sm">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="font-semibold">📁 CID</div>
                  <div>{{ cred.cid }}</div>
                  <div class="font-semibold">📌 名称</div>
                  <div>{{ cred.name }}</div>
                  <div class="font-semibold">🔗 交易哈希</div>
                  <div class="flex items-center space-x-2">
                    <div class="truncate text-blue-600">{{ cred.txHash }}</div>
                    <button @click="copyToClipboard(cred.txHash)"
                      class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        class="text-white">
                        <path fill="currentColor"
                          d="M13 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 1.99 2h12c1.1 0 1.99-.9 1.99-2V9l-5-5zM5 19V5h8v6h6v8H5z">
                        </path>
                      </svg>
                    </button>
                  </div>
                  <div class="font-semibold">📦 区块高度</div>
                  <div>{{ cred.blockNumber }}</div>
                  <div class="font-semibold">🕒 上传时间</div>
                  <div>{{ formatTimestamp(cred.blockTimestamp) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="error" class="mt-6 bg-red-100 border border-red-400 rounded-xl p-4 text-red-700 text-sm">
            ⚠️ {{ error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAccountStore } from '../../stores/account';
import { createPublicClient, createWalletClient, custom, http, encodeEventTopics, decodeEventLog } from 'viem';
import { CredentialRegistryAbi } from '../../../../abi/CredentialRegistry';
import { networkInfo } from '../../stores/account';
import type { Address } from 'viem';
import { useRouter } from 'vue-router';

interface CredentialLog {
  cid: string;
  name: string;
  owner: Address;
  blockNumber: number;
  blockTimestamp: number;
  txHash: string;
}

const router = useRouter();
const accountStore = useAccountStore();
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address;

const currentAddress = computed(() => accountStore.accountAddress || '');
const formattedAddress = computed(() =>
  currentAddress.value ? `${currentAddress.value.slice(0, 8)}...${currentAddress.value.slice(-6)}` : ''
);

const credentials = ref<CredentialLog[]>([]);
const error = ref<string>('');

const publicClient = createPublicClient({ chain: networkInfo.currentChain, transport: http(networkInfo.rpcUrl) });

const formatTimestamp = (ts: number) => new Date(ts * 1000).toLocaleString();

const accountName = ref<string | null>(null);

const fetchCredentials = async () => {
  error.value = '';
  credentials.value = [];

  if (!currentAddress.value) return;

  try {
    // 获取事件 topics
    const topics = encodeEventTopics({ abi: CredentialRegistryAbi, eventName: 'CredentialStored', args: [] });

    const logs = await publicClient.getLogs({
      address: contractAddress,
      fromBlock: 'earliest',
      toBlock: 'latest',
      topics,
    });

    const parsed: CredentialLog[] = [];
    for (const log of logs) {
      // 解码日志并断言 args 类型
      const evt = decodeEventLog({ abi: CredentialRegistryAbi, eventName: 'CredentialStored', data: log.data, topics: log.topics }) as {
        args: { cid: string; name: string; owner: Address };
      };
      if (!evt.args || !evt.args.cid || !evt.args.owner) continue;
      const { cid, name, owner } = evt.args;
      if (owner.toLowerCase() !== currentAddress.value.toLowerCase()) continue;

      // 获取区块时间戳
      const block = await publicClient.getBlock({ blockNumber: log.blockNumber as bigint });
      parsed.push({
        cid,
        name,
        owner,
        blockNumber: Number(log.blockNumber),
        blockTimestamp: Number(block.timestamp),
        txHash: log.transactionHash as string,
      });
    }

    credentials.value = parsed;
  } catch (err: any) {
    error.value = err.message || '读取交易日志失败';
  }
};

const connectWallet = async () => {
  try {
    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error('请安装 MetaMask');
    const walletClient = createWalletClient({ chain: networkInfo.currentChain, transport: custom(ethereum) });
    const addrs = await walletClient.requestAddresses();
    if (!addrs.length) throw new Error('未检测到地址');
    accountStore.setAccountAddress(addrs[0]);
    await fetchCredentials();
  } catch (err: any) {
    error.value = err.message;
  }
};

const disconnectWallet = () => {
  accountStore.disconnect();
  credentials.value = [];
};

const refreshCredentials = fetchCredentials;

// 复制到剪贴板
const copyToClipboard = (txHash: string) => {
  navigator.clipboard.writeText(txHash).then(() => {
    alert('交易哈希已复制到剪贴板！');
  }).catch((err) => {
    alert('复制失败，请重试！');
  });
};

watch(currentAddress, (newAddr) => {
  if (newAddr) fetchCredentials();
  else credentials.value = [];
});

onMounted(async () => {
  if (currentAddress.value) fetchCredentials();

  try {
    accountName.value = await publicClient.readContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'getAccountName',
      args: [currentAddress.value as `0x${string}`],
    }) as string;
  } catch (err) {
    console.error('获取用户名称失败:', err);
  }
});
</script>
