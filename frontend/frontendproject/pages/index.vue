<script setup lang="ts">
import { ref } from "vue";
import { createPublicClient, http, parseAbi, formatEther } from "viem";

import type { CSSProperties } from 'vue';

const cardStyle: CSSProperties = {
  width: '1400px',
  height: '700px',
};
const imgStyle: CSSProperties = {
  display: 'block',
  width: '1500px',
};

const selectedAccountIndex = ref<int>();
const result = ref<string>("");

// 用于标记钱包是否已连接且网络正确
const walletConnected = ref(false);

// 定义目标网络信息
const targetChainId = "0x7A69";
const targetRpcUrl = "http://localhost:8545";

// 创建 viem 的只读客户端（仅用于调用查询方法，不需要签名）
const client = createPublicClient({
  transport: http(targetRpcUrl),
});

const accountAddressArray = ref<string[]>([]); // List<string> List().push()

// 连接 MetaMask，并切换到目标网络
async function connectWallet() {
  if (window.ethereum) {
    try {
      // 请求钱包连接
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      accountAddressArray.value.push(...accounts);
      // 尝试切换到目标网络
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });
      walletConnected.value = true;
    } catch (error: any) {
      console.error("报错了", error);
    }
  } else {
    console.error("请安装 MetaMask 插件");
  }
}

// 调用合约的查询函数
async function queryResource(address: string) {
  try {
    const res = await client.getBalance({
      address: address,
      blockTag: "safe",
    });
    result.value = ` ${res.toString()}`;
  } catch (error) {
    console.error(error);
    result.value = "查询失败";
  }
}
</script>

<template>
  <a-card class="container mx-auto" :body-style="{ padding: 0, overflow: 'hidden' }">
    <a-flex justify="space-between">
      <img
        alt="avatar"
        src="/workspaces/blockchain-rui/frontend/frontendproject/public/one.png"
        class="aspect-auto"
      />
      <a-flex vertical align="flex-end" justify="space-between" :style="{ padding: '32px' }">
        <a-typography>
          <a-typography-title :level="3">
            欢迎使用
          </a-typography-title>
          <div class="w-1/3 p-4">
            <button
              v-if="!walletConnected"
              @click="connectWallet"
              class="btn bg-gray-200 border rounded-md px-4 m-2"
            >
              连接 MetaMask
            </button>

            <ul class="space-y-2" v-if="walletConnected">
              <li
                v-for="(item, i) in accountAddressArray"
                :key="i"
                @click="queryResource(item)"
                class="p-3 border rounded-md cursor-pointer select-none"
              >
                {{ item }}
              </li>
            </ul>
            <p v-if="result">该账户余额为: {{ formatEther(result) }} ETH</p>
          </div>
        </a-typography>
        <a-button v-if="walletConnected" type="primary" href="http://localhost:3000/about" target="_blank">
        Get Start
        </a-button>
      </a-flex>
    </a-flex>
  </a-card>
  
</template>
