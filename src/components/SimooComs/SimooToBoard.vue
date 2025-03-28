<template>
    <div :id="simooComData.id" class="simoo-component simoo-to-board" :style="{
        left: position.x + 'px',
        top: position.y + 'px',
    }" :class="{ 'selected': state.isSelected, 'editing': state.isEditing }" @mousedown="onMouseDown">
        <!-- 添加双击事件监听器 -->
        <div class="icon" :style="{ backgroundColor: content.color }" @dblclick="onIconDoubleClick">{{ content.icon }}
        </div>
        <!-- <div class="name">{{ content.name }}</div> -->
        <div class="name-box">
            <div class="name" :contenteditable="state.isEditing" v-html="content.name" @focusout="focusout"
                ref="textRef">
            </div>
            <div class="card">{{ content.cardNum }} cards</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { reactive } from 'vue';
import 'quill/dist/quill.snow.css'; // 引入 Quill 的样式文件
import emitter from '@/utils/emitter';
import useBoardStore from '@/stores/board';
import axiosIns from '@/utils/axios';

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
// const size = props.simooComData.size;
const content = props.simooComData.content;
content.name ? '' : content.name = 'new board'
content.cardNum ? '' : content.cardNum = 0
// 随机颜色
content.icon ? '' : getEmojiByName(content.name)
content.color ? '' : content.color = '#' + Math.floor(Math.random() * 0xffffff).toString(16) + '77';

const state = reactive({
    isDragging: false,
    isSelected: false,
    isEditing: false,
    isResizing: false,
});

/* icon */
// 根据content.name给content.icon 赋值，内容范围为window的表情符号
import emojiDictionary from 'emoji-dictionary';
function getEmojiByName(name: string) {
    const allEmojiKeys = emojiDictionary.names;
    // 调用接口翻译name为英文
    axiosIns.get('/translate/', { params: { text: name } }).then(response => {
        const translatedName = response.translation;
        const lowerCaseName = translatedName.toLowerCase();
        const matches = [];
        let bestMatchScore = 0; // 用于存储最佳匹配的分数
        allEmojiKeys.forEach((key) => {
            const emojiName = key.toLowerCase();
            const commonWords = lowerCaseName.split(' ').filter(word => emojiName.includes(word));
            const score = commonWords.length;

            if (score > bestMatchScore) {
                bestMatchScore = score;
                matches.length = 0; // 清空之前的匹配结果
                matches.push(key);
            } else if (score === bestMatchScore) {
                matches.push(key);
            }
        });

        if (matches.length > 0) {
            const randomIndex = Math.floor(Math.random() * Math.min(matches.length, 10));
            content.icon = emojiDictionary.getUnicode(matches[randomIndex]);
        }
        updateBoard()
    })
}
function updateBoard() {
    axiosIns.put('/files/' + props.simooComData.id, {
        id: props.simooComData.id,
        content: {
            icon: content.icon,
            color: content.color,
            name: content.name,
            cardNum: content.cardNum,
        },
        componentSelected: {
            colnumID: '',
            componentID: '',
        }
    });
}

/* 处理board  name */
const textRef = ref<HTMLDivElement | null>(null);
// 新增变量，用于记录开始编辑时的内容
const initialName = ref('');

const focusout = () => {
    // 删除所有回车
    if (textRef.value?.innerHTML) {
        textRef.value.innerHTML = textRef.value.innerHTML.replace(/<br>/g, '');
    }

    // 如果内容为空，则恢复为初始内容
    if (!textRef.value?.innerHTML) {
        textRef.value ? textRef.value.innerHTML = initialName.value : '';
        content.name = initialName.value;
    } else if (textRef.value && textRef.value.innerHTML === initialName.value) {
        // 如果内容没有变化，则恢复为初始内容
    } else {
        // 如果内容有变化，则更新内容
        content.name = textRef.value?.innerHTML || '';
        getEmojiByName(content.name);
    }
    // 恢复编辑状态
    state.isEditing = false;
};

/* 处理删除状态*/
import { ElMessage } from 'element-plus';
const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' && state.isSelected && !state.isEditing) {
        // 根据id，通过axios获取到该组件的数据
        axiosIns.get('/files/' + props.simooComData.id).then(response => {
            if (Object.keys(response.components).length === 0) {
                boardStore.deleteSimooCom(props.simooComData.id);
                // 
                axiosIns.delete('/files/' + props.simooComData.id).then(response => {
                    ElMessage.success('删除成功');
                })
            } else {
                ElMessage.warning('请先删除该组件下的所有子组件');
            }
        })

    } else if (e.key === 'Enter' && state.isEditing) {
        e.preventDefault(); // 阻止默认的回车换行行为
        focusout()
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

/* 点击及拖动逻辑处理 */
const onMouseDown = (e: MouseEvent) => {
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
                // 记录开始编辑时的内容
                initialName.value = content.name;
                // 监听回车事件
                textRef.value?.addEventListener('keydown', onKeyDown);
            }
        }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};

/* 进入board */
// 新增双击事件处理函数
import { useBreadcrumbStore } from '@/stores/breadcrumb.ts'; // 引入新的 store
const breadcrumbBoards = useBreadcrumbStore(); // 使用新的 store
const onIconDoubleClick = async () => {
    try {
        const response = await axiosIns.get(`/files/${props.simooComData.id}`);
        breadcrumbBoards.addBoard({ id: props.simooComData.id, name: content.name, color: content.color });

        const data = response;
        boardStore.setStoreValue(data);
    } catch (error) {
        console.error('请求文件失败:', error);
    }
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

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100px;
    // height: 100px;
    padding: 4px;

    .icon {
        font-size: 60px;
        height: 62px;
        width: 62px;
        padding: auto;
        color: #333;
        margin-bottom: 5px;
        border-radius: 3px;
        padding-top: 7px;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px, rgb(51, 51, 51) 0px 0px 0px 3px;



    }

    .name-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }


    .name {
        min-height: 26px;
        width: 150px;
        font-size: 20px;
        color: #333;
        background-color: #33300000;
        font-weight: bold;
        align-items: center;
        justify-content: center;
        word-wrap: break-word;
        text-align: center;
        box-sizing: border-box;
        padding: 3px;
        font-family: 'Times New Roman', Times, serif;
    }



    .card {
        text-align: center;
        font-size: 16px;
        color: #808080;
        padding: 3px;
    }
}


.simoo-to-board.editing {
    cursor: text;

    .name {
        background-color: rgba(255, 255, 255, 1);
    }
}

.icon {
    box-shadow: rgba(6, 24, 44, 0.1) 0px 0px 0px 1px, rgba(6, 24, 44, 0.1) 0px 4px 6px -1px, rgba(255, 255, 255, 0.1) 0px 1px 0px inset;

}

.selected .icon {
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

.editing .icon {
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