# SimooPai 项目

一个基于Vue3和FastAPI的米兰风笔记应用，提供富文本编辑和组件化布局功能。
milanote simple

## run
### 后端backend 8000

```bash
cd .\fastapi\
pip install fastapi requests json random string
uvicorn main:app --reload
```
服务将运行在: http://localhost:8000

### 前端frontend 5173
```bash
yarn 
yarn run dev
```
前端将运行在: http://localhost:5173

## 功能特性
- 富文本笔记编辑（使用Quill编辑器）
- 多种组件类型（笔记、图片、看板等）
- 组件拖拽布局

## 注意
- 此项目为个人学习，勉强的milanote平替，还有很多功能没有完善。
- 后端API非常的简单，没有做任何的安全验证，仅用于学习和json存储数据。
- 组件的缩放功能也没有特别好的实现。
- 新建board时，中文会调用百度翻译接口，用于匹配emoji，需要自己去申请key。
- 项目结构非常的简单，没有做任何的优化，仅供学习和参考。


## 技术栈
### 前端
- Vue 3 + TypeScript
- Pinia状态管理
- Element Plus UI组件库
- Quill富文本编辑器
- Vite构建工具

### 后端
- FastAPI
- Python 3

## 项目结构
src/
├── assets/          # 静态资源
├── components/      # 公共组件
│   └── simoocoms/   # Simoo专用组件
├── router/          # 路由配置
├── stores/          # Pinia状态管理
├── views/           # 页面视图
└── utils/           # 工具函数

### 数据存储 非常草率
- 组件数据通过Pinia管理
- 自动保存功能通过 autoSavePlugin 实现
- 后端API提供文件持久化存储