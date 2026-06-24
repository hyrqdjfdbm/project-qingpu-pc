import axios from 'axios';
import { message } from 'ant-design-vue';

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 15000
});

request.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body.code !== 0) {
      message.error(body.message || '请求失败');
      return Promise.reject(new Error(body.message));
    }
    return body.data;
  },
  (err) => {
    const msg = err.response?.data?.message || err.message || '网络错误';
    message.error(msg);
    return Promise.reject(err);
  }
);

export default request;
