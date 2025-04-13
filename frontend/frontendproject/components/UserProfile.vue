<template>
  <!-- 头像及下拉菜单 -->
  <div
    class="relative"
    @mouseover="showMenu = true"
    @mouseleave="showMenu = false"
  >
    <!-- 头像按钮 -->
    <button class="flex items-center space-x-2 focus:outline-none">
      <img
        src="https://source.unsplash.com/100x100/?avatar"
        class="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-all"
        alt="用户头像"
      />
    </button>

    <!-- 下拉菜单 -->
    <div
      v-show="showMenu"
      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
    >
      <div class="px-4 py-3 border-b">
        <p class="text-sm text-gray-900">管理员</p>
        <p class="text-xs text-gray-500">admin@example.com</p>
      </div>
      <!-- 返回按钮 -->
      <div class="py-1">
        <button
          @click="goBack"
          class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          退出登陆
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const showMenu = ref(false);

const goBack = () => {
  router.go(-1);
  showMenu.value = false;
};
</script>
