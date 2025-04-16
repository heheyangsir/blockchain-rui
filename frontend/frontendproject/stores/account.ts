import { useRouter } from 'nuxt/app'
import { defineStore } from 'pinia'
import type { Chain } from 'viem'
import { mainnet } from 'viem/chains'


interface AccountState {
  accountAddress: string | null,
  lastUpdateDatetime: number | 0,
}

export interface NetworkInfo {
  chainId: number
  chainName: string
  rpcUrl: string
  currentChain: Chain
}

export const networkInfo = {
  chainId: 31337,
  chainName: "Rui",
  rpcUrl: "http://localhost:8545",
  currentChain: mainnet,
}

export const useAccountStore = defineStore('account', {
  state: (): AccountState => ({
    accountAddress: null,
    lastUpdateDatetime: 0,
  }),

  actions: {
    setAccountAddress(address: string) {
      this.accountAddress = address;
      this.lastUpdateDatetime = Date.now();
    },
    
    setupAccountListeners() {
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', (_: string[]) => {
          useRouter().replace("/auth/login");
          this.accountAddress = null;
          this.lastUpdateDatetime = Date.now();
        })
      }
    },

    disconnect() {
      this.accountAddress = null;
      this.lastUpdateDatetime = Date.now();
    }
  }
})