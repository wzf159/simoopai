<template>
    <div :id="simooComData.id" class="simoo-component simoo-to-board" :style="{
        left: position.x + 'px',
        top: position.y + 'px',
    }" :class="{ 'selected': state.isSelected, 'editing': state.isEditing }" @mousedown="onMouseDown">
        <div class="icon" :style="{backgroundColor:content.color}">{{ content.icon }}</div>
        <!-- <div class="name">{{ content.name }}</div> -->
        <textarea @input="adjustTextareaHeight"  class="name" v-model="content.name" type="text" name="" id=""  ref="textareaRef"/>
        <div class="card">{{ content.cardNum }}</div>
    </div>
</template>

<script lang="ts" setup>
import { ref,onMounted, onUnmounted } from 'vue';
import { reactive } from 'vue';
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
            icon: string;
            color: string;
            name: string;
            cardNum: number;
        };
    };
}>();


const boardStore = useBoardStore();
// 修改后续使用 props 的地方，使用 simoo-com-data
const position = props.simooComData.position;
const size = props.simooComData.size;
const content = props.simooComData.content;
content.icon?'':content.icon = '🐱‍🚀'
content.name?'':content.name = 'new board'
content.color?'':content.color = '#ffd'
content.cardNum?'':content.cardNum = 0
const state = reactive({
    isDragging: false,
    isSelected: false,
    isEditing: false,
    isResizing: false,
});



/* 处理删除状态*/
import axiosIns from '@/utils/axios'
import { ElMessage } from 'element-plus';
const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' && state.isSelected && !state.isEditing) {
        // 根据id，通过axios获取到该组件的数据
        axiosIns.get('/files/' + props.simooComData.id).then(response => {
            if (Object.keys(response.components).length === 0) {
                boardStore.deleteSimooCom(props.simooComData.id);
                axiosIns.delete('/files/' + props.simooComData.id).then(response => {
                    ElMessage.success('删除成功');
                })
            } else {
                ElMessage.warning('请先删除该组件下的所有子组件');
            }
        })

    }
};
onMounted(() => {
    window.addEventListener('keydown', onKeyDown);
})
onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown);
});

/* 选中状态 */
onMounted(() => {
    // 全局取消选中状态
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.simoo-to-board')) {
            // 如果点击的不是 simoo-to-board 组件，重置状态
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

// 重置高度以获取正确的滚动高度
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const adjustTextareaHeight = () => {
    if (textareaRef.value) {
        // 重置高度以获取正确的滚动高度
        textareaRef.value.style.height = 'auto';
        // 设置高度为滚动高度
        textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
    }
};


/* 点击及拖动逻辑处理 */
const onMouseDown = (e: MouseEvent) => {
    // if (!state.isResizing) return
    // e.preventDefault();
    e.stopPropagation();
    const mouscDownEvent = e;
    // 处理拖动状态
    state.isDragging = true;
    // 记录初始位置
    const initialX = e.clientX;
    const initialY = e.clientY;
    let initialPosX = position.x;
    let initialPosY = position.y;
    //  鼠标点击在note上的象素位置
    let dx = 0
    let dy = 0
    boardStore.$state.componentSelected.componentID = props.simooComData.id
    const onMouseMove = (e: MouseEvent) => {
        if (state.isDragging && !state.isEditing) {
            dx = e.clientX - initialX;
            dy = e.clientY - initialY;
            position.x = initialPosX + dx;
            position.y = initialPosY + dy;
            // 判断是否在colnum中
            if (mouscDownEvent.target?.closest('.simoo-colnum')) {
                console.log('在colnum中');
                // 处理拖动状态
                const colnumID = e.target?.closest('.simoo-colnum')?.id;
                // //在boardStore里操作，从在colnum中移动到board中
                boardStore.moveComToBoard(colnumID, props.simooComData.id);
                // 跟着鼠标移动
                position.x = e.clientX - 30;
                position.y = e.clientY - 20;
                initialPosX = position.x;
                initialPosY = position.y;
                // boardStore.$state.componentSelected.componentID = ''
                return;
            }
        }
    };

    const onMouseUp = () => {
        boardStore.$state.componentSelected.componentID = ''
        console.log('onMouseUp SimooNote');
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

</script>

<style scoped lang="scss">
.simoo-to-board {
    // min-width: var(--minw, 200px);
    // /* 默认宽度 100px */
    // min-height: var(--minh, 30px);
    position: absolute;
    cursor: move;
    // background-color: rgb(255, 255, 255);
    // 禁止文字选中
    user-select: none;
    -webkit-user-select: none;
    /* Safari */
    -moz-user-select: none;
    /* Firefox */
    -ms-user-select: none;
    /* IE10+/Edge */
    z-index: 20;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100px;
    // height: 100px;
    padding: 4px;

    .icon {
        font-size: 60px;
        height:62px;
        width: 70px;
        padding: auto;
        color: #333;
        margin-bottom: 5px;
        border-radius: 3px;
    }

    .name {
        font-size: 16px;
        color: #333;
        padding: 3px;
        height: 20px;
        font-weight: bold;
        align-items: center;
        justify-content: center;
        word-wrap: break-word;
        max-width: 200px;
        text-align: center;
        resize: none; // 禁用默认的调整大小功能
        overflow: hidden; // 隐藏滚动条
        background-color: #33300000;
        border: none; // 移除边框
        font-family: 'Times New Roman', Times, serif
    }
    .card {
        font-size: 16px;
        color: #808080;
        padding: 3px;   
    }
}


.simoo-to-board.editing {
    cursor: text;
}

.simoo-to-board.selected {
    // border: 1px solid black !important;
    box-shadow: rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset;

    // 禁止文字选中
    user-select: auto;
    -webkit-user-select: auto;
    /* Safari */
    -moz-user-select: auto;
    /* Firefox */
    -ms-user-select: auto;
    /* IE10+/Edge */

}

.simoo-to-board.editing {
    // border: 1px dashed rgb(15, 67, 85) !important;
    box-shadow: rgb(85, 91, 255) 0px 0px 0px 3px, rgb(31, 193, 27) 0px 0px 0px 6px, rgb(255, 217, 19) 0px 0px 0px 9px, rgb(255, 156, 85) 0px 0px 0px 12px, rgb(255, 85, 85) 0px 0px 0px 15px;
    box-shadow: rgba(3, 102, 214, 0.3) 0px 0px 0px 3px;
    // 禁止文字选中
    user-select: auto;
    -webkit-user-select: auto;
    /* Safari */
    -moz-user-select: auto;
    /* Firefox */
    -ms-user-select: auto;
    /* IE10+/Edge */
}
</style>