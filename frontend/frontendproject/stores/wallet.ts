import { defineStore } from 'pinia'
import { createWalletClient, custom, createPublicClient, formatEther } from 'viem'
import { useNetworkStore } from './network'
import { http } from 'viem'

interface WalletState {
  accounts: string[]
  isConnected: boolean
  error: string | null
  authRequired: boolean
  balances: Record<string, string>
}

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({
    accounts: [],
    isConnected: false,
    error: null,
    authRequired: false,
    balances: {}
  }),

  actions: {
    async connectWallet(requestNew = false) {
      try {
        const networkStore = useNetworkStore()
        if (!window.ethereum) throw new Error('MetaMask not installed')

        const client = createWalletClient({
          chain: networkStore.currentChain,
          transport: custom(window.ethereum)
        })

        const accounts = await client.requestAddresses({
          forceNewSession: requestNew
        })

        this.handleSuccess(accounts)
        networkStore.setupListeners()
        this.setupAccountListeners()
        await this.fetchAllBalances()
        await new Promise(resolve => setTimeout(resolve, 500))
        await this.fetchAllBalances()
        return accounts
      } catch (err: any) {
        this.handleError(err)
      }

    },

    // 在fetchAllBalances中添加重试
    // 修改 fetchAllBalances 方法
    async fetchAllBalances(retryCount = 3) {
      const networkStore = useNetworkStore();
      this.isFetching = true;

      try {
        const publicClient = createPublicClient({
          chain: networkStore.currentChain,
          transport: http(networkStore.rpcUrl) // 改用HTTP传输
        });

        let attempts = 0;
        while (attempts < retryCount) {
          try {
            const balanceResults = await Promise.allSettled(
              this.accounts.map(async (address) => {
                const balance = await publicClient.getBalance({ address });
                return { address, balance: formatEther(balance) };
              })
            );

            const newBalances = balanceResults.reduce((acc, result) => {
              if (result.status === "fulfilled") {
                acc[result.value.address] = Number(result.value.balance).toFixed(4);
              }
              return acc;
            }, {} as Record<string, string>);

            this.balances = { ...this.balances, ...newBalances };
            this.error = null;
            break;
          } catch (error) {
            attempts++;
            if (attempts >= retryCount) {
              throw new Error("无法获取余额，请检查网络连接");
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
      } catch (error) {
        console.error("余额查询失败:", error);
        this.error = error instanceof Error ? error.message : "未知错误";
      } finally {
        this.isFetching = false;
      }
    },


    async switchPrimaryAddress(address: string) {
      const index = this.accounts.indexOf(address)
      if (index === -1) throw new Error('Address not found')

      this.accounts = [
        address,
        ...this.accounts.filter(addr => addr !== address)
      ]

      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      })
    },

    async revokeAddress(address: string) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{
            eth_accounts: { account: address }
          }]
        })

        this.accounts = this.accounts.filter(addr => addr !== address)
        if (this.accounts.length === 0) this.disconnect()
      } catch (error) {
        throw new Error('Failed to revoke permissions')
      }
    },

    setupAccountListeners() {
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          this.accounts = newAccounts
          if (newAccounts.length === 0) this.disconnect()
        })
      }
    },

    handleSuccess(accounts: string[]) {
      this.accounts = accounts
      this.isConnected = accounts.length > 0
      this.error = null
      this.authRequired = false
    },

    handleError(err: any) {
      this.error = err.message || 'Operation failed'
      this.isConnected = false
      this.authRequired = err.code === 4001
    },

    disconnect() {
      this.accounts = []
      this.isConnected = false
      this.error = null
      this.balances = {}
    }
  }
})