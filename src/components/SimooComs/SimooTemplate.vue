<template>
    <div class="simoo-component"
        :style="{ left: position.x + 'px', top: position.y + 'px', width: size.width + 'px', height: size.height + 'px' }"
        @mousedown="onMouseDown" @mouseover="onMouseOver" @mouseout="onMouseOut">
        <!-- 组件内容 -->
    </div>
</template>

<script lang="ts" setup>

import { reactive } from 'vue'

// 通用组件属性
const props = defineProps<{
    id: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
}>()


const state = reactive({
    isDragging: false,
    isSelected: false,
    minSize: { width: 50, height: 50 }
})


// 鼠标按下事件处理
const onMouseDown = (e: MouseEvent) => {
    // 处理选中状态
    state.isSelected = true
    // 处理拖动状态
    state.isDragging = true
    // 记录初始位置
    const initialX = e.clientX
    const initialY = e.clientY
    const initialPosX = props.position.x
    const initialPosY = props.position.y

    const onMouseMove = (e: MouseEvent) => {
        if (state.isDragging) {
            const dx = e.clientX - initialX
            const dy = e.clientY - initialY
            props.position.x = initialPosX + dx
            props.position.y = initialPosY + dy
        }
    }

    const onMouseUp = () => {
        state.isDragging = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}

// 鼠标悬停事件处理
const onMouseOver = () => {
    // 显示缩放图标
}

// 鼠标移出事件处理
const onMouseOut = () => {
    // 隐藏缩放图标
}
</script>

<style scoped>
.simoo-component {
    min-width: var(--minw, 50px);
    min-height: var(--minh, 50px);
    position: absolute;
    cursor: move;
}

.simoo-component.selected {
    border: 1px solid black;
}
</style>