<template>
  <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
    <h1 style="font-size: 24px; font-weight: bold;">🔐 凭证认证</h1>

    <!-- 连接钱包 -->
    <section style="margin-bottom: 20px;">
      <button @click="connect" style="padding: 8px 16px; background-color: #3182ce; color: white; border-radius: 4px;">
        {{ isConnected ? '钱包已连接' : '连接钱包' }}
      </button>
      <p v-if="isConnected" style="margin-top: 8px;">当前账户地址：{{ addresses[0] }}</p>
      <p v-if="!isAuthorized && isConnected" style="color: #c53030;">⚠️ 当前账户不是官方授权人</p>
    </section>

    <!-- 认证功能 -->
    <section style="background: #f7fafc; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="font-weight: bold;">✅ 发起认证</h2>
      <input v-model="txHash" placeholder="交易哈希" style="width: 100%; margin: 12px 0; padding: 8px; border: 1px solid #ccc;" />
      <select v-model="level" style="width: 100%; margin-bottom: 12px; padding: 8px;" :disabled="!isAuthorized && level === 2">
        <option :value="1">他人认证（Peer）</option>
        <option :value="2" :disabled="!isAuthorized">官方认证（Official）</option>
      </select>
      <button @click="certify" style="padding: 8px 16px; background: #38a169; color: white; border-radius: 4px; width: 100%;">📥 提交认证</button>
      <div v-if="txResult" style="margin-top: 12px; color: #2f855a;">✅ 交易成功：{{ txResult }}</div>
      <div v-if="error" style="margin-top: 12px; color: #c53030;">{{ error }}</div>
    </section>

    <!-- 设置名称 -->
    <section style="background: #f7fafc; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="font-weight: bold;">🧾 设置账户名称</h2>
      <input v-model="accountName" placeholder="请输入名称" style="width: 100%; padding: 8px; margin-bottom: 8px;" />
      <button @click="setName" style="padding: 8px 16px; background: #4299e1; color: white; border-radius: 4px; width: 100%;">设置名称</button>
    </section>

    <!-- 添加授权 -->
    <section style="background: #f7fafc; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="font-weight: bold;">🎓 添加官方认证人</h2>
      <input v-model="authAddr" placeholder="被授权地址" style="width: 100%; padding: 8px; margin-bottom: 8px;" />
      <button @click="authorizeAccount" style="padding: 8px 16px; background: #d69e2e; color: white; border-radius: 4px; width: 100%;">添加授权</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createWalletClient, createPublicClient, custom, http } from 'viem'
import { hardhat } from 'viem/chains'
import { CredentialRegistryAbi } from '../../../abi/CredentialRegistry'

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const txHash = ref('')
const level = ref(1)
const txResult = ref('')
const error = ref('')
const isAuthorized = ref(false)

const accountName = ref('')
const authAddr = ref('')

const walletClient = ref<any>()
const publicClient = createPublicClient({ chain: hardhat, transport: http() })
const addresses = ref<string[]>([])
const isConnected = ref(false)

const connect = async () => {
  const ethereum = (window as any).ethereum
  if (!ethereum) return
  walletClient.value = createWalletClient({ chain: hardhat, transport: custom(ethereum) })
  addresses.value = await walletClient.value.requestAddresses()
  isConnected.value = addresses.value.length > 0

  const result = await publicClient.readContract({
    address: contractAddress,
    abi: CredentialRegistryAbi,
    functionName: 'isAuthorized',
    args: [addresses.value[0] as `0x${string}`],
  })
  isAuthorized.value = result as boolean
}

const certify = async () => {
  try {
    error.value = ''
    txResult.value = ''
    if (!walletClient.value || !txHash.value) throw new Error('请输入交易哈希')

    const receipt = await publicClient.getTransactionReceipt({ hash: txHash.value as `0x${string}` })
    const log = receipt.logs.find(log => log.address.toLowerCase() === contractAddress.toLowerCase())
    if (!log || !log.topics || log.topics.length < 2) throw new Error('未找到凭证事件')
    if (!log.topics[1]) throw new Error('凭证事件的主题缺失')
    const credentialIndex = parseInt(log.topics[1], 16)

    const account = addresses.value[0]
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'certifyCredential',
      args: [BigInt(credentialIndex), level.value],
      account: account as `0x${string}`,
    })
    const hash = await walletClient.value.writeContract({ ...request })
    txResult.value = hash
  } catch (err: any) {
    error.value = err.message || '操作失败'
  }
}

const setName = async () => {
  try {
    error.value = ''
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'setAccountName',
      args: [accountName.value],
      account: addresses.value[0] as `0x${string}`
    })
    const hash = await walletClient.value.writeContract(request)
    txResult.value = hash
  } catch (err: any) {
    error.value = err.message
  }
}

const authorizeAccount = async () => {
  try {
    error.value = ''
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: CredentialRegistryAbi,
      functionName: 'setAuthorizedEntity',
      args: [authAddr.value as `0x${string}`, true],
      account: addresses.value[0] as `0x${string}`,
    })
    const hash = await walletClient.value.writeContract(request)
    txResult.value = hash
  } catch (err: any) {
    error.value = err.message
  }
}
</script>
