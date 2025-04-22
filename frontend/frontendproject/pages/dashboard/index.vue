<template>
  <div class="h-screen bg-gradient-to-b from-orange-50 to-gray-200 flex flex-col relative">
    <AppHeader />
    <div class="flex-1 overflow-y-auto p-4 mt-16">
      <div class="max-w-5xl mx-auto space-y-6">
        <!-- 页面标题 -->
        <div class="text-center">
          <h1 class="text-4xl font-extrabold text-gray-800 mb-2">📄 凭证管理首页</h1>
          <p class="text-lg text-gray-500">查看您的钱包信息和已上传的凭证</p>
        </div>

        <!-- 未连接钱包提示 -->
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

        <!-- 已连接钱包内容 -->
        <div v-else class="space-y-6">
          <!-- 用户信息 & 操作按钮 -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <div class="flex flex-wrap items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold mb-1">你好 {{ accountName }}</h2>
                <p class="text-gray-500">{{ formattedAddress }}</p>
              </div>
              <div class="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 w-full sm:w-auto mt-4 sm:mt-0">
                <button @click="refreshCredentials"
                  class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md transition duration-300 w-full sm:w-auto">
                  🔄 刷新凭证日志
                </button>
                <button @click="disconnectWallet"
                  class="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md transition duration-300 w-full sm:w-auto">
                  断开钱包
                </button>
              </div>
            </div>
          </div>

          <!-- 设置账户名称 -->
          <div v-if="!accountName" class="bg-yellow-100 rounded-2xl shadow-xl p-6">
            <div class="flex justify-between items-center flex-wrap">
              <h2 class="text-xl font-semibold mb-1">为数字账户设置友好名称</h2>
              <button @click="navigateToVerify"
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md transition duration-300">
                去设置
              </button>
            </div>
          </div>

          <!-- 上链上传记录 -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h2 class="text-xl font-semibold mb-4">📜 上链上传记录</h2>
            <div v-if="credentials.length === 0" class="text-gray-500">暂无凭证上传记录</div>
            <div v-else class="space-y-4">
              <div v-for="cred in credentials" :key="cred.txHash" class="p-4 bg-gray-50 rounded-xl shadow-sm">
                <div class="grid grid-cols-2 gap-4 text-sm items-center">
                  <div class="font-semibold">📌 名称</div>
                  <div>{{ cred.name }}</div>
                  <div class="font-semibold">🕒 上传时间</div>
                  <div>{{ formatTimestamp(cred.blockTimestamp) }}</div>
                  <div class="font-semibold">⛔ 是否失效</div>
                  <div :class="cred.expired ? 'text-red-500' : 'text-green-600'">{{ cred.expired ? '是' : '否' }}</div>
                </div>
                <div class="mt-4 text-right">
                  <button @click="openModal(cred)"
                    class="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm text-sm">
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="mt-6 bg-red-100 border border-red-400 rounded-xl p-4 text-red-700 text-sm">
            ⚠️ {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- 左侧滑出详情面板（留空上、下边距） -->
    <div
      class="fixed left-0 top-20 bottom-20 w-[40rem] bg-white rounded-r-2xl shadow-2xl z-50 p-6 overflow-auto transform transition-transform"
      :class="showModal ? 'translate-x-0' : '-translate-x-full'">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">凭证详情</h3>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
      </div>
      <div v-if="selectedCredential" class="space-y-2 text-sm text-gray-700">
        <p><span class="font-medium">📁 CID：</span>{{ selectedCredential.cid }}</p>
        <p><span class="font-medium">📌 名称：</span>{{ selectedCredential.name }}</p>
        <p><span class="font-medium">👤 拥有者昵称：</span>{{ accountName }}</p>
        <p><span class="font-medium">🏠 拥有者地址：</span>{{ selectedCredential.owner }}</p>
        <p><span class="font-medium">🔗 交易哈希：</span>{{ selectedCredential.txHash }}</p>
        <p><span class="font-medium">📦 区块高度：</span>{{ selectedCredential.blockNumber }}</p>
        <p><span class="font-medium">🕒 上传时间：</span>{{ formatTimestamp(selectedCredential.blockTimestamp) }}</p>
        <p>
          <span class="font-medium">⛔ 是否失效：</span>
          <span :class="selectedCredential.expired ? 'text-red-500' : 'text-green-600'">{{ selectedCredential.expired ?
            '是' : '否' }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountStore } from '../../stores/account';
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  encodeEventTopics,
  decodeEventLog,
} from 'viem';
import { CredentialRegistryAbi } from '../../../../abi/CredentialRegistry';
import { networkInfo } from '../../stores/account';
import type { Address } from 'viem';

// 接口定义
interface CredentialLog {
  cid: string;
  name: string;
  owner: Address;
  blockNumber: number;
  blockTimestamp: number;
  txHash: string;
  expired: boolean;
}

// 路由、状态管理
const router = useRouter();
const navigateToVerify = () => router.push({ path: '/dashboard/VerifyCredential' });
const accountStore = useAccountStore();

// 合约地址 & 客户端
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address;
const publicClient = createPublicClient({ chain: networkInfo.currentChain, transport: http(networkInfo.rpcUrl) });

// 响应式数据
const currentAddress = computed(() => accountStore.accountAddress || '');
const formattedAddress = computed(() => currentAddress.value
  ? `${currentAddress.value.slice(0, 8)}...${currentAddress.value.slice(-6)}`
  : ''
);
const accountName = ref<string | null>(null);
const credentials = ref<CredentialLog[]>([]);
const error = ref<string>('');

// 弹窗逻辑
const selectedCredential = ref<CredentialLog | null>(null);
const showModal = ref(false);
const openModal = (cred: CredentialLog) => {
  selectedCredential.value = cred;
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
  selectedCredential.value = null;
};

// 时间格式化
const formatTimestamp = (ts: number) => new Date(ts * 1000).toLocaleString();

// 拉取凭证
const fetchCredentials = async () => {
  error.value = '';
  credentials.value = [];
  if (!currentAddress.value) return;
  try {
    const topics = encodeEventTopics({ abi: CredentialRegistryAbi, eventName: 'CredentialStored', args: [] });
    const logs = await publicClient.getLogs({ address: contractAddress, fromBlock: 'earliest', toBlock: 'latest', topics });
    const parsed: CredentialLog[] = [];
    for (const log of logs) {
      const evt = decodeEventLog({
        abi: CredentialRegistryAbi,
        eventName: 'CredentialStored',
        data: log.data,
        topics: log.topics,
      }) as any;

      if (!evt.args?.cid || !evt.args?.owner) continue;
      if (evt.args.owner.toLowerCase() !== currentAddress.value.toLowerCase()) continue;

      const id = Number(evt.args.id);  // 新增：提取 id
      const block = await publicClient.getBlock({ blockNumber: log.blockNumber as bigint });

      // 读取链上 credential 获取 expired 状态
      const credOnChain = await publicClient.readContract({
        address: contractAddress,
        abi: CredentialRegistryAbi,
        functionName: 'getCredential',
        args: [BigInt(id)],
      });

      parsed.push({
        cid: evt.args.cid,
        name: evt.args.name,
        owner: evt.args.owner,
        blockNumber: Number(log.blockNumber),
        blockTimestamp: Number(block.timestamp),
        txHash: log.transactionHash as string,
        expired: credOnChain.expired,  // 来自链上数据
      });
    }

    credentials.value = parsed;
  } catch (err: any) {
    error.value = err.message || '读取交易日志失败';
  }
};

// 钱包连接 & 断开
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

// 监听地址变化
watch(currentAddress, (newAddr) => {
  if (newAddr) fetchCredentials();
  else credentials.value = [];
});

// 初始化
onMounted(async () => {
  if (currentAddress.value) await fetchCredentials();
  try {
    accountName.value = (await publicClient.readContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'getAccountName',
      args: [currentAddress.value as `0x${string}`],
    })) as string;
  } catch {
    // 忽略错误
  }
});
</script>
