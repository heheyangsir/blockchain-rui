<template>
  <div class="h-screen bg-gradient-to-b from-orange-50 to-gray-200 flex flex-col">
    <AppHeader />

    <div class="flex-1 overflow-y-auto pt-24 pb-16 px-6">
      <div class="max-w-4xl mx-auto">
        <!-- 顶部标题 -->
        <div class="mb-10 text-center">
          <h1 class="text-4xl font-extrabold text-gray-800 mb-2">📤 上传您的区块链凭证</h1>
          <p class="text-lg text-gray-500">将您的数据安全且可信地存储到区块链</p>
        </div>

        <!-- 钱包连接 -->
        <Connector />

        <!-- 上传表单 -->
        <section class="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6 mt-8">
          <!-- 凭证名称 -->
          <div>
            <label class="block text-gray-700 font-semibold mb-2">📛 凭证名称</label>
            <input
              v-model="credentialName"
              placeholder="例如：区块链课程证书"
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <!-- 上传文件 -->
          <div>
            <label class="block text-gray-700 font-semibold mb-2">📎 选择文件</label>
            <input
              type="file"
              @change="handleFileChange"
              class="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm 
                     file:mr-4 file:py-2 file:px-4 file:rounded-full 
                     file:border-0 file:bg-blue-600 file:text-white 
                     hover:file:bg-blue-700 transition"
            />
          </div>

          <!-- 上传按钮 -->
          <div>
            <button
              @click="storeCredential"
              class="w-full bg-gradient-to-r from-green-500 to-green-600 
                     hover:from-green-600 hover:to-green-700 
                     text-white text-lg font-semibold py-3 
                     rounded-xl shadow-md transition duration-300"
            >
              📦 上传至链上
            </button>
          </div>

          <!-- 交易哈希 -->
          <p
            v-if="transactionHash"
            class="text-green-700 bg-green-100 p-4 rounded-lg text-sm break-words shadow"
          >
            ✅ 交易哈希：{{ transactionHash }}
          </p>
        </section>

        <!-- 错误信息 -->
        <p
          v-if="error"
          class="mt-6 bg-red-100 text-red-700 p-4 rounded-lg text-sm text-center shadow"
        >
          ⚠️ {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>



<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createWalletClient, createPublicClient, custom, http } from 'viem'
import { hardhat } from 'viem/chains'
import { CredentialRegistryAbi } from '../../../../abi/CredentialRegistry'
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

// 和 index.vue 保持一致的钱包连接方式
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

    // 上传文件到 IPFS
    const form = new FormData()
    form.append('file', fileData.value)
    const res = await fetch('http://localhost:5001/api/v0/add', { method: 'POST', body: form })
    const text = await res.text()
    const fileCidMatch = text.match(/"Hash":"([^"]+)"/)
    if (!fileCidMatch) throw new Error('IPFS 文件 CID 获取失败')
    fileCid.value = fileCidMatch[1]

    // 构造 metadata 并上传
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

    // 写入合约
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
