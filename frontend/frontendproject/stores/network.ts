import { defineStore } from 'pinia'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import type { Chain } from 'viem'

interface NetworkState {
  chainId: number
  chainName: string
  rpcUrl: string
  currentChain: Chain
}

export const useNetworkStore = defineStore('network', {
  state: (): NetworkState => ({
    chainId: useRuntimeConfig().public.defaultChainId,
    chainName: mainnet.name,
    rpcUrl: useRuntimeConfig().public.defaultRpcUrl,
    currentChain: mainnet
  }),

  actions: {
    async updateNetwork(config: Partial<NetworkState>) {
      try {
        const tempClient = createPublicClient({
          transport: http(config.rpcUrl || this.rpcUrl)
        })
        await tempClient.getBlockNumber()

        const knownChain = await this.getKnownChain(config.chainId || this.chainId)
        this.currentChain = knownChain || this.createCustomChain(config)

        Object.assign(this, {
          chainId: config.chainId || this.chainId,
          chainName: config.chainName || this.chainName,
          rpcUrl: config.rpcUrl || this.rpcUrl
        })
      } catch (error) {
        throw new Error('Invalid network configuration')
      }
    },

    async getKnownChain(chainId: number) {
      const chains = await import('viem/chains').then(m => Object.values(m))
      return chains.find(c => c.id === chainId) || null
    },

    // 在network.ts中添加RPC验证
    async validateRpc(url: string) {
      try {
        const client = createPublicClient({
          transport: http(url)
        })
        await client.getBlockNumber()
        return true
      } catch (error) {
        return false
      }
    },

    createCustomChain(config: Partial<NetworkState>): Chain {
      return {
        id: config.chainId || this.chainId,
        name: config.chainName || `Custom Chain ${config.chainId}`,
        network: config.chainName?.toLowerCase() || 'custom',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: { default: { http: [config.rpcUrl || this.rpcUrl] } },
        blockExplorers: { default: { name: '', url: '' } }
      } as Chain
    },

    setupListeners() {
      if (window.ethereum) {
        window.ethereum.on('chainChanged', (chainIdHex: string) => {
          this.updateNetwork({ chainId: parseInt(chainIdHex, 16) })
        })
      }
    }
  }
})