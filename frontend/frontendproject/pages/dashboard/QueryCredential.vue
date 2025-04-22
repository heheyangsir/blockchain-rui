<template>
  <div class="h-screen bg-gradient-to-b from-orange-50 to-gray-200 flex flex-col">
    <AppHeader />
    <div class="flex-1 overflow-y-auto mt-16 p-6">
      <div class="max-w-4xl mx-auto space-y-10">

        <!-- 顶部标题 -->
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
            🔍 查询凭证
          </h1>
          <p class="text-gray-500 mt-2">
            输入地址 / 文件 / 交易哈希 / 用户名，任意方式即可查询
          </p>
        </div>

        <!-- 连接钱包组件 -->
          <Connector />


        <!-- 查询方式选择按钮 -->
        <div class="flex justify-between">
          <button
            @click="switchToQueryMode"
            :class="isFileUploadMode ? 'bg-gray-300 text-gray-600' : 'bg-orange-500 text-white'"
            class="w-full py-3 rounded-lg text-lg hover:bg-orange-600 transition shadow-md"
          >
            输入查询
          </button>
          <button
            @click="switchToFileUploadMode"
            :class="!isFileUploadMode ? 'bg-gray-300 text-gray-600' : 'bg-orange-500 text-white'"
            class="w-full py-3 rounded-lg text-lg hover:bg-orange-600 transition shadow-md"
          >
            文件上传查询
          </button>
        </div>

        <!-- 查询框 -->
        <div v-if="!isFileUploadMode" class="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">查询内容</label>
            <input
              v-model="queryInput"
              @input="clear"
              placeholder="📥 地址 / 交易哈希 / 用户名"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          <button
            @click="handleQuery"
            :disabled="loading"
            class="w-full bg-orange-500 text-white py-3 rounded-lg text-lg hover:bg-orange-600 transition shadow-md"
          >
            {{ loading ? '查询中...' : '🚀 开始查询' }}
          </button>
        </div>

        <!-- 文件上传框 -->
        <div v-if="isFileUploadMode" class="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">📎 选择文件</label>
            <input
              type="file"
              @change="handleFileChange"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          <button
            @click="handleQuery"
            :disabled="loading"
            class="w-full bg-orange-500 text-white py-3 rounded-lg text-lg hover:bg-orange-600 transition shadow-md"
          >
            {{ loading ? '查询中...' : '🚀 开始查询' }}
          </button>
        </div>

        <!-- 查询结果 -->
        <div v-if="results.length" class="space-y-6">
          <div
            v-for="(cred, index) in results"
            :key="index"
            class="bg-white border-l-4 border-orange-400 p-5 rounded-xl shadow-md"
          >
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div class="font-medium">📛 名称</div>
              <div>{{ cred.name }}</div>

              <div class="font-medium">🧬 CID</div>
              <div class="truncate text-blue-600">{{ cred.cid }}</div>

              <div class="font-medium">🧑‍💼 持有者昵称</div>
              <div class="truncate text-blue-600">{{ cred.ownerName }}</div>

              <div class="font-medium">🏠 持有者地址</div>
              <div class="truncate text-blue-600">{{ cred.owner }}</div>

              <div class="font-medium">✅ 认证等级</div>
              <div class="capitalize">{{ formatCertification(cred.certification) }}</div>

              <div class="font-medium">🔏 认证人</div>
              <div class="truncate text-blue-600">{{ cred.certifiedBy }}</div>

              <div class="font-medium">⛔ 是否失效</div>
              <div :class="cred.expired ? 'text-red-500' : 'text-green-600'">
                {{ cred.expired ? '是' : '否' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="bg-red-100 border border-red-400 rounded p-4 text-red-700 mt-4">
          ⚠️ {{ error }}
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center mt-4">
          <svg
            class="animate-spin h-8 w-8 text-orange-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </div>

      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue'
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { CredentialRegistryAbi } from '../../../../abi/CredentialRegistry'
import { hardhat } from 'viem/chains'

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const publicClient = createPublicClient({ chain: hardhat, transport: http() })

const addresses = ref<string[]>([])
const walletClient = ref<any>(null)
const isConnected = ref(false)
const accountName = ref<string | null>(null);

const queryInput = ref('')
const fileData = ref<File | null>(null)
const expectingFile = ref(false)
const results = ref<any[]>([])
const error = ref('')
const loading = ref(false)
const isFileUploadMode = ref(false)

const switchToQueryMode = () => {
  isFileUploadMode.value = false
  queryInput.value = ''  // 清空输入框内容
}

const switchToFileUploadMode = () => {
  isFileUploadMode.value = true
  fileData.value = null  // 清空已选择的文件
}

const formattedAddress = computed(() => {
  return addresses.value[0] ? `${addresses.value[0].slice(0, 8)}...${addresses.value[0].slice(-6)}` : '';
});

const connect = async () => {
  const ethereum = (window as any).ethereum
  if (!ethereum) return
  walletClient.value = createWalletClient({ chain: hardhat, transport: custom(ethereum) })
  addresses.value = await walletClient.value.requestAddresses()
  isConnected.value = addresses.value.length > 0
  if (isConnected.value) {
    await fetchAccountName()
  }
}

const clear = () => {
  error.value = ''
  results.value = []
  expectingFile.value = queryInput.value.trim().toLowerCase() === 'file'
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  fileData.value = input.files?.[0] || null
}

const handleQuery = async () => {
  error.value = ''
  results.value = []
  loading.value = true

  try {
    const input = queryInput.value.trim()

    if (input.toLowerCase() === 'file' || fileData.value) {
      if (!fileData.value) throw new Error('请先选择文件')
      const form = new FormData()
      form.append('file', fileData.value)
      const res = await fetch('http://localhost:5001/api/v0/add', { method: 'POST', body: form })
      const text = await res.text()
      const match = text.match(/"Hash":"([^"]+)"/)
      const fileCid = match?.[1]
      if (!fileCid) throw new Error('CID 提取失败')

      const total = await publicClient.readContract({
        address: contractAddress,
        abi: CredentialRegistryAbi,
        functionName: 'totalCredentials',
      }) as number

      for (let i = 0; i < total; i++) {
        const cred = await publicClient.readContract({
          address: contractAddress,
          abi: CredentialRegistryAbi,
          functionName: 'getCredential',
          args: [BigInt(i)],
        }) as any

        const metadataRes = await fetch(`http://localhost:8080/ipfs/${cred.cid}`)
        const metadata = await metadataRes.json()
        if (metadata.fileCid === fileCid) {
          results.value.push(cred)
        }
      }
      if (!results.value.length) throw new Error('未找到该文件对应的凭证')
    }

    else if (input.length === 66 && input.startsWith('0x')) {
      const tx = await publicClient.getTransactionReceipt({ hash: input as `0x${string}` })

      const log = tx.logs.find(log =>
        log.address.toLowerCase() === contractAddress.toLowerCase() &&
        Array.isArray(log.topics) &&
        log.topics.length > 1 &&
        typeof log.topics[1] === 'string'
      )

      if (!log || !log.topics || log.topics.length < 2 || !log.topics[1]) {
        throw new Error('未能解析凭证索引')
      }

      // 安全转换为 BigInt
      const indexHex = log.topics[1]
      const index = BigInt(indexHex)

      const cred = await publicClient.readContract({
        address: contractAddress,
        abi: CredentialRegistryAbi,
        functionName: 'getCredential',
        args: [index],
      }) as any

      results.value.push(cred)
    }


    else if (input.length === 42 && input.startsWith('0x')) {
      const creds = await publicClient.readContract({
        address: contractAddress,
        abi: CredentialRegistryAbi,
        functionName: 'getByOwner',
        args: [input as `0x${string}`],
      }) as any[]
      if (!creds.length) throw new Error('该地址下无凭证')
      results.value = creds
    }

    else {
      const creds = await publicClient.readContract({
        address: contractAddress,
        abi: CredentialRegistryAbi,
        functionName: 'getByName',
        args: [input],
      }) as any[]
      if (!creds.length) throw new Error('该用户名称下无凭证')
      results.value = creds
    }
    await fetchNamesForResults()

  } catch (err: any) {
    error.value = err.message || '查询失败'
  } finally {
    loading.value = false
  }
}

const formatCertification = (level: number) => {
  switch (level) {
    case 0: return '未认证'
    case 1: return '他人认证'
    case 2: return '官方认证'
    default: return '未知'
  }
}

const fetchNamesForResults = async () => {
  for (const cred of results.value) {
    try {
      const name = await publicClient.readContract({
        address: contractAddress,
        abi: CredentialRegistryAbi,
        functionName: 'getAccountName',
        args: [cred.owner as `0x${string}`],
      }) as string
      cred.ownerName = name
      console.log(`Fetched owner name for ${cred.owner}: ${cred.ownerName}`)
    } catch {
      cred.ownerName = '未命名账户'
      console.log(`Failed to fetch owner name for ${cred.owner}`)
    }
  }
}
</script>
