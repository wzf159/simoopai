<template>
  <!-- 这里可以添加 SimooBoard 的模板代码 -->
  <div class="simoo-board" @dragover="onDragOver" @drop="onDrop" ref="boardRef">
    <!-- 显示添加的组件 -->
    <div v-for="(component) in allSimooNotes" :key="component.id">
      <SimooNote :simoo-com-data="component" />
    </div>
    <div v-for="(component) in allSimooImages" :key="component.id">
      <SimooImageCom :simoo-com-data="component" />
    </div>
    <div v-for="(component) in allSimooColumns" :key="component.id">
      <SimooColumn :simoo-com-data="component" />
    </div>
    <div v-for="(component) in allSimooToBoards" :key="component.id">
      <SimooToBoard :simoo-com-data="component" />
    </div>
    <!-- 
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
import SimooColumn from './SimooColumn.vue';
import SimooToBoard from './SimooToBoard.vue';
import useBoardStore from '@/stores/board.ts'; // 引入你的 store from '@/stores/board.ts'; // 引入你的 store
// 这里可以添加 SimooBoard 的逻辑代码
import { computed } from 'vue';
import { ElMessage } from 'element-plus'
import { onMounted, onUnmounted, ref } from 'vue';

const store = useBoardStore();
const allSimooNotes = computed(() => store.getAllSimooNotes);
const allSimooImages = computed(() => store.getAllSimooImages);
const allSimooColumns = computed(() => store.getAllSimooColumns);
const allSimooToBoards = computed(() => store.getAllSimooToBoards);
import type { SimooImage } from '@/stores/board.ts';


// 添加缩放相关变量
const scale = ref(1);
const boardRef = ref<HTMLElement | null>(null);
// 添加视窗拖拽相关变量
const isDraggingView = ref(false);
const startDragPos = ref({ x: 0, y: 0 });
const scrollPos = ref({ x: 0, y: 0 });


// 鼠标中键按下事件
const onMiddleMouseDown = (e: MouseEvent) => {
  if (e.button === 1) { // 1 表示鼠标中键
    e.preventDefault();
    isDraggingView.value = true;
    startDragPos.value = { x: e.clientX, y: e.clientY };
    scrollPos.value = {
      x: window.scrollX,
      y: window.scrollY
    };
    document.body.style.cursor = 'grabbing';
  }
};

// 鼠标移动事件
const onMouseMove = (e: MouseEvent) => {
  if (isDraggingView.value) {
    const dx = e.clientX - startDragPos.value.x;
    const dy = e.clientY - startDragPos.value.y;
    window.scrollTo({
      left: scrollPos.value.x - dx,
      top: scrollPos.value.y - dy,
      behavior: 'auto'
    });
  }
};

// 鼠标释放事件
const onMouseUp = () => {
  if (isDraggingView.value) {
    isDraggingView.value = false;
    document.body.style.cursor = '';
  }
};

// 在onMounted中添加事件监听
onMounted(() => {
  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('mousedown', onMiddleMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  resize();
});

// 在onUnmounted中移除事件监听
onUnmounted(() => {
  window.removeEventListener('wheel', handleWheel);
  window.removeEventListener('mousedown', onMiddleMouseDown);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
});
// 处理滚轮事件
const handleWheel = (e: WheelEvent) => {
  if (e.ctrlKey) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    scale.value = Math.max(0.3, Math.min(2, scale.value + delta));

    resize()
  }
};
const resize = () => {
  if (boardRef.value) {
    boardRef.value.style.transform = `scale(${scale.value})`;
    store.$state.currentScale = scale.value;
    boardRef.value.style.transformOrigin = '0 0';
    // 添加下面这行，保持board始终占满视口
    // boardRef.value.style.width = `${200 / scale.value}vw`;
    // boardRef.value.style.height = `calc(${200 / scale.value}vh - ${40 * scale.value}px)`;
  }
}

// // 时刻获取鼠标在board上的位置并打印
// const mousePos = ref({ x: 0, y: 0 });
// onMounted(() => {
//   const board = document.querySelector('.simoo-board');
//   if (board) {
//     board.addEventListener('mousemove', (e) => {
//       // 获取鼠标在board上的位置并打印
//       const rect = board.getBoundingClientRect();
//       mousePos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top };
//     });
//   }
// });


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
  // 计算鼠标位置scall对鼠标位置的影响
  const currentScale = store.$state.currentScale || 1;
  // 需要加上滑动的距离
  const currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const currentScrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  console.log(currentScrollLeft);
  const position = { x: (evt.clientX) / currentScale + currentScrollLeft, y: (evt.clientY - 40) / currentScale + currentScrollTop };
  const newComponent = {
    id: 'simoo' + type + Date.now().toString(),
    type: type,
    title: {
      name: 'new ' + type,
      headColor: 'none'
    },
    position: position,
    size: { width: 300, height: 50 }
  };
  store.addSimooCom(newComponent);
}

/***  复制组件 ***/
const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' && state.isSelected && !state.isEditing) {
        boardStore.deleteSimooCom(props.simooComData.id);
    }
    // 添加复制粘贴逻辑
    if (e.ctrlKey && e.key === 'c' && state.isSelected) {
        e.preventDefault();
        boardStore.copySimooCom(props.simooComData.id);
    }
    if (e.ctrlKey && e.key === 'v' && state.isSelected) {
        e.preventDefault();
        boardStore.pasteSimooCom();
    }
};

// // ctrl+v 粘贴图片
// onMounted(() => {
//   window.addEventListener('keydown', onKeyDown);
// });

// onUnmounted(() => {
//   window.removeEventListener('keydown', onKeyDown);
// });


// let lastTriggerTime = 0;
// const debounceTime = 500; // 防抖时间，单位毫秒
// const onKeyDown = (event: KeyboardEvent) => {
//   if (event.ctrlKey && event.key === 'v') {
//     // 识别各种复制的图片格式，包括在网页上复制的图片，在pc复制的图片


//     const currentTime = Date.now();
//     if (currentTime - lastTriggerTime > debounceTime) {
//       navigator.clipboard.read().then((clipboardItems) => {
//         let hasImage = false;
//         for (const clipboardItem of clipboardItems) {
//           for (const type of clipboardItem.types) {
//             if (type.indexOf('image') !== -1) {
//               clipboardItem.getType(type).then((blob) => {
//                 // 这里的 blob 就是图片文件
//                 console.log(blob);
//                 addSampleImage(blob);
//               });

//               lastTriggerTime = currentTime;
//               hasImage = true;
//               return;
//             }
//           }
//         }
//         if (!hasImage) {
//           console.log('未检测到图片');
//           ElMessage.warning('未检测到图片');
//         }
//       });
//     }
//   }
// };


// // 修复了类型定义的错误，将参数类型从 blob 改为 Blob
// const addSampleImage = (blob: Blob) => {
//   const sampleImage: SimooImage = {
//     id: 'sample-image',
//     type: 'image',
//     title: {
//       name: 'new Image',
//       headColor: '#000000'
//     },
//     position: {
//       x: 0,
//       y: 0
//     },
//     size: {
//       width: 200,
//       height: 200
//     },
//     content: {
//       url: new Blob(),
//       caption: {
//         show: false,
//         text: ''
//       }
//     }
//   };
//   const mouseX = window.innerWidth / 2;
//   const mouseY = window.innerHeight / 2;
//   sampleImage.position = {
//     x: mouseX,
//     y: mouseY
//   }
//   sampleImage.content.url = blob;
//   console.log(sampleImage.position);

//   store.addSimooImageByCopy(sampleImage);
// };
</script>

<style scoped lang="scss">
.simoo-board {
  /* 定义背景颜色和大小 */
  background-color: #f0f0f0;
  /* 浅色背景 */
  background-image: radial-gradient(#ccc 10%, transparent 10%);
  /* 创建波点 */
  background-size: 20px 20px;
  /* 波点大小和间距 */
  background-position: 0 0, 10px 10px;
  min-width: 100%;
  min-height: calc(100% - 40px);
  width: 10000px;
  height: 10000px;

  transform-origin: 0 0;
  /* 确保缩放从左上角开始 */
}
</style>