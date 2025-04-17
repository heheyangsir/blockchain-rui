<template>
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="font-size: 24px; font-weight: bold; text-align: center;">⛔ 标记凭证为失效</h1>
      <p style="text-align: center; color: #666;">你只能标记你自己拥有或认证的凭证，或你是管理员</p>
  
      <!-- 钱包连接 -->
      <section style="margin-top: 16px;">
        <button @click="connect" style="padding: 8px 16px; background-color: #3182ce; color: white; border-radius: 4px;">
          {{ isConnected ? '✅ 钱包已连接' : '🔗 连接钱包' }}
        </button>
        <p v-if="isConnected" style="margin-top: 8px; color: #38a169;">地址：{{ addresses[0] }}</p>
      </section>
  
      <!-- 输入字段 -->
      <section style="margin-top: 20px;">
        <input v-model="queryInput" @input="clear" placeholder="交易哈希 / file" style="width: 100%; padding: 8px; margin-bottom: 8px;" />
        <input v-if="expectingFile" type="file" @change="handleFileChange" style="width: 100%; margin-bottom: 8px;" />
        <button @click="locateCredential" :disabled="loading" style="width: 100%; padding: 10px; background: #805ad5; color: white; border: none; border-radius: 4px;">
          {{ loading ? '解析中...' : '🎯 定位凭证' }}
        </button>
      </section>
  
      <section v-if="targetCredential" style="margin-top: 20px; background: #f9f9f9; padding: 16px; border-radius: 6px; border: 1px solid #ddd;">
        <p><strong>名称：</strong>{{ targetCredential.name }}</p>
        <p><strong>持有者：</strong>{{ targetCredential.owner }}</p>
        <p><strong>认证人：</strong>{{ targetCredential.certifiedBy }}</p>
        <p><strong>是否失效：</strong>{{ targetCredential.expired ? '是' : '否' }}</p>
        <button @click="markExpired" style="margin-top: 12px; width: 100%; background: red; color: white; padding: 10px; border-radius: 4px;">❌ 标记为失效</button>
      </section>
  
      <p v-if="error" style="background: #fed7d7; color: #c53030; padding: 10px; margin-top: 20px; border-radius: 4px;">{{ error }}</p>
      <p v-if="success" style="background: #c6f6d5; color: #22543d; padding: 10px; margin-top: 20px; border-radius: 4px;">✅ {{ success }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { createWalletClient, createPublicClient, http, custom } from 'viem'
  import { hardhat } from 'viem/chains'
  import { CredentialRegistryAbi } from '../../../abi/CredentialRegistry'
  
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
  
  const locateCredential = async () => {
    error.value = ''
    targetIndex.value = null
    targetCredential.value = null
    loading.value = true
  
    try {
      const input = queryInput.value.trim()
  
      if (input.toLowerCase() === 'file') {
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
          log.topics.length >=2&&typeof log.topics[1] === 'string'

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
    if (!walletClient.value || !targetIndex.value || !targetCredential.value) return
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
  </script>
  