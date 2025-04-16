<template>
  <div class="p-6 max-w-2xl mx-auto space-y-6 bg-white rounded shadow">
    <h1 class="text-2xl font-bold">凭证合约功能测试</h1>

    <!-- 连接钱包按钮 -->
    <button class="btn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" @click="connect">
      连接钱包
    </button>
    <p v-if="isConnected">钱包已连接：{{ addresses.join(', ') }}</p>

    <!-- 输入交易哈希 -->
    <input v-model="txHash" placeholder="请输入交易哈希" class="w-full px-4 py-2 border rounded" />
    <button @click="queryByTxHash" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      查询凭证（按交易哈希）
    </button>

    <!-- 存储凭证表单 -->
    <div>
      <input v-model="credentialName" placeholder="请输入凭证名称" class="w-full px-4 py-2 border rounded mb-2" />
      <input v-model="owner" placeholder="请输入持有者地址" class="w-full px-4 py-2 border rounded mb-2" />

      <!-- 上传文件按钮 -->
      <input type="file" @change="handleFileChange" class="w-full px-4 py-2 border rounded mb-2" />
      <button @click="storeCredential" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        存储凭证
      </button>
    </div>

    <!-- 获取所有凭证 -->
    <div>
      <input v-model="userAddress" placeholder="请输入用户地址" class="w-full px-4 py-2 border rounded mb-2" />
      <button @click="getAllCredentialsByOwner" class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
        查询该账户的所有凭证
      </button>
    </div>

    <!-- 显示凭证信息 -->
    <div v-if="credential" class="space-y-2 border-t pt-4">
      <p><strong>CID：</strong>{{ credential.cid }}</p>
      <p><strong>名称：</strong>{{ credential.name }}</p>
      <p><strong>签发者：</strong>{{ credential.issuer }}</p>
      <p><strong>持有者：</strong>{{ credential.owner }}</p>
      <p><strong>上传时间：</strong>{{ formatTimestamp(credential.timestamp) }}</p>
      <a :href="`http://localhost:8080/ipfs/${credential.cid}`" target="_blank" class="text-blue-600 underline">
        查看文件
      </a>
    </div>

    <!-- 显示所有凭证 -->
    <div v-if="allCredentials.length > 0" class="space-y-2 border-t pt-4">
      <h2>用户所有凭证：</h2>
      <div v-for="(cred, index) in allCredentials" :key="index">
        <p><strong>CID：</strong>{{ cred.cid }}</p>
        <p><strong>名称：</strong>{{ cred.name }}</p>
        <p><strong>持有者：</strong>{{ cred.owner }}</p>
        <p><strong>签发者：</strong>{{ cred.issuer }}</p>
        <p><strong>上传时间：</strong>{{ formatTimestamp(cred.timestamp) }}</p>
        <a :href="`http://localhost:8080/ipfs/${cred.cid}`" target="_blank" class="text-blue-600 underline">
          查看文件
        </a>
        <hr />
      </div>
    </div>

    <!-- 存储成功的交易哈希 -->
    <p v-if="transactionHash" class="text-green-600">凭证存储成功，交易哈希：{{ transactionHash }}</p>

    <p v-if="error" class="text-red-600">错误：{{ error }}</p>
    <p v-if="!credential && !error && queried">未找到凭证</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createPublicClient, createWalletClient, custom, decodeEventLog, http } from 'viem'
import { hardhat } from 'viem/chains'
import { CredentialRegistryAbi } from '../../../abi/CredentialRegistry'  // 引入ABI文件
import type { WalletClient } from 'viem'

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3' // 合约地址
const txHash = ref('')
const credential = ref<any>(null)
const allCredentials = ref<any>([])
const credentialName = ref('')
const owner = ref('')
const userAddress = ref('')
const fileCid = ref('')
const error = ref('')
const queried = ref(false)
const transactionHash = ref<string>('')  // 存储交易哈希
const fileData = ref<File | null>(null) // 存储上传的文件

const publicClient = createPublicClient({
  chain: hardhat,  // 网络配置
  transport: http('http://localhost:8545'),
})

const walletClient = ref<WalletClient | null>(null)
const addresses = ref<string[]>([])
const isConnected = ref<boolean>(false)

const connect = async () => {
  try {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      console.log('✅ Ethereum detected')
      walletClient.value = createWalletClient({
        chain: hardhat,
        transport: custom((window as any).ethereum),
      })
      const rstAddresses = await walletClient.value.requestAddresses()
      if (!rstAddresses) {
        throw new Error('未连接钱包')
      }
      addresses.value = rstAddresses as [`0x${string}`]
      isConnected.value = addresses.value.length > 0
    }
  } catch (err: any) {
    error.value = err.message || '钱包连接失败'
  }
}

// 处理文件上传
const handleFileChange = (event: Event) => {
  const fileInput = event.target as HTMLInputElement
  const file = fileInput.files ? fileInput.files[0] : null
  if (file) {
    fileData.value = file
    console.log('选中的文件:', file)
  }
}

// 存储凭证
const storeCredential = async () => {
  try {
    if (!credentialName.value || !owner.value || !fileData.value) {
      throw new Error('所有字段都必须填写，包括文件上传')
    }
    if (!walletClient.value) {
      throw new Error('钱包未连接')
    }

    const [account] = await walletClient.value.getAddresses()
    if (!account) {
      throw new Error('未连接钱包')
    }

    // 上传文件到 IPFS
    const form = new FormData()
    form.append('file', fileData.value as Blob)
    const res = await fetch('http://localhost:5001/api/v0/add', { method: 'POST', body: form })
    const text = await res.text()
    const match = text.match(/"Hash":"([^"]+)"/)
    if (match) {
      fileCid.value = match[1]
    }

    // 创建包含文件CID和其他字段的JSON对象
    const jsonData = {
      fileCid: fileCid.value,
      credentialName: credentialName.value,
      owner: owner.value,
      timestamp: new Date().toISOString(),
    }

    // 将 JSON 转换为 Blob 并上传到 IPFS
    const jsonBlob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' })
    const formData = new FormData()
    formData.append('file', jsonBlob, 'credential.json')

    // 上传 JSON 文件到 IPFS
    const jsonRes = await fetch('http://localhost:5001/api/v0/add', {
      method: 'POST',
      body: formData,  // 发送 FormData，其中包含了 Blob 格式的 JSON 文件
    })

    const jsonText = await jsonRes.text()
    const jsonMatch = jsonText.match(/"Hash":"([^"]+)"/)
    if (!jsonMatch) throw new Error('JSON上传失败，CID解析失败')

    const jsonCid = jsonMatch[1] // 获取第二次上传的CID

    // 将 JSON 文件的 CID 存储到智能合约
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'storeCredential',
      account,
      args: [jsonCid, credentialName.value, owner.value],  // 使用第二次上传的JSON文件CID
    })

    const hash = await walletClient.value.writeContract(request)
    transactionHash.value = hash // 保存交易哈希
    error.value = ''
  } catch (err: any) {
    error.value = err.message || '存储凭证失败'
  }
}

// 查询凭证（按交易哈希）
const queryByTxHash = async () => {
  credential.value = null
  error.value = ''
  queried.value = false
  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash.value as `0x${string}`,
    })

    const targetLog = receipt.logs.find((log) => {
      return log.transactionHash === txHash.value && log.address.toLowerCase() === contractAddress.toLowerCase()
    })

    if (!targetLog) {
      queried.value = true
      return
    }

    const { args } = decodeEventLog({
      abi: CredentialRegistryAbi,
      data: targetLog.data,
      topics: targetLog.topics,
      eventName: 'CredentialStored',
    })

    credential.value = args
    queried.value = true
  } catch (err: any) {
    error.value = err.message || '查询失败'
  }
}

// 查询该账户的所有凭证
const getAllCredentialsByOwner = async () => {
  allCredentials.value = []
  error.value = ''
  try {
    allCredentials.value = await publicClient.readContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'getByOwner',
      args: [userAddress.value],
    })
  } catch (err: any) {
    error.value = err.message || '查询凭证失败'
  }
}

// 格式化时间戳
const formatTimestamp = (ts: any) => {
  return new Date(Number(ts) * 1000).toLocaleString()
}
</script>

<style scoped>
input {
  outline: none;
}
</style>
