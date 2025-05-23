<template>
    <div class="simoo-component simoo-note ql-container ql-snow" :style="{
        left: position.x + 'px',
        top: position.y + 'px',
    }" :class="{ 'selected': state.isSelected, 'editing': state.isEditing }" @mousedown="onMouseDown">
        <!-- 富文本编辑器 -->
        <div ref="editorRef" :style="{
            width: size.width + 'px',
            height: size.height + 'px',
        }"></div>
        <!-- 右下角调整大小图标 -->
        <div class="resize-handle" @mousedown="onResizeStart">1</div>
        <!-- 动态生成唯一的工具栏 -->
        <div :id="'toolbar-' + props.simooComData.id" class="ql-toolbar" v-show="state.isEditing">
            <span class="ql-formats">
                <select class="ql-font"></select>
                <select class="ql-size"></select>
            </span>
            <span class="ql-formats">
                <button class="ql-bold"></button>
                <button class="ql-italic"></button>
                <button class="ql-underline"></button>
                <button class="ql-strike"></button>
            </span>
            <span class="ql-formats">
                <select class="ql-color"></select>
                <select class="ql-background"></select>
            </span>
            <span class="ql-formats">
                <button class="ql-list" value="ordered"></button>
                <button class="ql-list" value="bullet"></button>
                <button class="ql-indent" value="-1"></button>
                <button class="ql-indent" value="+1"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-direction" value="rtl"></button>
                <select class="ql-align"></select>
            </span>
            <span class="ql-formats">
                <button class="ql-link"></button>
                <button class="ql-image"></button>
                <button class="ql-video"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-formula"></button>
                <button class="ql-code-block"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-clean"></button>
            </span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { reactive } from 'vue';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // 引入 Quill 的样式文件
import emitter from '@/utils/emitter';
import useBoardStore from '@/stores/board';

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
        content: {
            html: string;
        };
    };
}>();


const boardStore = useBoardStore();
// 修改后续使用 props 的地方，使用 simoo-com-data
const position = props.simooComData.position;
const size = props.simooComData.size;
const content = props.simooComData.content;
const state = reactive({
    isDragging: false,
    isSelected: false,
    isEditing: false,
    isResizing: false,
});


const editorRef = ref<HTMLElement | null>(null);
let quill: Quill | null = null;
onUnmounted(() => {
    
})

/* 处理删除状态*/
const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' && state.isSelected) {
        boardStore.deleteSimooCom(props.simooComData.id);
    }
};
onMounted(() => {
    window.addEventListener('keydown', onKeyDown); 
})
onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown);
});

onMounted(() => {
    if (editorRef.value) {
        quill = new Quill(editorRef.value, {
            theme: 'snow',
            readOnly: true,
            modules: {
                toolbar: '#toolbar-' + props.simooComData.id // 绑定到唯一的工具栏 ID
            }
        });
        // 初始化内容
        quill.root.innerHTML = content.html;
        // 监听内容变化
        quill.on('text-change', () => {
            content.html = quill?.getSemanticHTML() ?? '';
        });
    }

    // 全局取消选中状态
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.simoo-note')) {
            // 如果点击的不是 simoo-note 组件，重置状态
            state.isSelected = false;
            state.isEditing = false;
            quill?.disable(); // 禁用编辑器
        }
    });

    // 点击simoo取消选中状态
    emitter.on('simoo:select', (id: string) => {
        if (id !== props.simooComData.id) {
            state.isSelected = false;
            state.isEditing = false;
            quill?.disable();
        }
    });
   
});



// 在点击事件中触发全局事件
const onMouseDown = (e: MouseEvent) => {
    // if (!state.isResizing) return
    // 处理拖动状态
    state.isDragging = true;
    // 记录初始位置
    const initialX = e.clientX;
    const initialY = e.clientY;
    const initialPosX = position.x;
    const initialPosY = position.y;
    let dx = 0
    let dy = 0

    const onMouseMove = (e: MouseEvent) => {
        if (state.isDragging && !state.isEditing) {
            dx = e.clientX - initialX;
            dy = e.clientY - initialY;
            position.x = initialPosX + dx;
            position.y = initialPosY + dy;
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
                quill?.enable();
                quill?.focus();
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
        size.width = Math.max(100, initialWidth + dx); // 最小宽度为 200px
        size.height = Math.max(50, initialHeight + dy); // 最小高度为 50
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
.ql-toolbar {
    position: fixed;
    top: 20px;
    left: 50%;

    transform: translate(-50%, 0%);
    display: flex;
    align-items: center;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.ql-editor {
    overflow: visible;
}

.ql-container {
    height: auto;
    /* 取消默认的 100% 高度 */
}

.editing {
    .ql-editor>* {
        cursor: text;
    }
}

.ql-editor>* {
    cursor: move;
}

.ql-container.ql-snow {
    border: 1px solid #ccc !important;
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
    z-index: 1;
}

.simoo-note:hover .resize-handle {
    opacity: 1;
}

.ql-formats {
    display: flex !important;
    justify-content: center;
    border-right: 1px solid #ccc;
}
</style>
<style scoped>
.simoo-note {
    min-width: var(--minw, 200px);
    /* 默认宽度 100px */
    min-height: var(--minh, 30px);
    position: absolute;
    cursor: move;
    background-color: rgb(255, 255, 255);


}


.simoo-note.editing {
    cursor: text;
}

.selected {
    border: 1px solid black !important;
}

.simoo-note.editing {
    border: 1px dashed rgb(15, 67, 85) !important;
}
</style>