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
  boardStore.$state.content.currentScale = 1;
})
import { onMounted, onUnmounted } from 'vue';

// 键盘事件处理函数
onMounted(() => {
    window.addEventListener('keydown', onKeyDown);
})
onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown);
});
const onKeyDown = (e: KeyboardEvent) => {
    // 添加复制粘贴逻辑
    if (e.ctrlKey && e.key === ',' && boardStore.$state.copyCom.componentIDInBoard) {
        e.preventDefault();
        console.log('ctrl+c');
        boardStore.copySimooCom();
    }
    if (e.ctrlKey && e.key === '.' && boardStore.$state.copyCom.componentIDInBoard) {
        e.preventDefault();
        console.log('ctrl+v');
        boardStore.pasteSimooCom();
    }
};
</script>

<template>
  <div class="app">
    <div style="height: 40px;"></div>
    <SimooBoard />
  </div>
</template>
<style>
html {
  font-size: 14px;
}
</style>
<style scoped>
.app {
  width: 100vw;
  height: 100vh;
}

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
