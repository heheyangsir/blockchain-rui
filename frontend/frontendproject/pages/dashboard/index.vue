<script setup lang="ts">
import { useAccountStore, networkInfo } from "../../stores/account";
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

<template>
  <div v-if="!isLoading">{{ formatEther(balance!) }} ETH</div>
</template>
