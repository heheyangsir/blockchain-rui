<template>
    <div>
        <!-- 钱包未连接 -->
        <div v-if="!currentAddress" class="mb-6">
            <div class="bg-yellow-50 border border-yellow-400 rounded-2xl shadow-xl p-6">
                <p class="text-yellow-700 text-xl font-bold mb-2">⚠️ 钱包未连接</p>
                <p class="text-yellow-600 text-sm mb-4">请通过 MetaMask 连接您的账户</p>
                <button @click="connectWallet"
                    class="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-base transition duration-200">
                    🔗 连接钱包
                </button>
                <p v-if="error" class="text-red-600 text-sm mt-3">⚠️ {{ error }}</p>
            </div>
        </div>

        <!-- 钱包已连接 -->
        <div v-else class="flex items-center justify-between bg-white rounded-2xl shadow-xl p-6 mb-4">
            <div>
                <h2 class="text-lg font-semibold mb-1">✅ 当前地址</h2>
                <p class="font-mono text-blue-600 text-sm">{{ formattedAddress }}</p>
            </div>
            <button @click="disconnectWallet"
                class="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition duration-200 text-sm flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" class="text-white">
                    <path fill="currentColor"
                        d="M43.634 4.366a1.25 1.25 0 0 1 0 1.768l-4.913 4.913a9.253 9.253 0 0 1-.744 12.244l-3.343 3.343a1.25 1.25 0 0 1-1.768 0l-11.5-11.5a1.25 1.25 0 0 1 0-1.768l3.343-3.343a9.25 9.25 0 0 1 12.244-.743l4.913-4.914a1.25 1.25 0 0 1 1.768 0M9.28 36.953l-4.914 4.913a1.25 1.25 0 0 0 1.768 1.768l4.913-4.913a9.253 9.253 0 0 0 12.244-.744l3.343-3.343a1.25 1.25 0 0 0 0-1.768L25.268 31.5l3.366-3.366a1.25 1.25 0 0 0-1.768-1.768L23.5 29.732L18.268 24.5l3.366-3.366a1.25 1.25 0 0 0-1.768-1.768L16.5 22.732l-1.366-1.366a1.25 1.25 0 0 0-1.768 0l-3.343 3.343a9.25 9.25 0 0 0-.743 12.244" />
                </svg>
                <span>断开钱包</span>
            </button>
        </div>
    </div>
</template>


<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAccountStore } from '../stores/account'
import { createWalletClient, custom } from 'viem'
import { networkInfo } from '../stores/account'

const accountStore = useAccountStore()
const currentAddress = computed(() => accountStore.accountAddress || '')
const formattedAddress = computed(() =>
    currentAddress.value ? `${currentAddress.value.slice(0, 8)}...${currentAddress.value.slice(-6)}` : ''
)

const error = ref('')

const connectWallet = async () => {
    try {
        error.value = ''
        const ethereum = (window as any).ethereum
        if (!ethereum) throw new Error('请安装 MetaMask')
        const walletClient = createWalletClient({ chain: networkInfo.currentChain, transport: custom(ethereum) })
        const addrs = await walletClient.requestAddresses()
        if (!addrs.length) throw new Error('未检测到地址')
        accountStore.setAccountAddress(addrs[0])
    } catch (err: any) {
        error.value = err.message
    }
}

const disconnectWallet = () => {
    accountStore.disconnect()
}
</script>