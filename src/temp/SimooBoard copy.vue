<template>
  <!-- 这里可以添加 SimooBoard 的模板代码 -->
  <div class="simoo-board" @dragover="onDragOver" @drop="onDrop">
    <!-- 显示添加的组件 -->
    <div v-for="(component) in allSimooNotes" :key="component.id">
      <SimooNote :simoo-com-data="component" />
    </div>
    <div v-for="(component) in allSimooImages" :key="component.id">
      <SimooImageCom :simoo-com-data="component" />
    </div>
    <!-- <div v-for="(component) in allSimooNotes" :key="component.id">
      <SimooNote :simoo-com-data="component" />
    </div>
    <div v-for="(component) in allSimooNotes" :key="component.id">
      <SimooNote :simoo-com-data="component" />
    </div> -->
  </div>
  <SimooComsBar />
  <!-- <SimooToolsBar /> -->
</template>

<script lang="ts" setup>
import SimooComsBar from '../SimooComsBar.vue'
import SimooNote from './SimooNote.vue'
import SimooImageCom from './SimooImage.vue'
import useBoardStore from '@/stores/board.ts'; // 引入你的 store from '@/stores/board.ts'; // 引入你的 store
// 这里可以添加 SimooBoard 的逻辑代码
import { computed } from 'vue';
import { ElMessage } from 'element-plus'

const store = useBoardStore();
window.store = store;
const allSimooNotes = computed(() => store.getAllSimooNotes);
const allSimooImages = computed(() => store.getAllSimooImages);
import type { SimooImage } from '@/stores/board.ts';


// 修复了类型定义的错误，将参数类型从 blob 改为 Blob
const addSampleImage = (blob: Blob) => {
  const sampleImage: SimooImage = {
    id: 'sample-image',
    type: 'image',
    title: {
      name: 'new Image',
      headColor: '#000000'
    },
    position: {
      x: 0,
      y: 0
    },
    size: {
      width: 200,
      height: 200
    },
    content: {
      url: new Blob(),
      caption: {
        show: false,
        text: ''
      }
    }
  };
  const mouseX = window.innerWidth / 2;
  const mouseY = window.innerHeight / 2;
  sampleImage.position = {
    x: mouseX,
    y: mouseY
  }
  sampleImage.content.url = blob;
  console.log(sampleImage.position);

  store.addSimooImageByCopy(sampleImage);
};

// 拖拽经过事件处理
const onDragOver = (evt: DragEvent) => {
  evt.preventDefault();
}

// 拖拽结束事件处理
const onDrop = (evt: DragEvent) => {
  console.log('drop');
  console.log(evt);
  evt.preventDefault();
  const type = evt.dataTransfer!.getData('text/plain');
  // 判断拖拽的组件类型是否是simoo组件的一种
  if (type !== 'note' && type !== 'column' && type !== 'toBoard' && type !== 'image') {
    ElMessage.warning('只能添加simoo组件');
    return;
  }
  const position = { x: evt.clientX, y: evt.clientY };
  const newComponent = {
    id: 'simoo' + type + Date.now().toString(),
    type: type,
    title: {
      name: 'new',
      headColor: 'none'
    },
    position: position,
    size: { width: 200, height: 50 }
  };
  store.addSimooCom(newComponent);
}
import { onMounted, onUnmounted } from 'vue';
onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});

// ctrl+v 粘贴图片
let lastTriggerTime = 0;
const debounceTime = 500; // 防抖时间，单位毫秒
const onKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 'v') {
    const currentTime = Date.now();
    if (currentTime - lastTriggerTime > debounceTime) {
      navigator.clipboard.read().then((clipboardItems) => {
        let hasImage = false;
        for (const clipboardItem of clipboardItems) {
          for (const type of clipboardItem.types) {
            if (type.indexOf('image') !== -1) {
              clipboardItem.getType(type).then((blob) => {
                // 这里的 blob 就是图片文件
                console.log(blob);
                addSampleImage(blob);
              });

              lastTriggerTime = currentTime;
              hasImage = true;
              return;
            }
          }
        }
        if (!hasImage) {
          ElMessage.warning('未检测到图片');
        }
      });
    }
  }
};
</script>

<style scoped>
.simoo-board {
  /* 定义背景颜色和大小 */
  background-color: #f0f0f0;
  /* 浅色背景 */
  background-image: radial-gradient(#ccc 10%, transparent 10%);
  /* 创建波点 */
  background-size: 20px 20px;
  /* 波点大小和间距 */
  background-position: 0 0, 10px 10px;
  /* 波点偏移 */
  width: 100vw;
  height: 100vh;
  /* 占满整个视口高度 */
}
</style>