<script setup lang="ts">
import SimooBoard from './components/SimooComs/SimooBoard.vue'
// 清空store
import useBoardStore from '@/stores/board';
const boardStore = useBoardStore();
// 清空store
boardStore.$reset();
// 获取simooboardFirst
import axiosIns from '@/utils/axios'
axiosIns.get('/files/simooboardFirst').then(response => {
  boardStore.setStoreValue(response)
})
</script>

<template>
  <SimooBoard />
</template>
<style>
html {
  font-size: 14px;
}
</style>
<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
