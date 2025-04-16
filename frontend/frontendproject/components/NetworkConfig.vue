<template>
  <div class="network-config bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">网络设置</h3>
    <form @submit.prevent="updateNetwork" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Chain ID</label>
        <input
          v-model.number="form.chainId"
          type="number"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        >
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">RPC URL</label>
        <input
          v-model="form.rpcUrl"
          type="url"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        >
      </div>

      <button
        type="submit"
        :disabled="loading"
        :class="['w-full py-2 px-4 rounded-lg font-medium transition-colors',
                 loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white']"
      >
        {{ loading ? '更新中...' : '更新网络配置' }}
      </button>
    </form>

    <div 
      v-if="statusMessage"
      :class="['mt-4 p-3 rounded-lg text-sm', 
               statusClass === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700']"
    >
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNetworkStore } from '~/stores/network'

const networkStore = useNetworkStore()
const form = ref({
  chainId: networkStore.chainId,
  rpcUrl: networkStore.rpcUrl
})
const loading = ref(false)
const statusMessage = ref('')

const updateNetwork = async () => {
  try {
    loading.value = true
    await networkStore.updateNetwork(form.value)
    statusMessage.value = 'Network updated successfully'
  } catch (error) {
    statusMessage.value = error.message
  } finally {
    loading.value = false
    setTimeout(() => statusMessage.value = '', 3000)
  }
}

const statusClass = computed(() => 
  statusMessage.value.includes('success') ? 'success' : 'error'
)
</script>

