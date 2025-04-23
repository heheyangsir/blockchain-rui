<template>
  <div class="h-screen bg-gradient-to-b from-orange-50 to-gray-200 flex flex-col">
    <AppHeader />

    <div class="flex-1 overflow-y-auto pt-24 pb-16 px-6">
      <div class="max-w-4xl mx-auto">
        <!-- 标题区域 -->
        <div class="text-center mb-10">
          <h1 class="text-4xl font-extrabold text-gray-800 mb-2">❌ 标记凭证为失效</h1>
          <p class="text-lg text-gray-500">你只能标记自己拥有或认证的凭证，或你是管理员</p>
        </div>

        <!-- 钱包连接 -->
        <Connector />

        <div class="flex justify-between">
          <button @click="switchToQueryMode"
            :class="isFileUploadMode ? 'bg-gray-200 text-gray-700' : 'bg-purple-500 text-white'"
            class="w-full py-3 rounded-lg text-lg hover:bg-purple-600 transition shadow-md">
            输入查询
          </button>
          <button @click="switchToFileUploadMode"
            :class="!isFileUploadMode ? 'bg-gray-200 text-gray-700' : 'bg-purple-500 text-white'"
            class="w-full py-3 rounded-lg text-lg hover:bg-purple-600 transition shadow-md">
            文件上传查询
          </button>
        </div>

        <!-- 查询输入 -->
        <div v-if="!isFileUploadMode" class="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6 mt-8">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">🔍 凭证标识符</label>
            <input v-model="queryInput" @input="clear" placeholder="交易哈希 / 文件上传"
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>

          <button @click="locateCredential" :disabled="loading" class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 
                   text-white text-lg font-semibold py-3 rounded-xl shadow-md transition duration-300">
            {{ loading ? '⏳ 正在解析...' : '🎯 定位凭证' }}
          </button>
        </div>

        <div v-if="isFileUploadMode" class="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6 mt-8">
          <div v-if="isFileUploadMode">
            <label class="block text-gray-700 font-semibold mb-2">📎 上传原始文件</label>
            <input type="file" @change="handleFileChange" class="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm 
                     file:mr-4 file:py-2 file:px-4 file:rounded-full 
                     file:border-0 file:bg-blue-600 file:text-white 
                     hover:file:bg-blue-700 transition" />
          </div>

          <button @click="locateCredential" :disabled="loading" class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 
                   text-white text-lg font-semibold py-3 rounded-xl shadow-md transition duration-300">
            {{ loading ? '⏳ 正在解析...' : '🎯 定位凭证' }}
          </button>
        </div>

        <!-- 凭证信息 -->
        <section v-if="targetCredential"
          class="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-4 mt-8 text-sm">
          <div class="grid grid-cols-2 gap-4">
            <div class="font-semibold">📌 名称</div>
            <div>{{ targetCredential.name }}</div>

            <div class="font-semibold">拥有者昵称</div>
            <div class="text-blue-600 truncate">{{ targetCredential.ownerName }}</div>

            <div class="font-semibold">🔑 认证人昵称</div>
            <div class="text-blue-600 truncate">{{ targetCredential.certifierName }}</div>

            <div class="font-semibold">📅 是否失效</div>
            <div class="text-red-600">{{ targetCredential.expired ? '是' : '否' }}</div>
          </div>

          <button @click="markExpired"
            class="mt-6 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
         text-white text-lg font-semibold py-3 rounded-xl shadow-md transition duration-300 flex items-center justify-center space-x-2">
            <!-- 失效图标 -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" class="text-white">
              <path fill="currentColor" fill-rule="evenodd"
                d="M307.503 42.667L426.666 161.83v307.504H85.333V42.667zm-17.69 42.667H128v341.333h256V179.52zm4.437 123.669l30.166 30.165l-38.251 38.251l38.25 38.25l-30.165 30.166l-38.25-38.25l-38.251 40.383l-30.165-30.165l38.25-40.384l-38.25-38.25l30.165-30.166l38.25 38.25z" />
            </svg>
            <span>标记为失效</span>
          </button>
        </section>

        <!-- 提示信息 -->
        <p v-if="error" class="mt-6 bg-red-100 text-red-700 p-4 rounded-lg text-sm text-center shadow">
          ⚠️ {{ error }}
        </p>
        <p v-if="success" class="mt-6 bg-green-100 text-green-700 p-4 rounded-lg text-sm text-center shadow">
          ✅ {{ success }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createWalletClient, createPublicClient, http, custom } from 'viem'
import { hardhat } from 'viem/chains'
import { CredentialRegistryAbi } from '../../../../abi/CredentialRegistry'

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const publicClient = createPublicClient({ chain: hardhat, transport: http() })

const addresses = ref<string[]>([])
const isConnected = ref(false)
const walletClient = ref<any>(null)

const queryInput = ref('')
const fileData = ref<File | null>(null)
const expectingFile = ref(false)
const error = ref('')
const success = ref('')
const loading = ref(false)

const targetIndex = ref<bigint | null>(null)
const targetCredential = ref<any>(null)
const isFileUploadMode = ref(false)

const connect = async () => {
  const ethereum = (window as any).ethereum
  if (!ethereum) return
  walletClient.value = createWalletClient({ chain: hardhat, transport: custom(ethereum) })
  addresses.value = await walletClient.value.requestAddresses()
  isConnected.value = addresses.value.length > 0
}

const clear = () => {
  error.value = ''
  success.value = ''
  expectingFile.value = queryInput.value.toLowerCase() === 'file'
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  fileData.value = input.files?.[0] || null
}

const switchToQueryMode = () => {
  isFileUploadMode.value = false
  queryInput.value = ''
}

const switchToFileUploadMode = () => {
  isFileUploadMode.value = true
  fileData.value = null
}

const locateCredential = async () => {
  error.value = ''
  targetIndex.value = null
  targetCredential.value = null
  loading.value = true

  try {
    const input = queryInput.value.trim()

    if (input.toLowerCase() === 'file' || fileData.value) {
      if (!fileData.value) throw new Error('请上传文件')
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

        const metaRes = await fetch(`http://localhost:8080/ipfs/${cred.cid}`)
        const meta = await metaRes.json()
        if (meta.fileCid === fileCid) {
          targetIndex.value = BigInt(i)
          targetCredential.value = cred

          // 获取持有者昵称
          const ownerName = await publicClient.readContract({
            address: contractAddress,
            abi: CredentialRegistryAbi,
            functionName: 'getAccountName',
            args: [cred.owner as `0x${string}`],
          }) as string
          cred.ownerName = ownerName

          // 获取认证人昵称
          const certifierName = await publicClient.readContract({
            address: contractAddress,
            abi: CredentialRegistryAbi,
            functionName: 'getAccountName',
            args: [cred.certifiedBy as `0x${string}`],
          }) as string
          cred.certifierName = certifierName

          break
        }
      }

      if (!targetCredential.value) throw new Error('未找到匹配凭证')
    }

    else if (input.length === 66 && input.startsWith('0x')) {
      const tx = await publicClient.getTransactionReceipt({ hash: input as `0x${string}` })
      const log = tx.logs.find(log =>
        log.address.toLowerCase() === contractAddress.toLowerCase() &&
        Array.isArray(log.topics) &&
        log.topics.length >= 2 && typeof log.topics[1] === 'string'

      )
      if (!log) throw new Error('无法从交易哈希中解析索引')
      const indexHex = log.topics[1]
      if (!indexHex) throw new Error('无法从日志中解析索引')
      const index = BigInt(indexHex)
      const cred = await publicClient.readContract({
        address: contractAddress,
        abi: CredentialRegistryAbi,
        functionName: 'getCredential',
        args: [index],
      })
      targetIndex.value = index
      targetCredential.value = cred

      // 获取持有者昵称
      const ownerName = await publicClient.readContract({
        address: contractAddress,
        abi: CredentialRegistryAbi,
        functionName: 'getAccountName',
        args: [cred.owner as `0x${string}`],
      }) as string
      cred.ownerName = ownerName

      // 获取认证人昵称
      const certifierName = await publicClient.readContract({
        address: contractAddress,
        abi: CredentialRegistryAbi,
        functionName: 'getAccountName',
        args: [cred.certifiedBy as `0x${string}`],
      }) as string
      cred.certifierName = certifierName
    }

    else {
      throw new Error('请输入交易哈希或输入 file 上传原文件')
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const markExpired = async () => {
  // if (!walletClient.value || !targetIndex.value || !targetCredential.value) return
  error.value = ''
  success.value = ''

  try {
    const [sender] = await walletClient.value.getAddresses()
    const admin = await publicClient.readContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'getAdmin',
    }) as string

    const isAuthorized =
      sender.toLowerCase() === admin.toLowerCase() ||
      sender.toLowerCase() === targetCredential.value.owner.toLowerCase() ||
      sender.toLowerCase() === targetCredential.value.certifiedBy.toLowerCase()

    if (!isAuthorized) {
      throw new Error('你没有权限操作此凭证')
    }

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'setExpired',
      args: [targetIndex.value, true],
      account: sender as `0x${string}`,
    })

    const txHash = await walletClient.value.writeContract(request)
    success.value = `标记成功，交易哈希：${txHash}`
  } catch (err: any) {
    error.value = err.message || '操作失败'
  }
}

onMounted(connect)
</script>