<template>
  <div class="h-screen bg-gradient-to-b from-orange-50 to-gray-200 flex flex-col">
    <AppHeader />

    <main class="flex-1 overflow-y-auto pt-24 pb-16">
      <div class="max-w-5xl w-full mx-auto px-6 space-y-10">
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
        <div class="flex justify-between gap-4">
          <button @click="switchToQueryMode"
            :class="isFileUploadMode ? 'bg-gray-300 text-gray-600' : 'bg-orange-500 text-white'"
            class="w-full py-3 rounded-lg text-lg hover:bg-orange-600 transition shadow-md">
            输入查询
          </button>
          <button @click="switchToFileUploadMode"
            :class="!isFileUploadMode ? 'bg-gray-300 text-gray-600' : 'bg-orange-500 text-white'"
            class="w-full py-3 rounded-lg text-lg hover:bg-orange-600 transition shadow-md">
            文件上传查询
          </button>
        </div>

        <!-- 输入查询表单 -->
        <section v-if="!isFileUploadMode" class="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-4">
          <label class="block text-sm text-gray-600 mb-1">查询内容</label>
          <input v-model="queryInput" @input="clear" placeholder="📥 地址 / 交易哈希 / 用户名"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
          <button @click="handleQuery" :disabled="loading"
            class="w-full bg-orange-500 text-white py-3 rounded-lg text-lg hover:bg-orange-600 transition shadow-md">
            {{ loading ? '查询中...' : '🚀 开始查询' }}
          </button>
        </section>

        <!-- 文件上传查询表单 -->
        <section v-if="isFileUploadMode" class="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-4">
          <label class="block text-sm text-gray-600 mb-1">📎 选择文件</label>
          <input type="file" @change="handleFileChange"
            class="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm 
                   file:mr-4 file:py-2 file:px-4 file:rounded-full 
                   file:border-0 file:bg-blue-600 file:text-white 
                   hover:file:bg-blue-700 transition" />
          <button @click="handleQuery" :disabled="loading"
            class="w-full bg-orange-500 text-white py-3 rounded-lg text-lg hover:bg-orange-600 transition shadow-md">
            {{ loading ? '查询中...' : '🚀 开始查询' }}
          </button>
        </section>

        <!-- 查询结果展示 -->
        <div v-if="results.length" class="space-y-6">
          <div v-for="(cred, index) in results" :key="index"
            class="bg-white border-l-4 border-orange-400 p-6 rounded-2xl shadow-md">
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div class="font-medium">📌 名称</div>
              <div>{{ cred.name }}</div>
              <div class="font-medium">📁 CID</div>
              <div class="truncate text-blue-600">{{ cred.cid }}</div>
              <div class="font-medium">👤 拥有者昵称</div>
              <div class="truncate text-blue-600">{{ cred.ownerName }}</div>
              <div class="font-medium">✅ 认证等级</div>
              <div class="capitalize">{{ formatCertification(cred.certification) }}</div>
              <div class="font-medium">🔑 认证人昵称</div>
              <div class="truncate text-blue-600">{{ cred.certifierName || '未命名认证人' }}</div>
              <div class="font-medium">⛔ 是否失效</div>
              <div :class="cred.expired ? 'text-red-500' : 'text-green-600'">
                {{ cred.expired ? '是' : '否' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <p v-if="error" class="bg-red-100 border border-red-400 rounded p-4 text-red-700 text-sm text-center shadow">
          ⚠️ {{ error }}
        </p>

        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center">
          <svg class="animate-spin h-8 w-8 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      </div>
    </main>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { createPublicClient, http } from 'viem'
import { CredentialRegistryAbi } from '../../../../abi/CredentialRegistry'
import { hardhat } from 'viem/chains'

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const publicClient = createPublicClient({ chain: hardhat, transport: http() })

const queryInput = ref('')
const fileData = ref<File | null>(null)
const expectingFile = ref(false)
const results = ref<any[]>([])
const error = ref('')
const loading = ref(false)
const isFileUploadMode = ref(false)

const switchToQueryMode = () => {
  isFileUploadMode.value = false
  queryInput.value = ''
}

const switchToFileUploadMode = () => {
  isFileUploadMode.value = true
  fileData.value = null
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

      const certifierName = await publicClient.readContract({
        address: contractAddress,
        abi: CredentialRegistryAbi,
        functionName: 'getAccountName',
        args: [cred.certifiedBy as `0x${string}`],
      }) as string
      cred.certifierName = certifierName
      console.log(`Fetched certifier name for ${cred.certifiedBy}: ${cred.certifierName}`)
    } catch {
      cred.ownerName = '未命名账户'
      cred.certifierName = '未命名账户'
      console.log(`Failed to fetch owner name for ${cred.owner}`)
    }
  }
}
</script>
