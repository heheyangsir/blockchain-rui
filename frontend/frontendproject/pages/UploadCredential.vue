<template>
  <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">📤 上传凭证</h1>

    <!-- 钱包连接 -->
    <section style="margin-bottom: 16px;">
      <button @click="connect" style="background: #3182ce; color: white; padding: 8px 16px; border-radius: 4px;">
        {{ isConnected ? '钱包已连接' : '连接钱包' }}
      </button>
      <p v-if="isConnected" style="margin-top: 8px; color: #38a169;">地址：{{ account }}</p>
    </section>

    <!-- 上传表单 -->
    <section style="background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
      <input v-model="credentialName" placeholder="凭证名称" style="width: 100%; margin-bottom: 8px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;" />
      <input type="file" @change="handleFileChange" style="width: 100%; margin-bottom: 8px;" />
      <button @click="storeCredential" style="background: #38a169; color: white; width: 100%; padding: 8px; border-radius: 4px;">📦 上传至链上</button>
      <p v-if="transactionHash" style="color: #38a169; margin-top: 8px;">✅ 交易哈希：{{ transactionHash }}</p>
    </section>

    <p v-if="error" style="margin-top: 16px; background: #fed7d7; color: #c53030; padding: 8px; border-radius: 4px;">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createWalletClient, createPublicClient, custom, http } from 'viem'
import { hardhat } from 'viem/chains'
import { CredentialRegistryAbi } from '../../../abi/CredentialRegistry'
import type { WalletClient } from 'viem'

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const credentialName = ref('')
const fileData = ref<File | null>(null)
const fileCid = ref('')
const transactionHash = ref('')
const error = ref('')
const account = ref('')
const isConnected = ref(false)

const walletClient = ref<WalletClient | null>(null)
const publicClient = createPublicClient({ chain: hardhat, transport: http('http://localhost:8545') })

const connect = async () => {
  try {
    const ethereum = (window as any).ethereum
    if (!ethereum) throw new Error('请安装 MetaMask')
    walletClient.value = createWalletClient({ chain: hardhat, transport: custom(ethereum) })
    const addresses = await walletClient.value.requestAddresses()
    account.value = addresses[0]
    isConnected.value = true
  } catch (err: any) {
    error.value = err.message
  }
}

onMounted(connect)

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  fileData.value = input.files?.[0] || null
}

const storeCredential = async () => {
  error.value = ''
  transactionHash.value = ''
  try {
    if (!walletClient.value || !credentialName.value || !fileData.value) throw new Error('请填写凭证名称并选择文件')

    // 上传文件
    const form = new FormData()
    form.append('file', fileData.value)
    const res = await fetch('http://localhost:5001/api/v0/add', { method: 'POST', body: form })
    const text = await res.text()
    const fileCidMatch = text.match(/"Hash":"([^"]+)"/)
    if (!fileCidMatch) throw new Error('IPFS 文件 CID 获取失败')
    fileCid.value = fileCidMatch[1]

    // 构造 metadata
    const metadata = {
      fileCid: fileCid.value,
      credentialName: credentialName.value,
      owner: account.value,
      timestamp: new Date().toISOString(),
    }
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    const metadataForm = new FormData()
    metadataForm.append('file', metadataBlob)
    const metaRes = await fetch('http://localhost:5001/api/v0/add', { method: 'POST', body: metadataForm })
    const metaText = await metaRes.text()
    const metaCidMatch = metaText.match(/"Hash":"([^"]+)"/)
    const metadataCid = metaCidMatch?.[1]
    if (!metadataCid) throw new Error('IPFS Metadata CID 获取失败')

    // 写入链上
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'storeCredential',
      args: [metadataCid, credentialName.value, account.value],
      account: account.value as `0x${string}`,
    })
    const txHash = await walletClient.value.writeContract(request)
    transactionHash.value = txHash
  } catch (err: any) {
    error.value = err.message || '操作失败'
  }
}
</script>
