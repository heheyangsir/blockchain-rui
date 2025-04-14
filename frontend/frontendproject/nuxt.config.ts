// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@ant-design-vue/nuxt', '@nuxt/ui', '@pinia/nuxt',],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {
    public: {
      defaultChainId: 31337,
      defaultChainName: "Rui",
      defaultRpcUrl: 'http://localhost:8545'
    }
  },
})