<template>
<div class="bg-white p-6 rounded-xl shadow-sm">
    <h1 class="text-gray-500 text-sm font-medium">余额</h1>
    <div class="mt-2 text-3xl font-bold text-gray-900">
      <div v-if="!isLoading">{{ formatEther(balance!) }} ETH</div>
    </div>
    <div class="mt-4 flex items-center text-sm text-purple-600">
      <svg
        class="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      本月增长 12%
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAccountStore, networkInfo } from "../stores/account";
import { storeToRefs } from "pinia";
import { ref } from "vue";

import { createPublicClient, formatEther, http } from "viem";
import { useRouter } from "vue-router";

const accountStore = useAccountStore();
const { accountAddress } = storeToRefs(accountStore);
const balance = ref<bigint>();
const isLoading = ref<boolean>(true);
const router = useRouter();

if (!accountAddress.value) {
  console.log("No Address");
  router.push({ path: "/auth/login" });
} else {
  const client = createPublicClient({
    chain: networkInfo.currentChain,
    transport: http(networkInfo.rpcUrl),
  });

  client
    .getBalance({
      address: accountAddress.value as `0x${string}`,
      blockTag: "safe",
    })
    .then((result) => {
      balance.value = result;
      isLoading.value = false;
    })
    .catch((err) => {
      console.error("Error fetching balance:", err);
      isLoading.value = false;
    });
}

</script>