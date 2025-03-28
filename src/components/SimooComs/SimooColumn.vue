<template>
  <div :id="simooComData.id" class="simoo-colnum" :class="{ 'selected': state.isSelected, 'editing': state.isEditing }"
    :style="{
    left: position.x + 'px',
    top: position.y + 'px',
    width: size.width + 'px',
  }" @mousedown="onMouseDown" @mouseup="onMouseUpInCol">
    <div class="name">{{ title.name }}</div>
    <div class="count">{{ content.coms.length }}</div>
    <div class="colnum-content">
      <!-- 显示添加的组件 -->
      <div v-for="(component, index) in content.coms" :key="component.id">
        <div class="comIndex" @mouseenter="comIndex = index" @mouseleave="comIndex = -1"></div>
        <SimooNote :simoo-com-data="component" v-if="component.type === 'note'" />
        <SimooImageCom :simoo-com-data="component" v-else-if="component.type === 'image'" />
        <SimooToBoard :simoo-com-data="component" v-else-if="component.type === 'toBoard'" />
      </div>
    </div>
    <!-- 右下角调整大小图标 -->
    <div class="resize-handle" @mousedown="onResizeStart"></div>

  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, onUnmounted } from 'vue';
import useBoardStore from '@/stores/board';
import emitter from '@/utils/emitter';
import SimooNote from './SimooNote.vue'
import SimooImageCom from './SimooImage.vue'
import SimooToBoard from './SimooToBoard.vue'
import type { SimooComponent } from '@/stores/board';
const boardStore = useBoardStore();
// 定义组件属性
const props = defineProps<{
  simooComData: {
    id: string;
    type: string;
    title: {
      name: string;
      headColor: string;
    }
    position: { x: number; y: number };
    size: { width: number; height: number };
    content: { coms: SimooComponent[] };
  };
}>();

// 修改后续使用 props 的地方，使用 simoo-com-data
const title = props.simooComData.title;
const position = props.simooComData.position;
const size = props.simooComData.size;
const content = boardStore.getSimooColumnContent(props.simooComData.id);
let comIndex = -1

const state = reactive({
  isDragging: false,
  isSelected: false,
  isEditing: false,
  isResizing: false,
});


/* 处理拖动组件到col状态 */
function onMouseUpInCol() {
  console.log('onMouseUpInCol');
  if (boardStore.$state.componentSelected.componentID == props.simooComData.id) return
  if (!boardStore.$state.componentSelected.componentID) return
  boardStore.moveComToColumn(boardStore.$state.componentSelected.componentID, props.simooComData.id, comIndex);
  boardStore.$state.componentSelected.componentID = '';
}


/* 处理删除状态*/
onMounted(() => {
  document.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown);
});

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Delete' && state.isSelected) {
    boardStore.deleteSimooCom(props.simooComData.id);
  }
};

/* 选中状态 */
onMounted(() => {
  // 全局取消选中状态
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.simoo-colnum')) {
      // 如果点击的不是 simoo-note 组件，重置状态
      state.isSelected = false;
      state.isEditing = false;

    }
  });

  // 点击simoo取消选中状态
  emitter.on('simoo:select', (id: string) => {
    if (id !== props.simooComData.id) {
      state.isSelected = false;
      state.isEditing = false;

    }
  });

});

/* 点击及拖动逻辑处理 */
const onMouseDown = (e: MouseEvent) => {
  // 处理拖动状态
  console.log('mouse down');
  state.isDragging = true;
  // 记录初始位置
  const initialX = e.clientX;
  const initialY = e.clientY;
  const initialPosX = position.x;
  const initialPosY = position.y;
  let dx = 0
  let dy = 0

  const onMouseMove = (e: MouseEvent) => {
    // console.log('onMouseMove');
    dx = e.clientX - initialX;
    dy = e.clientY - initialY;
    if (state.isDragging && !state.isEditing) {

      position.x = initialPosX + dx;
      position.y = initialPosY + dy;
      e.stopPropagation();
    }
  };

  const onMouseUp = () => {
    state.isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);


    if (dx == 0 && dy == 0) {
      // 处理点击事件
      emitter.emit('simoo:select', props.simooComData.id); // 触发全局事件
      if (state.isSelected == false) {
        state.isSelected = true;
      } else {
        state.isEditing = true;
      }
    }
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

};



/* 处理调整大小状态 */
const onResizeStart = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  const initialX = e.clientX;
  const initialY = e.clientY;
  const initialWidth = size.width;
  const initialHeight = size.height;

  const onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - initialX;
    const dy = e.clientY - initialY;
    size.width = Math.max(200, initialWidth + dx); // 最小宽度为 200px
    size.height = Math.max(50, initialHeight + dy); // 最小高度为 50
    console.log(props.simooComData.id);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};
</script>
<style lang="scss">
.simoo-colnum {

  .simoo-image,
  .simoo-note,
  .simoo-to-board {
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    z-index: 10 !important;
  }

  .simoo-to-board {
    flex-direction: row;
    justify-content: start;
    width: calc(100% - 10px) !important;
    background-color: #11111110;
    padding: 10px 0 5px 10px;

    .name-box {
      margin-left: 20px;
    }

    .card {
      box-sizing: border-box;
    }

    .name,
    .card {
      width: calc(100% - 10px);
      align-items: left;
      text-align: left;
    }
  }

  .ql-container {
    width: 100% !important;
  }
}
</style>
<style scoped lang="scss">
.simoo-colnum {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 1%;
  // 禁止文字选中
  user-select: none;
  -webkit-user-select: none;
  /* Safari */
  -moz-user-select: none;
  /* Firefox */
  -ms-user-select: none;
  /* IE10+/Edge */
  z-index: 10;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;

  &:hover {
    cursor: pointer;
  }

  .name,
  .count {
    /* 使用flexbox布局实现水平和垂直居中 */
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */

  }

  .name {
    font-size: 20px;
    font-weight: bold;
    padding: 5px 0;
  }

  .count {
    margin-bottom: 5px;
  }

  .colnum-content {
    display: grid;
    gap: 5px;
  }

  .comIndex {
    height: 8px;

    &:hover {
      box-shadow: rgba(240, 46, 170, 0.4) 0px 0px 0px 2px inset;
      // box-shadow:rgba(240, 46, 170, 0.4)  0px 50px 100px -20px, rgba(240, 46, 170, 0.4)  0px 30px 60px -30px, rgba(240, 46, 170, 0.4)  0px -2px 6px 0px inset;
    }
  }

  .resize-handle {
    position: absolute;
    right: -5px;
    bottom: -5px;
    width: 15px;
    height: 15px;
    background-color: #333;
    border-radius: 50%;
    cursor: se-resize;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    z-index: 20;
  }


  &:hover .resize-handle {
    opacity: 1;
  }

  &.selected {
    box-shadow: rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
  }

  &.editing {
    box-shadow: rgb(85, 91, 255) 0px 0px 0px 3px, rgb(31, 193, 27) 0px 0px 0px 6px, rgb(255, 217, 19) 0px 0px 0px 9px, rgb(255, 156, 85) 0px 0px 0px 12px, rgb(255, 85, 85) 0px 0px 0px 15px;
  }

}
</style>