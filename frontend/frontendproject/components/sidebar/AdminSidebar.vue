<template>
  <nav class="w-64 bg-gray-800 text-white h-screen p-6">
    <div class="text-xl font-bold mb-8">Admin Panel</div>
    <ul class="space-y-2">
      <li>
        <NuxtLink 
          to="/dashboard/user"
          class="flex items-center p-3 rounded hover:bg-gray-700 transition-colors"
          active-class="bg-blue-600"
        >
          <span class="mr-3">📊</span>
          Dashboard
        </NuxtLink>
      </li>
      <li>
        <NuxtLink 
          to="/dashboard/user/search"
          class="flex items-center p-3 rounded hover:bg-gray-700 transition-colors"
          active-class="bg-blue-600"
        >
          <span class="mr-3">🔍</span>
          User Search
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>