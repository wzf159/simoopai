<template>
  <div class="simoo-coms-bar">
    <div class="simoo-com" v-for="component in components" draggable="true" :key="component.type"
      @dragstart="onDragStart(component, $event)" :title="component.type">
      {{ component.name }}
    </div>
    <img class="image-node" width="20px" src="http://gips2.baidu.com/it/u=1674525583,3037683813&fm=3028&app=3028&f=JPEG&fmt=auto?w=1024&h=1024">
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 组件列表
const components = ref([
  { type: 'note', name: '📝' },
  { type: 'column', name: '📊' },
  { type: 'toBoard', name: '📋' },
  { type: 'image', name: '🖼' }
])

// 拖拽开始事件处理
const onDragStart = (component: { type: string; name: string }, event: DragEvent) => {
  // 设置拖拽数据
  event.dataTransfer!.setData('text/plain', component.type);
}


</script>

<style scoped lang="scss">
.simoo-coms-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  .simoo-com {
    width: 80px;
    height: 80px;
    font-size: 34px;
    background-color: #f0f0f0;
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    /* 禁止用户选中文字 */
    user-select: none;

    &:hover {
      background-color: #e0e0e0;
    }
  }
}
</style>
