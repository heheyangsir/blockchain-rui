<template>
  <!-- 侧边导航 -->
  <aside class="bg-white w-20 md:w-64 shadow-lg flex-shrink-0">
    <div class="p-4 border-b">
      <svg
        class="w-8 h-8 text-blue-600 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
      <h2
        class="hidden md:block text-xl font-bold text-blue-600 text-center mt-2"
      >
        Home
      </h2>
    </div>
    <nav class="p-4">
      <a
        href="#"
        class="flex flex-col md:flex-row items-center p-3 space-y-1 md:space-y-0 md:space-x-3 text-sm font-medium bg-blue-100 rounded-lg text-blue-600"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span class="hidden md:inline">仪表盘</span>
      </a>
    </nav>
  </aside>
</template>
