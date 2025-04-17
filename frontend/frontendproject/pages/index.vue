<template>
  <div class="p-6 max-w-5xl mx-auto space-y-10">
    <h1 class="text-2xl font-bold text-center">📦 CredentialRegistry 测试页面</h1>

    <!-- 钱包连接 -->
    <section class="space-y-2">
      <button @click="connectWallet" class="btn-blue">🔗 {{ isConnected ? '钱包已连接' : '连接钱包' }}</button>
      <p v-if="isConnected">当前地址：{{ account }}</p>
    </section>

    <!-- 上传凭证 -->
    <section class="card">
      <h2>📤 上传凭证</h2>
      <input v-model="upload.name" placeholder="凭证名称" class="input" />
      <input v-model="upload.owner" placeholder="持有者地址" class="input" />
      <input type="file" @change="e => { const target = e.target as HTMLInputElement; upload.file = target?.files?.[0] || null }" class="input" />
      <button @click="uploadCredential" class="btn-green">上传凭证</button>
    </section>

    <!-- 认证凭证 -->
    <section class="card">
      <h2>✅ 认证凭证</h2>
      <input v-model.number="certify.index" placeholder="凭证索引" class="input" />
      <select v-model.number="certify.level" class="input">
        <option :value="1">他人认证</option>
        <option :value="2" :disabled="!isAuthorized">官方认证</option>
      </select>
      <button @click="certifyCredential" class="btn-blue">发起认证</button>
    </section>

    <!-- 查询凭证（三合一） -->
    <section class="card">
      <h2>🔍 查询凭证（三合一）</h2>
      <input v-model="queryInput" @input="clearQuery" placeholder="输入地址 / 原始文件 / 交易哈希" class="input" type="text" />
      <input v-if="expectingFile" type="file" @change="handleFileChange" class="input" />
      <button @click="handleQuery" class="btn-yellow w-full">开始查询</button>

      <div v-if="results.length">
        <h3 class="font-semibold">查询结果：</h3>
        <div v-for="(cred, idx) in results" :key="idx" class="border p-2 mt-2 rounded bg-gray-100 text-sm">
          <p><strong>凭证名：</strong>{{ cred.name }}</p>
          <p><strong>持有者：</strong>{{ cred.owner }}</p>
          <p><strong>认证等级：</strong>{{ formatCertification(cred.certification) }}</p>
          <p><strong>是否失效：</strong>{{ cred.expired ? '✅' : '❌' }}</p>
        </div>
      </div>
    </section>

    <!-- 设置名称 -->
    <section class="card">
      <h2>🧾 设置账户名称</h2>
      <input v-model="accountName" placeholder="设置名称" class="input" />
      <button @click="setAccountName" class="btn-blue">设置名称</button>
    </section>

    <!-- 设置授权 -->
    <section class="card">
      <h2>🎓 授权账户为官方认证人</h2>
      <input v-model="authAddr" placeholder="地址" class="input" />
      <button @click="authorizeAccount" class="btn-red">添加授权</button>
    </section>

    <!-- 设置失效 -->
    <section class="card">
      <h2>⛔ 设置凭证失效</h2>
      <input v-model.number="expiredIndex" placeholder="凭证索引" class="input" />
      <button @click="expireCredential" class="btn-red">标记为失效</button>
    </section>

    <p class="text-red-600 font-medium" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CredentialRegistryAbi } from '../../../abi/CredentialRegistry'
import { createWalletClient, createPublicClient, custom, http } from 'viem'
import { hardhat } from 'viem/chains'

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const wallet = ref<any>(null)
const account = ref('')
const isConnected = ref(false)
const isAuthorized = ref(false)

const upload = ref<{ name: string; owner: string; file: File | null }>({ name: '', owner: '', file: null })
const certify = ref({ index: 0, level: 1 })
const results = ref<any[]>([])
const accountName = ref('')
const authAddr = ref('')
const expiredIndex = ref<number>(0)
const error = ref('')

const queryInput = ref('')
const fileData = ref<File | null>(null)
const expectingFile = ref(false)

const publicClient = createPublicClient({ chain: hardhat, transport: http() })

const connectWallet = async () => {
  const ethereum = (window as any).ethereum
  wallet.value = createWalletClient({ chain: hardhat, transport: custom(ethereum) })
  const [addr] = await wallet.value.requestAddresses()
  account.value = addr
  isConnected.value = true
  isAuthorized.value = await publicClient.readContract({
    address: contractAddress,
    abi: CredentialRegistryAbi,
    functionName: 'isAuthorized',
    args: [addr],
  })
}

const uploadCredential = async () => {
  try {
    error.value = ''
    const form = new FormData()
    form.append('file', upload.value.file)
    const fileRes = await fetch('http://localhost:5001/api/v0/add', { method: 'POST', body: form })
    const fileText = await fileRes.text()
    const fileCid = fileText.match(/"Hash":\s*"([^"]+)"/)?.[1] // 修复正则表达式

    if (!fileCid) throw new Error('文件 CID 提取失败')

    const meta = {
      credentialName: upload.value.name,
      fileCid,
      owner: upload.value.owner,
      timestamp: new Date().toISOString()
    }
    const metaForm = new FormData()
    metaForm.append('file', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
    const metaRes = await fetch('http://localhost:5001/api/v0/add', { method: 'POST', body: metaForm })
    const metaText = await metaRes.text()
    const metadataCid = metaText.match(/"Hash":\s*"([^"]+)"/)?.[1] // 修复正则表达式

    if (!metadataCid) throw new Error('元数据 CID 提取失败')

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'storeCredential',
      args: [metadataCid, upload.value.name, upload.value.owner],
      account: account.value,
    })
    await wallet.value.writeContract(request)
  } catch (err: any) {
    error.value = err.message || '上传失败'
  }
}

const certifyCredential = async () => {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: CredentialRegistryAbi,
    functionName: 'certifyCredential',
    args: [certify.value.index, certify.value.level],
    account: account.value,
  })
  await wallet.value.writeContract(request)
}

const setAccountName = async () => {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: CredentialRegistryAbi,
    functionName: 'setAccountName',
    args: [accountName.value],
    account: account.value,
  })
  await wallet.value.writeContract(request)
}

const authorizeAccount = async () => {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: CredentialRegistryAbi,
    functionName: 'setAuthorizedEntity',
    args: [authAddr.value, true],
    account: account.value,
  })
  await wallet.value.writeContract(request)
}

const expireCredential = async () => {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: CredentialRegistryAbi,
    functionName: 'setExpired',
    args: [expiredIndex.value, true],
    account: account.value,
  })
  await wallet.value.writeContract(request)
}

const clearQuery = () => {
  error.value = ''
  results.value = []
  expectingFile.value = queryInput.value.trim().toLowerCase() === 'file'
}

const handleFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  fileData.value = input.files?.[0] || null
}

const handleQuery = async () => {
  error.value = ''
  results.value = []

  try {
    const input = queryInput.value.trim()

    if (input === 'file') {
      if (!fileData.value) throw new Error('请先选择文件')
      const form = new FormData()
      form.append('file', fileData.value)
      const res = await fetch('http://localhost:5001/api/v0/add', { method: 'POST', body: form })
      const text = await res.text()
      const match = text.match(/"Hash":\s*"([^"]+)"/) // 修复正则表达式
      if (!match) throw new Error('IPFS CID 提取失败')
      const cid = match[1]

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
          args: [i],
        })
        if ((cred as any).cid === cid) results.value.push(cred)
      }
      if (results.value.length === 0) throw new Error('未找到该文件对应的凭证')
    } else if (input.length === 66 && input.startsWith('0x')) {
      const tx = await publicClient.getTransactionReceipt({ hash: input as `0x${string}` })
      const logs = tx.logs || []
      const log = logs.find(l => l.topics[0].toLowerCase() === '0x3b0a43ccc1ccd1c76ebb1a8d998fdfe1ded3766582dbbbcdda83889170bec53d')
      if (!log) throw new Error('凭证日志未找到，可能交易哈希无效')

      const indexHex = log.topics[1]
      const index = parseInt(indexHex, 16)

      const cred = await publicClient.readContract({
        address: contractAddress,
        abi: CredentialRegistryAbi,
        functionName: 'getCredential',
        args: [index],
      })
      results.value.push(cred)
    } else if (input.length === 42 && input.startsWith('0x')) {
      const creds = await publicClient.readContract({
        address: contractAddress,
        abi: CredentialRegistryAbi,
        functionName: 'getByOwner',
        args: [input as `0x${string}`],
      }) as any[]
      if (creds.length === 0) throw new Error('该地址没有凭证')
      results.value = creds
    } else {
      throw new Error('请输入合法地址 / 交易哈希 / 输入 "file" 后上传原文件')
    }
  } catch (err: any) {
    error.value = err.message || '查询失败'
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
</script>

<style scoped>
.input {
  @apply w-full p-2 border border-gray-300 rounded my-2;
}
.btn-blue {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700;
}
.btn-green {
  @apply bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700;
}
.btn-yellow {
  @apply bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600;
}
.btn-red {
  @apply bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700;
}
.card {
  @apply bg-white p-4 rounded shadow space-y-2;
}
</style>
