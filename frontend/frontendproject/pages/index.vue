<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="space-y-6">
      <!-- <NetworkConfig /> -->
      <WalletConnector />
      
      <div class="mt-8 flex justify-center space-x-4">
        <NuxtLink 
          to="/address-management"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg 
                transition-colors duration-200 flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          地址管理
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style>
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>