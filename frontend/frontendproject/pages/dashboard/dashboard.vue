<template>
  <div class="p-6">
    <!-- 主标题 -->
    <h1 class="text-2xl font-bold mb-6">数据看板</h1>

    <!-- 数据卡片网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <UserUpload />
      <UserSearch />
      <UserActive />
      <UserBalance />
    </div>

    <!-- 图表区 -->
    <div class="bg-white rounded-lg shadow p-6">
      <UserChart />
    </div>
  </div>
</template>

<script setup lang="ts">
import UserUpload from "../../components/Card/UserUpload.vue";
import UserSearch from "../../components/Card/UserSearch.vue";
import UserActive from "../../components/Card/UserActive.vue";
import UserBalance from "../../components/Card/UserBalance.vue";
import UserChart from "../../components/UserChart.vue";
</script>
