import axios from 'axios';
import { ElMessage } from 'element-plus';

const axiosIns = axios.create({
    baseURL: '', // 替换为你的 API 基础 URL
    timeout: 3000, // 请求超时时间
});

// 请求拦截器
axiosIns.interceptors.request.use(
    (config) => {
        // 在发送请求之前显示加载提示
        // ElMessage.loading({
        //     message: '请求中...',
        //     duration: 0
        // });
        // 例如，添加请求头
        config.headers['Authorization'] = 'Bearer your_token';
        return config;
    },
    (error) => {
        // 对请求错误做些什么
        ElMessage.error('请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
axiosIns.interceptors.response.use(
    (response) => {
        // 隐藏加载提示
        ElMessage.closeAll();
        // 对响应数据做点什么
        ElMessage.success('请求成功');
        return response.data;
    },
    (error) => {
        // 隐藏加载提示
        ElMessage.closeAll();
        // 对响应错误做些什么
        ElMessage.error('响应错误');
        console.log(error);
        // ElMessage.error('响应错误:', error.response.data.detail);
        return Promise.reject(error);
    }
);

export default axiosIns;