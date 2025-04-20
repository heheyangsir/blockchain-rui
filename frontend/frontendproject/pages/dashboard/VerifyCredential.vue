<template>
  <div class="h-screen bg-gradient-to-b from-orange-50 to-gray-200 flex flex-col">
    <AppHeader />
    <div class="flex-1 overflow-y-auto p-4 mt-16">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="text-center">
          <h1 class="text-4xl font-extrabold text-gray-800 mb-2">✅ 凭证认证平台</h1>
          <p class="text-lg text-gray-500">链上凭证的权威认证中心</p>
        </div>

        <div v-if="!currentAddress" class="mb-12">
          <Connector />
        </div>

        <div v-else class="space-y-6">
          <!-- 当前账户 -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h2 class="text-xl font-semibold mb-2">👛 当前账户</h2>
            <p class="font-mono text-blue-600">{{ formattedAddress }}</p>
            <div v-if="!isAuthorized" class="mt-2 bg-red-100 border border-red-400 rounded p-2 text-red-700 text-sm">
              ⚠️ 当前账户不是官方授权人，无法进行官方认证
            </div>
          </div>

          <!-- 设置账户名称 -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h2 class="text-xl font-semibold mb-4">📝 设置账户名称</h2>
            <label for="accountName" class="block text-gray-700 mb-2 text-sm">名称</label>
            <input 
              id="accountName" 
              v-model="accountName" 
              placeholder="请输入名称"
              class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
            <div v-if="nameError" class="mt-1 text-red-500 text-sm">{{ nameError }}</div>
            <div v-if="nameSuccess" class="mt-2 bg-blue-100 border border-blue-400 rounded p-2 text-blue-700 text-sm">
              ✅ 名称已更新：{{ accountName }}
            </div>
            <button 
              @click="setName"
              class="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition duration-200 text-sm"
            >
              设置名称
            </button>
          </div>

          <!-- 添加官方认证人 -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h2 class="text-xl font-semibold mb-4">🛡️ 添加官方认证人</h2>
            <label for="authAddr" class="block text-gray-700 mb-2 text-sm">被授权地址</label>
            <input 
              id="authAddr" 
              v-model="authAddr" 
              placeholder="输入被授权地址"
              class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-orange-300"
            />
            <div v-if="authAddrError" class="mt-1 text-red-500 text-sm">{{ authAddrError }}</div>
            <div v-if="authSuccess" class="mt-2 bg-orange-100 border border-orange-400 rounded p-2 text-orange-700 text-sm">
              ✅ 授权成功：{{ authAddr }}
            </div>
            <button 
              @click="authorizeAccount"
              class="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition duration-200 text-sm"
            >
              添加授权
            </button>
          </div>

          <!-- 发起认证 -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h2 class="text-xl font-semibold mb-4">🧾 发起凭证认证</h2>
            <label for="txHash" class="block text-gray-700 mb-2 text-sm">交易哈希</label>
            <input 
              id="txHash" 
              v-model="txHash" 
              placeholder="输入交易哈希"
              class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-300"
            />
            <div v-if="txHashError" class="mt-1 text-red-500 text-sm">{{ txHashError }}</div>
            <div v-if="txResult" class="mt-2 bg-green-100 border border-green-400 rounded p-2 text-green-700 text-sm">
              ✅ 交易成功：{{ txResult }}
            </div>

            <label for="certificationLevel" class="block text-gray-700 mt-4 mb-2 text-sm">认证等级</label>
            <select 
              id="certificationLevel" 
              v-model="level" 
              class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-300"
              :disabled="!isAuthorized && level === 2"
            >
              <option :value="1">Peer 认证（普通用户）</option>
              <option :value="2" :disabled="!isAuthorized">Official 认证（官方授权）</option>
            </select>

            <button 
              @click="certify"
              class="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition duration-200 text-sm"
            >
              提交认证
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'nuxt/app';
import { useAccountStore } from '../../stores/account';
import { createPublicClient, createWalletClient, custom, http, type Chain } from 'viem';

// 导入合约 ABI（根据实际路径调整）
import { CredentialRegistryAbi } from '../../../../abi/CredentialRegistry'; 
import { networkInfo } from '../../stores/account';
import Connector from '../../components/Connector.vue';

const accountStore = useAccountStore();
const router = useRouter();

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// 表单数据
const txHash = ref<string>('');
const level = ref<number>(1);
const txResult = ref<string>('');

const accountName = ref<string>(''); 
const authAddr = ref<string>('');

// 错误/成功提示
const txHashError = ref<string>(''); 
const nameError = ref<string>(''); 
const authAddrError = ref<string>(''); 
const nameSuccess = ref<string>(''); 
const authSuccess = ref<string>(''); 

const isAuthorized = ref<boolean>(false);

// 当前地址（来自 Store）
const currentAddress = computed<string>(() => accountStore.accountAddress || '');

// 格式化地址
const formattedAddress = computed(() => {
  if (!currentAddress.value) return '';
  return formatAddress(currentAddress.value);
});

// 地址格式化函数
const formatAddress = (addr: string): string => 
  `${addr.slice(0, 8)}...${addr.slice(-6)}`;

// 初始化时检查是否是授权人
onMounted(async () => {
  if (currentAddress.value) {
    await checkAuthorization();
  }
});

// 检查是否是授权人
const checkAuthorization = async () => {
  try {
    const publicClient = createPublicClient({
      chain: networkInfo.currentChain as Chain,
      transport: http(networkInfo.rpcUrl),
    });
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'isAuthorized',
      args: [currentAddress.value as `0x${string}`],
    });
    isAuthorized.value = result as boolean;
  } catch (err) {
    txHashError.value = (err as Error).message || '检查授权失败';
  }
};

// 连接钱包按钮逻辑
const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('请安装 MetaMask 等钱包');
    }

    const walletClient = createWalletClient({
      chain: networkInfo.currentChain as Chain,
      transport: custom(window.ethereum),
    });
    const addresses = await walletClient.requestAddresses();
    if (addresses.length === 0) {
      throw new Error('未检测到钱包地址');
    }

    // 更新 Store 地址
    accountStore.setAccountAddress(addresses[0]);
    await checkAuthorization();

    // 重置错误
    txHashError.value = '';
    nameError.value = '';
    authAddrError.value = '';
    authSuccess.value = '';
    nameSuccess.value = '';
  } catch (err: any) {
    txHashError.value = err.message || '连接失败';
  }
};

// 认证功能
const certify = async () => {
  try {
    txHashError.value = '';
    txResult.value = '';
    if (!txHash.value) {
      txHashError.value = '请输入交易哈希';
      return;
    }

    const publicClient = createPublicClient({
      chain: networkInfo.currentChain as Chain,
      transport: http(networkInfo.rpcUrl),
    });
    const walletClient = createWalletClient({
      chain: networkInfo.currentChain as Chain,
      transport: custom(window.ethereum),
    });

    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash.value as `0x${string}`,
    });
    if (!receipt) {
      txHashError.value = '交易哈希无效';
      return;
    }

    const log = receipt.logs.find(log => 
      log.address.toLowerCase() === contractAddress.toLowerCase()
    );
    if (!log || !log.topics || log.topics.length < 2) {
      txHashError.value = '未找到凭证事件';
      return;
    }

    const credentialIndex = log.topics[1] ? parseInt(log.topics[1], 16) : 0;

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'certifyCredential',
      args: [credentialIndex, level.value],
      account: currentAddress.value as `0x${string}`,
    });

    const hash = await walletClient.writeContract(request);
    txResult.value = hash;
  } catch (err: any) {
    txHashError.value = err.message || '认证失败';
  }
};

// 设置名称
const setName = async () => {
  try {
    nameError.value = '';
    nameSuccess.value = '';
    if (!accountName.value) {
      nameError.value = '请输入名称';
      return;
    }

    const publicClient = createPublicClient({
      chain: networkInfo.currentChain as Chain,
      transport: http(networkInfo.rpcUrl),
    });
    const walletClient = createWalletClient({
      chain: networkInfo.currentChain as Chain,
      transport: custom(window.ethereum),
    });

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'setAccountName',
      args: [accountName.value],
      account: currentAddress.value as `0x${string}`,
    });

    const hash = await walletClient.writeContract(request);
    nameSuccess.value = hash;
  } catch (err) {
    nameError.value = (err as Error).message;
  }
};

// 添加授权
const authorizeAccount = async () => {
  try {
    authAddrError.value = '';
    authSuccess.value = '';
    if (!authAddr.value || !/^0x[a-fA-F0-9]{40}$/.test(authAddr.value)) {
      authAddrError.value = '请输入有效的地址';
      return;
    }

    const publicClient = createPublicClient({
      chain: networkInfo.currentChain as Chain,
      transport: http(networkInfo.rpcUrl),
    });
    const walletClient = createWalletClient({
      chain: networkInfo.currentChain as Chain,
      transport: custom(window.ethereum),
    });

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'setAuthorizedEntity',
      args: [authAddr.value as `0x${string}`, true],
      account: currentAddress.value as `0x${string}`,
    });

    const hash = await walletClient.writeContract(request);
    authSuccess.value = hash;
  } catch (err) {
    authAddrError.value = (err as Error).message;
  }
};
</script>