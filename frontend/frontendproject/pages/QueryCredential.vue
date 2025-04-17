<template>
  <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
    <h1 style="font-size: 24px; font-weight: bold; text-align: center;">📚 查询凭证</h1>
    <p style="text-align: center; color: #666;">输入地址 / 上传原文件 / 交易哈希 / 用户名，任意方式即可查询</p>

    <!-- 钱包连接 -->
    <section style="margin-top: 16px; padding: 16px; background: #fff; border: 1px solid #eee; border-radius: 8px;">
      <button @click="connect" style="padding: 8px 16px; background: #3182ce; color: white; border-radius: 4px;">
        {{ isConnected ? '✅ 钱包已连接' : '🔗 连接钱包' }}
      </button>
      <p v-if="isConnected" style="margin-top: 8px; color: #38a169;">地址：{{ addresses[0] }}</p>
    </section>

    <!-- 查询输入 -->
    <section style="margin-top: 20px; padding: 16px; background: #fff; border: 1px solid #eee; border-radius: 8px;">
      <input v-model="queryInput" @input="clear" placeholder="地址 / 文件 / 哈希 / 用户名"
        style="width: 100%; padding: 8px; margin-bottom: 8px;" />
      <input v-if="expectingFile" type="file" @change="handleFileChange" style="width: 100%; margin-bottom: 8px;" />
      <button @click="handleQuery" :disabled="loading" style="width: 100%; padding: 10px; background: orange; color: white; border: none; border-radius: 4px;">
        {{ loading ? '查询中...' : '🔍 开始查询' }}
      </button>
    </section>

    <!-- 查询结果展示 -->
    <div v-if="results.length" style="margin-top: 20px;">
      <div v-for="(cred, index) in results" :key="index"
        style="padding: 12px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 12px; font-size: 14px;">
        <p><strong>📄 名称：</strong>{{ cred.name }}</p>
        <p><strong>🎯 CID：</strong>{{ cred.cid }}</p>
        <p><strong>👤 持有者：</strong>{{ cred.owner }}</p>
        <p><strong>🔐 认证：</strong>{{ formatCertification(cred.certification) }}</p>
        <p><strong>👥 认证人：</strong>{{ cred.certifiedBy }}</p>
        <p><strong>⛔ 是否失效：</strong>{{ cred.expired ? '是' : '否' }}</p>
      </div>
    </div>

    <p v-if="error" style="background: #fed7d7; color: #c53030; padding: 10px; margin-top: 20px; border-radius: 4px;">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { CredentialRegistryAbi } from '../../../abi/CredentialRegistry'
import { hardhat } from 'viem/chains'

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const publicClient = createPublicClient({ chain: hardhat, transport: http() })

const addresses = ref<string[]>([])
const walletClient = ref<any>(null)
const isConnected = ref(false)

const queryInput = ref('')
const fileData = ref<File | null>(null)
const expectingFile = ref(false)
const results = ref<any[]>([])
const error = ref('')
const loading = ref(false)

const connect = async () => {
  const ethereum = (window as any).ethereum
  if (!ethereum) return
  walletClient.value = createWalletClient({ chain: hardhat, transport: custom(ethereum) })
  addresses.value = await walletClient.value.requestAddresses()
  isConnected.value = addresses.value.length > 0
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

    if (input.toLowerCase() === 'file') {
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
</script>
