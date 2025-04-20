<template>
    <div style="min-height: 100vh; display: flex; justify-content: center; align-items: center; background: #f7fafc;">
      <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); width: 100%; max-width: 400px;">
        <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #2d3748;">🔐 连接钱包</h1>
        <button
          @click="connect"
          :disabled="isConnected"
          style="background: #3182ce; color: white; padding: 10px 16px; border: none; border-radius: 6px; width: 100%; cursor: pointer;"
        >
          {{ isConnected ? '钱包已连接' : '连接钱包' }}
        </button>
        <p v-if="isConnected" style="margin-top: 12px; font-size: 14px; color: #38a169;">地址：{{ addresses[0] }}</p>
        <p v-if="error" style="margin-top: 12px; font-size: 14px; color: #e53e3e;">错误：{{ error }}</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { createWalletClient, custom } from 'viem'
  import { hardhat } from 'viem/chains'
  import type { WalletClient } from 'viem'
  
  const isConnected = ref(false)
  const addresses = ref<string[]>([])
  const walletClient = ref<WalletClient | null>(null)
  const error = ref('')
  
  const connect = async () => {
    error.value = ''
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) throw new Error('请安装 MetaMask 等钱包插件')
      walletClient.value = createWalletClient({
        chain: hardhat,
        transport: custom(ethereum),
      })
      if (walletClient.value) {
        addresses.value = await walletClient.value.requestAddresses()
      } else {
        throw new Error('钱包客户端未初始化')
      }
      isConnected.value = addresses.value.length > 0
    } catch (err: any) {
      error.value = err.message || '连接失败'
    }
  }
  </script>
  
  <style scoped>
  body {
    margin: 0;
  }
  </style>
  