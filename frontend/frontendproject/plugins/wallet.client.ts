export default defineNuxtPlugin(async () => {
  const networkStore = useNetworkStore()
  const walletStore = useWalletStore()

  if (process.client && window.ethereum?.isMetaMask) {
    try {
      const client = createWalletClient({
        transport: custom(window.ethereum)
      })
      
      const accounts = await client.getAddresses()
      if (accounts.length > 0) {
        walletStore.accounts = accounts
        walletStore.isConnected = true
        networkStore.setupListeners()
        walletStore.setupAccountListeners()
        await walletStore.fetchAllBalances()
      }
    } catch (error) {
      console.log('Auto-connect failed:', error)
    }
  }
})