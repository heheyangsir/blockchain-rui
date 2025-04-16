<template>
    <div class="h-screen flex flex-col items-center justify-center bg-gray-100">
      <!-- 头部导航栏 -->
      <header class="w-full p-4 bg-white shadow-lg text-center">
        <div class="container mx-auto">
          <h1 class="text-2xl font-bold text-blue-500">My App</h1>
          <nav class="space-x-4 mt-2">
            <NuxtLink to="/" class="hover:underline">首页</NuxtLink>
            <NuxtLink to="/about" class="hover:underline text-blue-500">关于我们</NuxtLink>
          </nav>
        </div>
      </header>
  
      <!-- 主内容区（垂直居中） -->
      <main class="flex-1 flex flex-col items-center justify-center text-center">
        <h2 class="text-4xl font-extrabold mb-8 text-gray-800">关于我们</h2>
        <p class="text-gray-600 text-lg mb-12 max-w-md">
          我们是一家致力于通过技术创新改善用户体验的公司。成立于2020年，我们的使命是打造简单、高效、美观的工具，帮助用户完成日常工作。
        </p>
        <!-- 团队介绍 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          <div
            v-for="member in team"
            :key="member.id"
            class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition duration-200"
          >
            <img
              :src="member.avatar"
              alt="头像"
              class="w-24 h-24 mx-auto rounded-full mb-4"
            />
            <h4 class="text-lg font-medium text-blue-500 mb-2">{{ member.name }}</h4>
            <p class="text-gray-600">{{ member.position }}</p>
          </div>
        </div>
      </main>
  
      <!-- 底部 -->
      <footer class="w-full p-4 text-center bg-black text-gray-400">
        <div class="container mx-auto">
          <p>© 2023 My App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  </template>
  
  <script setup lang="ts">
  // 团队成员数据
  interface TeamMember {
    id: number;
    name: string;
    position: string;
    avatar: string;
  }
  
  const team: TeamMember[] = [
    {
      id: 1,
      name: "张三",
      position: "首席执行官（CEO）",
      avatar: "/avatars/avatar1.jpg", // 确保有对应的图片文件
    },
    {
      id: 2,
      name: "李四",
      position: "首席技术官（CTO）",
      avatar: "/avatars/avatar2.jpg",
    },
    {
      id: 3,
      name: "王五",
      position: "产品总监",
      avatar: "/avatars/avatar3.jpg",
    },
  ];
  </script>