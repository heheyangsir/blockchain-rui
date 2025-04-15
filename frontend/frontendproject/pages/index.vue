<template>
  <div
    class="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-purple-600 text-white"
  >
    <header class="w-full p-6 text-center">
      <div class="container mx-auto">
        <h1 class="text-4xl font-bold mb-4">My App</h1>
        <nav class="space-x-4">
          <NuxtLink to="/about" class="text-white hover:underline"
            >关于我们</NuxtLink
          >
        </nav>
      </div>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center text-center">
      <h2 class="text-5xl font-extrabold mb-8">欢迎来到未来！</h2>
      <p class="text-lg text-gray-200 mb-12 max-w-md">
        这是一个现代化的全栈应用，帮助你高效完成任务。
      </p>
      <div>
        <NuxtLink
          to="/auth/login"
          class="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-500 hover:text-white transition duration-300"
        >
          立即开始
        </NuxtLink>
      </div>
    </main>

    <footer class="w-full p-4 text-center bg-black text-gray-400">
      <div class="container mx-auto">
        <p>© 2023 My App. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
