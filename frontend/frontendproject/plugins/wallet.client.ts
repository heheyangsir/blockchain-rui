import { createWalletClient, custom } from "viem"
import { useAccountStore } from "../stores/account"
import { defineNuxtPlugin } from "nuxt/app"
import { storeToRefs } from "pinia"
import { useRouter } from "vue-router"

export default defineNuxtPlugin(async () => {
  const accountStore = useAccountStore()
  const { accountAddress } = storeToRefs(accountStore)
  const router = useRouter()
  if (process.client && window.ethereum?.isMetaMask) {
    try {
      const client = createWalletClient({
        transport: custom(window.ethereum)
      })

      const accounts = await client.getAddresses()
      if (accounts.length > 0 && accountAddress.value != null && accountAddress.value in accounts) {
        accountStore.setAccountAddress(accountAddress.value);
        router.push({ path: '/dashboard' })
      } else {
        accountStore.disconnect();
        router.push({path: "/auth/login"})
      }
    } catch (error) {
      console.log('Auto-connect failed:', error)
    }
  }
})