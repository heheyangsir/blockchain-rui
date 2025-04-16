<template>
  <div class="p-6 max-w-2xl mx-auto space-y-6 bg-white rounded shadow">
    <h1 class="text-2xl font-bold">凭证查询（按交易哈希）</h1>

    <input
      v-model="txHash"
      placeholder="请输入交易哈希"
      class="w-full px-4 py-2 border rounded"
    />

    <button
      @click="queryByTxHash"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      查询凭证
    </button>

    <div v-if="credential" class="space-y-2 border-t pt-4">
      <p><strong>CID：</strong>{{ credential.cid }}</p>
      <p><strong>名称：</strong>{{ credential.name }}</p>
      <p><strong>签发者：</strong>{{ credential.issuer }}</p>
      <p><strong>持有者：</strong>{{ credential.owner }}</p>
      <p><strong>上传时间：</strong>{{ formatTimestamp(credential.timestamp) }}</p>
      <a
        :href="`http://localhost:8080/ipfs/${credential.cid}`"
        target="_blank"
        class="text-blue-600 underline"
      >
        查看文件
      </a>
    </div>

    <p v-if="error" class="text-red-600">错误：{{ error }}</p>
    <p v-if="!credential && !error && queried">未找到凭证</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createPublicClient, decodeEventLog, http } from 'viem'
import { hardhat } from 'viem/chains'
import { CredentialStoreAbi } from '../../../abi/CredentialStore'

const contractAddress = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
const txHash = ref('')
const credential = ref<any>(null)
const error = ref('')
const queried = ref(false)

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http('http://localhost:8545'),
})

const queryByTxHash = async () => {
  credential.value = null
  error.value = ''
  queried.value = false
  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash.value as `0x${string}`,
    })

    const targetLog = receipt.logs.find(
      (log) =>
        log.address.toLowerCase() === contractAddress.toLowerCase() &&
        log.topics[0] === publicClient.abi?.events?.CredentialStored?.selector
    )

    const log = receipt.logs.find(
      (log) =>
        log.address.toLowerCase() === contractAddress.toLowerCase()
    )

    if (!log) {
      queried.value = true
      return
    }

    const { args } = decodeEventLog({
      abi: CredentialStoreAbi,
      data: log.data,
      topics: log.topics,
      eventName: 'CredentialStored',
    })

    credential.value = args
    queried.value = true
  } catch (err: any) {
    error.value = err.message || '查询失败'
  }
}

const formatTimestamp = (ts: any) => {
  return new Date(Number(ts) * 1000).toLocaleString()
}
</script>

<style scoped>
input {
  outline: none;
}
</style>
