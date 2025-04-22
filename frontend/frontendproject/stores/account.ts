import { useRouter } from "nuxt/app";
import { defineStore } from "pinia";
import type { Chain } from "viem";
import { hardhat, mainnet } from "viem/chains";

interface AccountState {
  accountAddress: string | null;
  lastUpdateDatetime: number;
}

export interface NetworkInfo {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  currentChain: Chain;
}

export const networkInfo: NetworkInfo = {
  chainId: 31337,
  chainName: "Rui",
  rpcUrl: "http://localhost:8545",
  currentChain: hardhat,
};

const STORAGE_KEY = "accountStore";

export const useAccountStore = defineStore("account", {
  state: (): AccountState => {
    let stored: Partial<AccountState> = {};
    if (typeof window !== "undefined") {
      try {
        stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      } catch (e) {
        console.warn("Failed to parse accountStore from localStorage", e);
      }
    }

    return {
      accountAddress: stored.accountAddress ?? null,
      lastUpdateDatetime: stored.lastUpdateDatetime ?? 0,
    };
  },

  actions: {
    setAccountAddress(address: string) {
      this.accountAddress = address;
      this.lastUpdateDatetime = Date.now();
      this._syncToStorage();
    },

    setupAccountListeners() {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.on("accountsChanged", (_: string[]) => {
          useRouter().replace("/auth/login");
          this.accountAddress = null;
          this.lastUpdateDatetime = Date.now();
          this._syncToStorage();
        });
      }
    },

    disconnect() {
      this.accountAddress = null;
      this.lastUpdateDatetime = Date.now();
      this._syncToStorage();
    },

    _syncToStorage() {
      if (typeof window === "undefined") return;
      const payload: AccountState = {
        accountAddress: this.accountAddress,
        lastUpdateDatetime: this.lastUpdateDatetime,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn("Failed to write accountStore to localStorage", e);
      }
    },
  },
});
