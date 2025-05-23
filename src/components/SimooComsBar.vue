<template>
  <!-- 面包屑导航 -->
  <div class="breadcrumb">
    <span class="bread" v-for="(board, index) in breadcrumbStore.breadcrumbBoards" :key="index"
      @click="navigateToBoard(index)">
      <span class="color-block" :style="{ backgroundColor: board.color }"></span>
      <span class="bread-text">{{ board.name }}</span>
      <span v-if="index < breadcrumbStore.breadcrumbBoards.length - 1" style="color: '#22222211';font-size: 12px;"> /
      </span>
    </span>
  </div>
  <div class="simoo-coms-bar">
    <div class="simoo-com" v-for="component in components" draggable="true" :key="component.type"
      @dragstart="onDragStart(component, $event)" :title="component.type">
      {{ component.name }}
    </div>
    <img class="image-node" width="20px"
      src="http://gips2.baidu.com/it/u=1674525583,3037683813&fm=3028&app=3028&f=JPEG&fmt=auto?w=1024&h=1024">
    <div style="border: 1px #ccc solid;height: 1px;width: 30px;border-radius: 2px;"></div>
    <!-- 保存按钮 -->
    <div class="button-container">
      <button class="custom-button" @click="save">
        <span class="emoji">💾</span>
        <span class="button-text">保存</span>
      </button>
      <button class="custom-button" @click="getBoardById">
        <span class="emoji">📥</span>
        <span class="button-text">获取</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axiosIns from '@/utils/axios'
import useBoardStore from '@/stores/board.ts';
import { useBreadcrumbStore } from '@/stores/breadcrumb.ts'; // 引入新的 store

const boardStore = useBoardStore()
const breadcrumbStore = useBreadcrumbStore(); // 使用新的 store

// 组件列表
const components = ref([
  { type: 'note', name: '📝' },
  { type: 'column', name: '📇' },
  { type: 'toBoard', name: '📊' },
  // { type: 'image', name: '🖼️' }
])

// 拖拽开始事件处理
const onDragStart = (component: { type: string; name: string }, event: DragEvent) => {
  // 设置拖拽数据
  event.dataTransfer!.setData('text/plain', component.type);
}

// 保存按钮点击事件处理
const save = async () => {
  // 在这里执行board保存操作
  const response = await axiosIns.post('/files/', boardStore.$state);

  console.log(response);
}

const getBoardById = async () => {
  axiosIns.get('/files/simooboardFirst').then(response => {
    boardStore.setStoreValue(response)
  })
}

// 面包屑导航数据
// 进入界面会重新获取当前的 board 信息，然后更新面包屑导航数据。
// 这样，当用户进入新的 board 时，面包屑导航会自动更新。
breadcrumbStore.breadcrumbBoards = [{ id: boardStore.id, name: boardStore.content.name, color: boardStore.content.color }];

// 导航到指定的 board
const navigateToBoard = (index: number) => {
  let currentScale = boardStore.$state.currentScale;
  breadcrumbStore.navigateToBoard(index);
  const targetBoard = breadcrumbStore.breadcrumbBoards[index];
  // 根据 targetBoard.id 实现导航到指定 board 的逻辑
  // 发送请求获取指定 board 的信息
  axiosIns.get(`/files/${targetBoard.id}`).then(response => {
    // 更新 boardStore 中的数据
    boardStore.setStoreValue(response);
    boardStore.$state.currentScale = currentScale;
  });

}



// 添加键盘事件监听
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    save()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped lang="scss">
.simoo-coms-bar {
  position: fixed;
  left: 20px;
  bottom: 50px;
  width: 60px;
  background-color: #ffffff77;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 13px;
  border-radius: 4px;
  z-index: 100;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;

  .simoo-com {
    width: 40px;
    height: 40px;
    font-size: 24px;
    background-color: #e2e2e2bf;
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    /* 禁止用户选中文字 */
    user-select: none;
    border-radius: 4px;

    &:hover {
      background-color: #e0e0e0;
    }
  }

  .button-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px; // 按钮之间的间距
    margin-top: 20px; // 按钮与上面元素的间距
  }

  .custom-button {
    width: 100%;
    padding: 5px;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .emoji {
      font-size: 20px;
    }

    .button-text {
      font-size: 12px;
      margin-top: 2px;
    }

    &:hover {
      background-color: #0056b3;
    }
  }
}

.breadcrumb {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  box-sizing: border-box;
  height: 40px;
  z-index: 100;
  font-size: 16px;
  gap: 10px; // 面包屑之间的间距;

  .bread {
    cursor: pointer;
  }
}

.breadcrumb {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  box-sizing: border-box;
  height: 40px;
  z-index: 100;
  font-size: 16px;
  display: flex;

  .bread {
    display: flex;
    align-items: center;

    .color-block {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 2px;
      position: relative;
      top: 1px;
      margin-right: 5px;
    }

    .bread-text {

      //最后一个黑色，
      &:last-child {
        color: #000;
      }

      color: #b3b3b3;
      font-weight: 600;
    }
  }
}
</style>
