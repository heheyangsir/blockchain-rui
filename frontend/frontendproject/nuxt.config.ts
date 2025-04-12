// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@ant-design-vue/nuxt', '@nuxt/ui', '@pinia/nuxt','@pinia/nuxt',],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {
    public: {
      defaultChainId: 31337,
      defaultRpcUrl: 'http://localhost:8545'
    }
  }
})