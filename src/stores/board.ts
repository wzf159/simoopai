// 导入 pinia 的 defineStore 函数
import { defineStore } from 'pinia';


// 定义一个名为 useBoardStore 的 store
const useBoardStore = defineStore('board', {
    // 定义 store 的状态
    state: (): SimooBoardData => ({
        // 白板的当前缩放比例，初始值为 1
        currentScale: 1,
        // 存储组件的对象，初始为空
        components: {},
    }),
    getters: {
        // 获取所有组件的数组
        getAllSimooComs: (state) => Object.values(state.components),
        // 获取指定 id 的组件
        getSimooComByID: (state) => (id: string) => state.components[id],
        // 获取所有笔记组件的数组
        getAllSimooNotes: (state) => {
            // 过滤出所有 SimooNote 类型的组件
            const notes = Object.values(state.components).filter((com) => {
                return com.type === 'note';
            });
            // 返回所有笔记组件的数组
            return notes as SimooNote[];
        },
        // 获取所有图片组件的数组
        getAllSimooImages: (state) => {
            // 过滤出所有 SimooImage 类型的组件
            const images = Object.values(state.components).filter((com) => {
                return com.type === 'image';
            });
            // 返回所有图片组件的数组
            return images as SimooImage[];
        }

    },
    // 定义 store 的 actions
    actions: {
        // 添加组件的方法 获取组件类型
        addSimooCom(com: SimooComponent) {
            // 如果组件类型为笔记
            if (com.type === 'note') {
                // 初始化笔记组件的内容为空
                (com as SimooNote).content = {
                    html: ''
                };
                // 添加到state中
                // 修正：使用 this 来访问 state
                this.components[com.id] = com;
            } else if (com.type === 'image') {
                // 初始化笔记组件的内容为空 
                com as SimooImage
                // 添加到state中
                // 修正：使用 this 来访问 state
                this.components[com.id] = com;
            }
        },
         // 复制图片添加 SimooImage 组件的方法
         addSimooImageByCopy(image: SimooImage) {
            console.log(image);
            // 生成新的组件 ID
            const newId = `image-${Date.now()}`;
            // 创建新的图片组件
            const newImage: SimooImage = {
                ...image,
                id: newId,
            };
            // 调用添加组件的方法
            // this.components[newId] = image;
            this.addSimooCom(newImage);
        },

        deleteSimooCom(id: string) {
            // 删除指定 id 的组件
            delete this.components[id];
        },
        // 加载新数据的方法
        loadData(data: SimooBoardData) {
            // 用新数据替换当前状态
            Object.assign(this.$state, data);
        },
       
    },
    // 开启数据持久化
    persist: true,
});

// 定义 SimooComponent 接口，包含组件的基本信息
export interface SimooComponent {
    // 组件的唯一标识符
    id: string;
    type: string;

    title: {
        name: string;
        headColor: string;
    }
    // 组件的位置信息
    position: {
        x: number;
        y: number;
    };
    // 组件的尺寸信息
    size: {
        width: number;
        height: number;
    };
}

// 定义 SimooNote 接口，继承自 SimooComponent 并添加了内容属性
export interface SimooNote extends SimooComponent {
    // 笔记的内容
    content: {
        html: string;
    };
}

// 定义 SimooImage 接口，继承自 SimooComponent 并添加了内容属性
export interface SimooImage extends SimooComponent {
    // 笔记的内容
    content: {
        url: Blob;
        caption: {
            show: boolean;
            text: string;
        }
    };
}

// 定义 SimooBoardData 接口，包含白板的当前缩放比例和组件信息
export interface SimooBoardData {
    // 白板的当前缩放比例
    currentScale: number;
    // 存储组件的对象，键为组件的 id，值为 SimooComponent 或 SimooNote 类型
    components: {
        [id: string]: SimooComponent | SimooNote;
    };
}
// 导出 useBoardStore
export default useBoardStore;