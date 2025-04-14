<template>
  <div id="app" class="container mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">用户查询</h1>

      <!-- 查询表单 -->
      <form @submit.prevent="search" class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 mb-1"
              >姓名</label
            >
            <input
              type="text"
              id="name"
              v-model="searchForm.name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-1"
              >邮箱</label
            >
            <input
              type="email"
              id="email"
              v-model="searchForm.email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              for="age"
              class="block text-sm font-medium text-gray-700 mb-1"
              >年龄</label
            >
            <input
              type="number"
              id="age"
              v-model="searchForm.age"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              for="status"
              class="block text-sm font-medium text-gray-700 mb-1"
              >状态</label
            >
            <select
              id="status"
              v-model="searchForm.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全部</option>
              <option value="active">活跃</option>
              <option value="inactive">非活跃</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <button
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            查询
          </button>
        </div>
      </form>

      <!-- 查询结果 -->
      <div v-if="results.length > 0" class="mt-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">查询结果</h2>
        <div class="overflow-x-auto">
          <table class="w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  姓名
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  邮箱
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  年龄
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  状态
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(user, index) in results" :key="index">
                <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ user.age }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    "
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ user.status === "active" ? "活跃" : "非活跃" }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    class="text-blue-500 hover:text-blue-700"
                    @click="viewDetails(user)"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 无结果提示 -->
      <div
        v-else-if="searched"
        class="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700"
      >
        没有找到匹配的记录。
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
// import { definePageMeta } from "nuxt/dist/pages/runtime";
import { ref } from "vue";
// 用户类型定义
interface User {
  name: string;
  email: string;
  age: number;
  status: "active" | "inactive";
}

// 查询表单数据
const searchForm = ref({
  name: "",
  email: "",
  age: "",
  status: "",
});

// 查询结果
const results = ref<User[]>([]);
const searched = ref(false);

// 模拟用户数据
const users: User[] = [
  { name: "张三", email: "zhangsan@example.com", age: 25, status: "active" },
  { name: "李四", email: "lisi@example.com", age: 30, status: "inactive" },
  { name: "王五", email: "wangwu@example.com", age: 28, status: "active" },
];

// 查询逻辑
const search = () => {
  searched.value = true;

  // 模拟查询逻辑，根据表单筛选用户
  results.value = users.filter((user) => {
    return (
      (!searchForm.value.name || user.name.includes(searchForm.value.name)) &&
      (!searchForm.value.email ||
        user.email.includes(searchForm.value.email)) &&
      (!searchForm.value.age || user.age === parseInt(searchForm.value.age)) &&
      (!searchForm.value.status || user.status === searchForm.value.status)
    );
  });
};

// 查看详情
const viewDetails = (user: User) => {
  alert(`查看用户 ${user.name} 的详情`);
  // 这里可以跳转到详情页或打开模态框
};
</script>
